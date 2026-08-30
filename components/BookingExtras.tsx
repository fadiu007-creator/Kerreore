"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Camera, MessageCircle, Send, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { t } from "@/lib/i18n/dictionary";
import type { Lang } from "@/lib/i18n/dictionary";
import { translateError } from "@/lib/i18n/errors";

type Props = {
  bookingId: string;
  lang: Lang;
  role: "renter" | "owner";
  status: string;
  endsAt: string;
  disputeStatus: string;
  depositAmount: number;
  depositStatus: string;
  onChanged?: () => void;
};

export default function BookingExtras({ bookingId, lang, role, status, endsAt, disputeStatus, depositAmount, depositStatus, onChanged }: Props) {
  const supabase = createClient();
  const [tab, setTab] = useState<"messages" | "photos" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [photos, setPhotos] = useState<{ id: string; stage: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [myReview, setMyReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimNote, setClaimNote] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    const { data: rev } = await supabase.from("kerreore_reviews").select("*").eq("booking_id", bookingId).eq("reviewer_id", user?.id ?? "").maybeSingle();
    setMyReview(rev ?? null);
  })(); }, [bookingId]);

  async function loadMessages() {
    const { data } = await supabase.from("kerreore_messages").select("id,sender_id,body,created_at").eq("booking_id", bookingId).order("created_at");
    setMessages(data ?? []);
  }
  async function loadPhotos() {
    const { data } = await supabase.from("kerreore_booking_photos").select("id,stage,storage_path").eq("booking_id", bookingId).order("created_at");
    const withUrls = await Promise.all((data ?? []).map(async (p) => {
      const { data: signed } = await supabase.storage.from("kerreore-booking-photos").createSignedUrl(p.storage_path, 3600);
      return { id: p.id, stage: p.stage, url: signed?.signedUrl ?? "" };
    }));
    setPhotos(withUrls);
  }

  async function openTab(next: "messages" | "photos") {
    setTab(tab === next ? null : next);
    if (next === "messages") await loadMessages();
    if (next === "photos") await loadPhotos();
  }

  async function sendMessage() {
    if (!draft.trim() || !userId) return;
    const { error } = await supabase.from("kerreore_messages").insert({ booking_id: bookingId, sender_id: userId, body: draft.trim() });
    if (error) setMsg(translateError(error.message, lang));
    else { setDraft(""); loadMessages(); }
  }

  async function uploadPhoto(stage: "pickup" | "return", file: File) {
    if (!userId) return;
    setUploading(true);
    const path = `${bookingId}/${stage}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const up = await supabase.storage.from("kerreore-booking-photos").upload(path, file, { contentType: file.type });
    if (up.error) { setMsg(translateError(up.error.message, lang)); setUploading(false); return; }
    const { error } = await supabase.from("kerreore_booking_photos").insert({ booking_id: bookingId, uploader_id: userId, stage, storage_path: path });
    if (error) setMsg(translateError(error.message, lang));
    await loadPhotos();
    setUploading(false);
  }

  async function submitReview() {
    const { data, error } = await supabase.rpc("kerreore_submit_review", { p_booking_id: bookingId, p_rating: rating, p_comment: comment || null });
    if (error) setMsg(translateError(error.message, lang));
    else { setMyReview(data); setMsg(t(lang, "review_submitted")); }
  }

  async function submitDispute() {
    const { error } = await supabase.rpc("kerreore_open_dispute", { p_booking_id: bookingId, p_reason: disputeReason });
    if (error) setMsg(translateError(error.message, lang));
    else { setMsg(t(lang, "dispute_opened")); setDisputeOpen(false); onChanged?.(); }
  }

  async function releaseDeposit() {
    const { error } = await supabase.rpc("kerreore_release_deposit", { p_booking_id: bookingId });
    setMsg(error ? translateError(error.message, lang) : t(lang, "deposit_released"));
    onChanged?.();
  }
  async function claimDeposit() {
    const { error } = await supabase.rpc("kerreore_claim_deposit", { p_booking_id: bookingId, p_note: claimNote });
    setMsg(error ? translateError(error.message, lang) : t(lang, "deposit_claimed"));
    setClaimOpen(false);
    onChanged?.();
  }

  const completed = status === "confirmed" && new Date(endsAt) < new Date();

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button onClick={() => openTab("messages")} className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 font-bold"><MessageCircle size={13}/> {t(lang, "msg_toggle")}</button>
        <button onClick={() => openTab("photos")} className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 font-bold"><Camera size={13}/> {t(lang, "photos_pickup")}/{t(lang, "photos_return")}</button>
        {depositAmount > 0 && (
          <span className="rounded-full bg-[#f5f5f0] px-3 py-1.5 font-bold">{t(lang, "deposit_label")}: \u20ac{depositAmount} \u00b7 {t(lang, `deposit_${depositStatus}`)}</span>
        )}
        {disputeStatus === "open" && <span className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 font-bold text-red-700"><AlertTriangle size={13}/> {t(lang, "dispute_open_badge")}</span>}
        {disputeStatus === "resolved" && <span className="rounded-full bg-[#f5f5f0] px-3 py-1.5 font-bold">{t(lang, "dispute_resolved_badge")}</span>}
        {disputeStatus === "none" && (status === "confirmed" || status === "pending") && !disputeOpen && (
          <button onClick={() => setDisputeOpen(true)} className="rounded-full border border-red-200 px-3 py-1.5 font-bold text-red-700">{t(lang, "dispute_report")}</button>
        )}
        {role === "owner" && depositStatus === "held" && (
          <>
            <button onClick={releaseDeposit} className="rounded-full bg-[#b7ff3c] px-3 py-1.5 font-bold">{t(lang, "deposit_release")}</button>
            {!claimOpen && <button onClick={() => setClaimOpen(true)} className="rounded-full border border-red-200 px-3 py-1.5 font-bold text-red-700">{t(lang, "deposit_claim")}</button>}
          </>
        )}
      </div>

      {msg && <p className="rounded-xl bg-[#f5f5f0] p-3 text-xs font-bold">{msg}</p>}

      {disputeOpen && (
        <div className="flex gap-2">
          <input value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder={t(lang, "dispute_reason_ph")} className="flex-1 rounded-xl border border-black/10 bg-[#f7f7f4] p-3 text-sm"/>
          <button onClick={submitDispute} className="rounded-xl bg-black px-4 py-2 text-xs font-black text-white">{t(lang, "dispute_submit")}</button>
        </div>
      )}
      {claimOpen && (
        <div className="flex gap-2">
          <input value={claimNote} onChange={(e) => setClaimNote(e.target.value)} placeholder={t(lang, "deposit_claim_note_ph")} className="flex-1 rounded-xl border border-black/10 bg-[#f7f7f4] p-3 text-sm"/>
          <button onClick={claimDeposit} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white">{t(lang, "deposit_claim")}</button>
        </div>
      )}

      {tab === "messages" && (
        <div className="rounded-2xl bg-[#f7f7f4] p-4">
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${m.sender_id === userId ? "ml-auto bg-black text-white" : "bg-white"}`}>{m.body}</div>
            ))}
            {!messages.length && <p className="text-xs text-black/45">{t(lang, "msg_none")}</p>}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={t(lang, "msg_placeholder")} className="flex-1 rounded-xl border border-black/10 bg-white p-3 text-sm"/>
            <button onClick={sendMessage} className="rounded-xl bg-black px-4 py-2 text-white"><Send size={14}/></button>
          </div>
        </div>
      )}

      {tab === "photos" && (
        <div className="rounded-2xl bg-[#f7f7f4] p-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
            {(["pickup", "return"] as const).map((stage) => (
              <div key={stage}>
                <p className="text-xs font-black">{t(lang, `photos_${stage}`)}</p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {photos.filter((p) => p.stage === stage).map((p) => <img key={p.id} src={p.url} alt="" className="aspect-square rounded-lg object-cover"/>)}
                </div>
                <label className="mt-2 inline-block cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-bold">
                  {uploading ? t(lang, "photos_uploading") : t(lang, "photos_upload")}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadPhoto(stage, e.target.files[0])}/>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed && (
        <div className="rounded-2xl bg-[#f7f7f4] p-4">
          {myReview ? (
            <p className="text-xs font-bold">{t(lang, "review_already")}: {"\u2605".repeat(myReview.rating)}{"\u2606".repeat(5 - myReview.rating)}</p>
          ) : (
            <>
              <p className="text-xs font-black">{t(lang, "review_title")}</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)}><Star size={20} fill={n <= rating ? "currentColor" : "none"}/></button>
                ))}
              </div>
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t(lang, "review_placeholder")} className="mt-2 w-full rounded-xl border border-black/10 bg-white p-3 text-sm"/>
              <button onClick={submitReview} className="mt-2 rounded-xl bg-black px-4 py-2 text-xs font-black text-white">{t(lang, "review_submit")}</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
