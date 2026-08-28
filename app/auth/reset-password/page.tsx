"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { useLang } from "@/lib/i18n/lang-client";
import { t } from "@/lib/i18n/dictionary";
import { translateError } from "@/lib/i18n/errors";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ResetPasswordPage() {
  const lang = useLang();
  const params = useSearchParams();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { setError(translateError(error.message, lang)); return; }
        setReady(true);
        return;
      }
      // Some Supabase configurations deliver the recovery session via the
      // implicit/hash flow instead of a `code` query param -- in that case
      // the browser client already picks up the session automatically, so
      // just confirm one exists before showing the form.
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
      else setError(t(lang, "reset_invalid_link"));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError(t(lang, "reset_too_short")); return; }
    if (password !== confirm) { setError(t(lang, "reset_mismatch")); return; }
    setBusy(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(translateError(error.message, lang)); setBusy(false); return; }
    setDone(true); setBusy(false);
    setTimeout(() => (window.location.href = "/login"), 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between">
          <a href="/" className="text-3xl font-black tracking-[-.07em]">kerreore<span className="text-lime-500">.</span></a>
          <LanguageSwitcher />
        </div>
        <div className="mt-10 rounded-[2rem] border border-black/8 bg-white p-7 shadow-sm">
          <h1 className="text-3xl font-black tracking-[-.05em]">{t(lang, "reset_title")}</h1>
          <p className="mt-2 text-sm text-black/50">{t(lang, "reset_subtitle")}</p>

          {done ? (
            <p className="mt-7 rounded-xl bg-lime-50 p-4 text-sm font-semibold text-green-800">{t(lang, "reset_success")}</p>
          ) : ready ? (
            <form onSubmit={submit} className="mt-7 space-y-4">
              <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} type="password" placeholder={t(lang, "reset_new_password")} className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 outline-none" />
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} type="password" placeholder={t(lang, "reset_confirm_password")} className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 outline-none" />
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
              <button disabled={busy} className="w-full rounded-2xl bg-black py-3.5 font-black text-white disabled:opacity-50">{busy ? t(lang, "login_please_wait") : t(lang, "reset_submit")}</button>
            </form>
          ) : (
            <div className="mt-7">
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
              <a href="/login" className="mt-4 block text-center text-sm font-bold underline">{t(lang, "reset_back_to_login")}</a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
