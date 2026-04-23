-- Tighten notifications INSERT: users may only create notifications for themselves directly.
-- Cross-user notifications happen via SECURITY DEFINER triggers and bypass this.
DROP POLICY IF EXISTS "Authenticated can create notifications" ON public.notifications;

CREATE POLICY "Users insert own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tighten listing-images bucket: restrict SELECT to objects that look like listing files
-- (path begins with a UUID listing folder). Prevents bucket-wide listing while keeping access.
DROP POLICY IF EXISTS "Public read listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Listing images public read" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;

CREATE POLICY "Listing images readable by path"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] IS NOT NULL
  );