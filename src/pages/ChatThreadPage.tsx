import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Paperclip, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
};

type Conv = {
  id: string;
  business_id: string;
  owner_id: string;
  listing_id: string | null;
  order_id: string | null;
  listings: { title: string; city: string; images: string[] } | null;
};

const labelDate = (d: Date) => isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMM d, yyyy");

const ChatThreadPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conv, setConv] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    let mounted = true;

    (async () => {
      const { data: c } = await supabase
        .from("conversations")
        .select("id,business_id,owner_id,listing_id,order_id,listings(title,city,images)")
        .eq("id", id)
        .maybeSingle();
      if (!mounted) return;
      setConv(c as any);

      const { data: m } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (mounted) setMessages((m as any) ?? []);

      // mark as read
      const isBusiness = c?.business_id === user.id;
      await supabase
        .from("conversations")
        .update(isBusiness ? { business_unread_count: 0 } : { owner_unread_count: 0 })
        .eq("id", id);
    })();

    const channel = supabase
      .channel(`thread-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [id, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (overrideContent?: string, attachment?: { url: string; name: string }) => {
    if (!user || !id) return;
    const content = overrideContent ?? text.trim();
    if (!content && !attachment) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: user.id,
      content: content || (attachment ? `📎 ${attachment.name}` : ""),
      attachment_url: attachment?.url ?? null,
      attachment_name: attachment?.name ?? null,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    if (!overrideContent) setText("");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !id) return;
    setUploading(true);
    const path = `${id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    await send("", { url: data.publicUrl, name: file.name });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // group messages by day
  const grouped: { day: string; items: Message[] }[] = [];
  messages.forEach((m) => {
    const day = labelDate(new Date(m.created_at));
    const last = grouped[grouped.length - 1];
    if (last && last.day === day) last.items.push(m);
    else grouped.push({ day, items: [m] });
  });

  if (!conv) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button>
        {conv.listings?.images?.[0] && <img src={conv.listings.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover" />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{conv.listings?.title ?? "Conversation"}</p>
          <p className="text-[11px] text-muted-foreground">{conv.listings?.city}{conv.order_id ? " · Order chat" : ""}</p>
        </div>
        {conv.order_id && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${conv.order_id}`)}>View order</Button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">Say hello — start the conversation 👋</div>
        ) : grouped.map((g) => (
          <div key={g.day}>
            <div className="text-center my-3">
              <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">{g.day}</span>
            </div>
            <div className="space-y-2">
              {g.items.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${mine ? "bg-accent text-accent-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                      {m.attachment_url && (
                        <a href={m.attachment_url} target="_blank" rel="noreferrer" className="block mb-1">
                          {/\.(png|jpe?g|gif|webp)$/i.test(m.attachment_url) ? (
                            <img src={m.attachment_url} alt={m.attachment_name ?? ""} className="rounded-lg max-h-48 object-cover" />
                          ) : (
                            <span className="text-xs underline">📎 {m.attachment_name}</span>
                          )}
                        </a>
                      )}
                      {m.content && <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>}
                      <p className={`text-[10px] mt-0.5 ${mine ? "text-accent-foreground/70" : "text-muted-foreground"}`}>{format(new Date(m.created_at), "h:mm a")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background p-3">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} accept="image/*,.pdf,.doc,.docx" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="p-2.5 rounded-xl border border-border hover:bg-muted disabled:opacity-50">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent max-h-32"
          />
          <Button onClick={() => send()} disabled={sending || !text.trim()} size="icon" className="rounded-xl">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatThreadPage;
