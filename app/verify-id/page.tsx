"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { useLang } from "@/lib/i18n/lang-client";
import { t } from "@/lib/i18n/dictionary";
import { translateError } from "@/lib/i18n/errors";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function VerifyIdPage() {
  const lang = useLang();
  const supabase = createClient();
  const [status, setStatus] = useState("unverified");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.href = "/login"; return; }
    const { data } = await supabase.from("kerreore_profiles").select("id_verification_status").eq("id", user.id).single();
    setStatus(data?.id_verification_status ?? "unverified");
    setLoading(false);
  })(); }, []);

  async function submit() {
    if (!file) return;
    setBusy(true); setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const up = await supabase.storage.from("kerreore-id-documents").upload(path, file, { contentType: file.type });
    if (up.error) { setMsg(translateError(up.error.message, lang)); setBusy(false); return; }
    const { error } = await supabase.rpc("kerreore_submit_id_verification", { p_storage_path: path });
    if (error) setMsg(translateError(error.message, lang));
    else { setStatus("pending"); setMsg(t(lang, "verify_submitted")); }
    setBusy(false);
  }

  if (loading) return <main className="grid min-h-screen place-items-center">{t(lang, "car_loading")}</main>;

  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <header className="border-b border-black/8 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-5">
          <Link href="/bookings" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "nav_bookings")}</Link>
          <LanguageSwitcher />
        </div>
      </header>
      <section className="mx-auto max-w-2xl px-5 py-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-black/40">{t(lang, "verify_label")}</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-.05em]"><ShieldCheck className="mr-2 inline" size={30}/>{t(lang, "verify_title")}</h1>
        <p className="mt-3 text-black/50">{t(lang, "verify_subtitle")}</p>
        <div className="mt-8 rounded-[2rem] border border-black/8 bg-white p-6">
          <span className={`rounded-full px-3 py-1.5 text-xs font-black ${status === "verified" ? "bg-green-100 text-green-800" : status === "pending" ? "bg-yellow-100 text-yellow-800" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-[#f5f5f0]"}`}>{t(lang, `verify_status_${status}`)}</span>
          {(status === "unverified" || status === "rejected") && (
            <div className="mt-5">
              <label className="inline-block cursor-pointer rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3 font-bold">
                <Upload className="mr-2 inline" size={16}/>{file ? file.name : t(lang, "verify_choose_file")}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)}/>
              </label>
              {msg && <p className="mt-4 rounded-2xl bg-[#f5f5f0] p-4 text-sm font-bold">{msg}</p>}
              <button disabled={!file || busy} onClick={submit} className="mt-4 w-full rounded-2xl bg-black py-4 font-black text-white disabled:opacity-50">{busy ? t(lang, "verify_submitting") : t(lang, "verify_submit")}</button>
            </div>
          )}
          {status === "pending" && msg && <p className="mt-4 rounded-2xl bg-[#f5f5f0] p-4 text-sm font-bold">{msg}</p>}
        </div>
      </section>
    </main>
  );
}
