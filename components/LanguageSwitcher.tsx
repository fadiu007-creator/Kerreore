"use client";
import { useEffect, useState } from "react";
import { getCookieLang, setCookieLang } from "@/lib/i18n/lang-client";
import type { Lang } from "@/lib/i18n/dictionary";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang>("sq");
  useEffect(() => setLang(getCookieLang()), []);
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-black/10 bg-white p-1 text-xs font-black">
      {(["sq", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setCookieLang(l)}
          aria-label={l === "sq" ? "Shqip" : "English"}
          className={`rounded-full px-2.5 py-1.5 uppercase transition ${lang === l ? "bg-black text-white" : "text-black/40"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
