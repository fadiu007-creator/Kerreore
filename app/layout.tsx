import type { Metadata } from "next";
import "./globals.css";
import { getServerLang } from "@/lib/i18n/lang-server";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  return lang === "en"
    ? { title: "Kerreore \u2014 Rent a car by the hour", description: "Peer-to-peer hourly car rental made simple." }
    : { title: "Kerreore \u2014 Merr me qira makin\u00eb me or\u00eb", description: "Qira makinash me or\u00eb, person-me-person, e thjeshtuar." };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await getServerLang();
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
