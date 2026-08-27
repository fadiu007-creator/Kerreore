"use client";
import { useEffect, useState } from "react";
import { DEFAULT_LANG, LANG_COOKIE, type Lang } from "./dictionary";

export function getCookieLang(): Lang {
  if (typeof document === "undefined") return DEFAULT_LANG;
  const m = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=(sq|en)`));
  return m ? (m[1] as Lang) : DEFAULT_LANG;
}

export function setCookieLang(l: Lang) {
  document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000`;
  // Full reload so server-rendered pages (which read the cookie directly)
  // re-render in the newly selected language too, not just this client page.
  window.location.reload();
}

/** Client components default-render in "sq" (matching the server's default)
 * then sync to the real cookie value on mount, avoiding a hydration
 * mismatch while still respecting a previously chosen "en". */
export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  useEffect(() => setLang(getCookieLang()), []);
  return lang;
}
