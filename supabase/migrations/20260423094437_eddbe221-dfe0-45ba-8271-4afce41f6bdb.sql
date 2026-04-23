-- ============================================
-- PHASE 2: Bookings + Messaging + Notifications
-- ============================================

-- Order status enum
CREATE TYPE public.order_status AS ENUM (
  'pending',     -- Business requested, awaiting Owner decision
  'approved',    -- Owner accepted, awaiting payment
  'rejected',    -- Owner declined
  'paid',        -- Business paid, ready for printing
  'printing',    -- Printing in progress
  'installed',   -- Banner installed on billboard
  'live',        -- Campaign running
  'completed',   -- Campaign ended
  'cancelled'    -- Cancelled by either party
);

-- Notification type enum
CREATE TYPE public.notification_type AS ENUM (
  'order_request',
  'order_approved',
  'order_rejected',
  'order_paid',
  'order_status_change',
  'new_message',
  'system'
);

-- ============================================
-- ORDERS table — booking requests on listings
-- ============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,           -- buyer (auth.uid)
  owner_id UUID NOT NULL,              -- listing owner snapshot
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL,
  price_per_day INTEGER NOT NULL,
  total_cost INTEGER NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  creative_url TEXT,
  notes TEXT,
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_business ON public.orders(business_id);
CREATE INDEX idx_orders_owner ON public.orders(owner_id);
CREATE INDEX idx_orders_listing ON public.orders(listing_id);
CREATE INDEX idx_orders_status ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business or Owner view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = business_id OR auth.uid() = owner_id);

CREATE POLICY "Business creates own orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Business or Owner update own orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = business_id OR auth.uid() = owner_id);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CONVERSATIONS — chat threads (per order or per listing)
-- ============================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_preview TEXT,
  business_unread_count INTEGER NOT NULL DEFAULT 0,
  owner_unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conv_business ON public.conversations(business_id);
CREATE INDEX idx_conv_owner ON public.conversations(owner_id);
CREATE INDEX idx_conv_listing ON public.conversations(listing_id);
CREATE UNIQUE INDEX idx_conv_unique_per_listing ON public.conversations(listing_id, business_id, owner_id) WHERE order_id IS NULL;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = business_id OR auth.uid() = owner_id);

CREATE POLICY "Participants create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = business_id OR auth.uid() = owner_id);

CREATE POLICY "Participants update conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = business_id OR auth.uid() = owner_id);

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- MESSAGES — individual chat messages
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view messages"
  ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.owner_id = auth.uid())
  ));

CREATE POLICY "Participants send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.owner_id = auth.uid())
  ));

CREATE POLICY "Sender updates own messages"
  ON public.messages FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.owner_id = auth.uid())
  ));

-- Enable realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  related_conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notif_unread ON public.notifications(user_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Allow inserts from authenticated users (triggers/functions will create them on behalf of others)
CREATE POLICY "Authenticated can create notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================
-- LISTING AVAILABILITY — booked date ranges
-- ============================================
CREATE TABLE public.listing_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_bookings_listing ON public.listing_bookings(listing_id, start_date, end_date);

ALTER TABLE public.listing_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view listing bookings"
  ON public.listing_bookings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Owner or business can insert bookings"
  ON public.listing_bookings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = listing_bookings.order_id
      AND (o.business_id = auth.uid() OR o.owner_id = auth.uid())
  ));

CREATE POLICY "Owner or business can delete bookings"
  ON public.listing_bookings FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = listing_bookings.order_id
      AND (o.business_id = auth.uid() OR o.owner_id = auth.uid())
  ));

-- ============================================
-- HELPER: notify on new order
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_on_order_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  listing_title TEXT;
BEGIN
  SELECT title INTO listing_title FROM public.listings WHERE id = NEW.listing_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify the owner of new request
    INSERT INTO public.notifications (user_id, type, title, body, link, related_order_id)
    VALUES (
      NEW.owner_id,
      'order_request',
      'New booking request',
      'A business requested ' || COALESCE(listing_title, 'your listing') || ' for ' || NEW.duration_days || ' days.',
      '/vendor/orders/' || NEW.id,
      NEW.id
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, type, title, body, link, related_order_id)
      VALUES (NEW.business_id, 'order_approved', 'Booking approved',
        COALESCE(listing_title, 'Listing') || ' was approved. Complete payment to start printing.',
        '/orders/' || NEW.id, NEW.id);
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, type, title, body, link, related_order_id)
      VALUES (NEW.business_id, 'order_rejected', 'Booking rejected',
        COALESCE(NEW.rejection_reason, 'Owner could not accommodate your request.'),
        '/orders/' || NEW.id, NEW.id);
    ELSIF NEW.status = 'paid' THEN
      INSERT INTO public.notifications (user_id, type, title, body, link, related_order_id)
      VALUES (NEW.owner_id, 'order_paid', 'Payment received',
        'Payment received for ' || COALESCE(listing_title, 'listing') || '. Time to start printing.',
        '/vendor/orders/' || NEW.id, NEW.id);
    ELSE
      INSERT INTO public.notifications (user_id, type, title, body, link, related_order_id)
      VALUES (NEW.business_id, 'order_status_change', 'Order updated',
        'Status changed to ' || NEW.status::text,
        '/orders/' || NEW.id, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_order_event
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_order_event();

-- ============================================
-- HELPER: notify on new message + bump conversation
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv RECORD;
  recipient UUID;
BEGIN
  SELECT * INTO conv FROM public.conversations WHERE id = NEW.conversation_id;

  IF conv.business_id = NEW.sender_id THEN
    recipient := conv.owner_id;
    UPDATE public.conversations
      SET last_message_at = NEW.created_at,
          last_message_preview = LEFT(NEW.content, 120),
          owner_unread_count = owner_unread_count + 1
      WHERE id = NEW.conversation_id;
  ELSE
    recipient := conv.business_id;
    UPDATE public.conversations
      SET last_message_at = NEW.created_at,
          last_message_preview = LEFT(NEW.content, 120),
          business_unread_count = business_unread_count + 1
      WHERE id = NEW.conversation_id;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link, related_conversation_id)
  VALUES (recipient, 'new_message', 'New message', LEFT(NEW.content, 120),
    '/messages/' || NEW.conversation_id, NEW.conversation_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();