"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useLang } from "@/lib/i18n/lang-client";
import { t } from "@/lib/i18n/dictionary";
import { translateError } from "@/lib/i18n/errors";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const lang = useLang();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  function startCooldown(seconds = 30) {
    setCooldown(seconds);
    const timer = window.setInterval(() => setCooldown((v) => (v <= 1 ? (window.clearInterval(timer), 0) : v - 1)), 1000);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    const supabase = createClient();

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(translateError(error.message, lang)); setBusy(false); return; }
      const { data: profile } = await supabase.from("kerreore_profiles").select("role").eq("id", data.user.id).single();
      window.location.href = profile?.role === "owner" ? "/provider" : profile?.role === "admin" ? "/admin" : "/dashboard";
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setError(translateError(error.message, lang)); setBusy(false); return; }
    if (data.session) { window.location.href = "/dashboard"; return; }
    setMessage(t(lang, "login_msg_signup_sent")); startCooldown(); setBusy(false);
  }

  async function resend() {
    if (busy || cooldown) return;
    if (!email) { setError(t(lang, "login_enter_email_first")); return; }
    setBusy(true); setError(""); setMessage("");
    const { error } = await createClient().auth.resend({ type: "signup", email });
    if (error) setError(translateError(error.message, lang));
    else { setMessage(t(lang, "login_msg_resend_sent")); startCooldown(); }
    setBusy(false);
  }

  async function reset() {
    if (busy || cooldown) return;
    if (!email) { setError(t(lang, "login_enter_email_first")); return; }
    setBusy(true); setError(""); setMessage("");
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
    if (error) setError(translateError(error.message, lang));
    else { setMessage(t(lang, "login_msg_reset_sent")); startCooldown(); }
    setBusy(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between">
          <a href="/" className="text-3xl font-black tracking-[-.07em]">kerreore<span className="text-lime-500">.</span></a>
          <LanguageSwitcher />
        </div>
        <div className="mt-10 rounded-[2rem] border border-black/8 bg-white p-7 shadow-sm">
          <div className="mb-7 flex rounded-2xl bg-[#f5f5f0] p-1">
            <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className={`flex-1 rounded-xl py-2.5 text-sm font-black ${mode === "login" ? "bg-white shadow-sm" : "text-black/45"}`}>{t(lang, "login_tab_signin")}</button>
            <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className={`flex-1 rounded-xl py-2.5 text-sm font-black ${mode === "signup" ? "bg-white shadow-sm" : "text-black/45"}`}>{t(lang, "login_tab_signup")}</button>
          </div>
          <h1 className="text-3xl font-black tracking-[-.05em]">{mode === "login" ? t(lang, "login_welcome_back") : t(lang, "login_join")}</h1>
          <p className="mt-2 text-sm text-black/50">{mode === "login" ? t(lang, "login_subtitle_signin") : t(lang, "login_subtitle_signup")}</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && <input value={name} onChange={(e) => setName(e.target.value)} required placeholder={t(lang, "login_full_name")} className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 outline-none" />}
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder={t(lang, "login_email")} className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 outline-none" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} type="password" placeholder={t(lang, "login_password")} className="w-full rounded-2xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 outline-none" />
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-lime-50 p-3 text-sm font-semibold text-green-800">{message}</p>}
            <button disabled={busy} className="w-full rounded-2xl bg-black py-3.5 font-black text-white disabled:opacity-50">{busy ? t(lang, "login_please_wait") : mode === "login" ? t(lang, "login_sign_in") : t(lang, "login_create_account")}</button>
          </form>
          {mode === "login" && <div className="mt-5 grid gap-2 text-center text-xs">
            <button disabled={busy || !!cooldown} onClick={reset} className="font-bold underline">{cooldown ? t(lang, "login_wait_s", cooldown) : t(lang, "login_forgot_password")}</button>
            <button disabled={busy || !!cooldown} onClick={resend} className="font-bold underline">{cooldown ? t(lang, "login_resend_s", cooldown) : t(lang, "login_resend")}</button>
          </div>}
          <p className="mt-5 text-center text-xs text-black/40">{t(lang, "login_footer_note")}</p>
        </div>
      </div>
    </main>
  );
}
