"use client";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { useLang } from "@/lib/i18n/lang-client";
import { t } from "@/lib/i18n/dictionary";

const TITLE_KEY: Record<string, string> = {
  booking_new: "notif_booking_new",
  booking_confirmed: "notif_booking_confirmed",
  booking_cancelled: "notif_booking_cancelled",
  message: "notif_message",
  dispute_open: "notif_dispute_open",
  dispute_resolved: "notif_dispute_resolved",
  id_verified: "notif_id_verified",
  id_rejected: "notif_id_rejected",
};

export default function NotificationBell() {
  const lang = useLang();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("kerreore_notifications").select("id,type,body,link,read,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15);
    setRows(data ?? []);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("click", onClick);
    return () => { clearInterval(interval); document.removeEventListener("click", onClick); };
  }, []);

  const unread = rows.filter((r) => !r.read).length;

  async function openNotif(n: any) {
    if (!n.read) await supabase.from("kerreore_notifications").update({ read: true }).eq("id", n.id);
    if (n.link) window.location.href = n.link;
  }
  async function markAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("kerreore_notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    load();
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative rounded-full border border-black/10 bg-white p-2.5">
        <Bell size={16}/>
        {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-black/10 bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-black uppercase tracking-wide text-black/40">{t(lang, "notif_title")}</p>
            {unread > 0 && <button onClick={markAll} className="text-xs font-bold underline">{t(lang, "notif_mark_all")}</button>}
          </div>
          <div className="mt-2 max-h-80 space-y-1 overflow-y-auto">
            {rows.map((n) => (
              <button key={n.id} onClick={() => openNotif(n)} className={`block w-full rounded-xl p-3 text-left text-sm ${n.read ? "text-black/50" : "bg-[#f7f7f4] font-bold"}`}>
                <p>{t(lang, TITLE_KEY[n.type] || n.type)}</p>
                {n.body && <p className="mt-0.5 text-xs text-black/45">{n.body}</p>}
              </button>
            ))}
            {!rows.length && <p className="p-3 text-center text-xs text-black/45">{t(lang, "notif_none")}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
