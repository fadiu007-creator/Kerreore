import { getServerLang } from "@/lib/i18n/lang-server";
import { t } from "@/lib/i18n/dictionary";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function PrivacyPage() {
  const lang = await getServerLang();
  const sq = lang === "sq";
  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <header className="border-b border-black/8 bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5"><Link href="/" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "nav_home")}</Link><LanguageSwitcher/></div></header>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-4xl font-black tracking-[-.05em]">{sq ? "Politika e Privat\u00ebsis\u00eb" : "Privacy Policy"}</h1>
        <p className="mt-3 rounded-2xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-900">{t(lang, "legal_draft_note")}</p>
        <div className="mt-6 space-y-6 rounded-[2rem] border border-black/8 bg-white p-6 text-sm leading-6 text-black/70 md:p-8">
          {sq ? (<>
            <p><b>1. T\u00eb dh\u00ebnat q\u00eb mbledhim.</b> Emri, email-i, t\u00eb dh\u00ebnat e automjetit, t\u00eb dh\u00ebnat bankare (p\u00ebr ofrues), historiku i rezervimeve, mesazhet midis p\u00ebrdoruesve, dhe dokumentet e identitetit q\u00eb ngarkoni vullnetarisht p\u00ebr verifikim.</p>
            <p><b>2. Si i p\u00ebrdorim.</b> P\u00ebr t\u00eb mundsuar rezervimet, pagesat, komunikimin midis p\u00ebrdoruesve, dhe p\u00ebr t\u00eb mbajtur platform\u00ebn t\u00eb sigurt.</p>
            <p><b>3. Dokumentet e identitetit.</b> Ruajtur n\u00eb mag\u00ebmizim privat, t\u00eb aksesueshme vet\u00ebm nga ju dhe administrata, jo publikisht.</p>
            <p><b>4. Ndarja e t\u00eb dh\u00ebnave.</b> Nuk i shesim t\u00eb dh\u00ebnat tuaja. T\u00eb dh\u00ebnat e pages\u00ebs p\u00ebrpunohen nga ofruesi i pages\u00ebs (Paysera). T\u00eb dh\u00ebnat bankare t\u00eb ofruesit shfaqen vet\u00ebm te qiramarr\u00ebsi q\u00eb zgjedh transfert\u00eb bankare.</p>
            <p><b>5. Ruajtja.</b> T\u00eb dh\u00ebnat ruhen p\u00ebr sa koh\u00eb keni llogari aktive, ose sipas k\u00ebrkesave ligjore.</p>
            <p><b>6. Të drejtat tuaja.</b> Mund t\u00eb k\u00ebrkoni akses, korrigjim ose fshirje t\u00eb t\u00eb dh\u00ebnave tuaja duke kontaktuar administrat\u00ebn.</p>
            <p><b>7. Kontakti.</b> P\u00ebr pyetje rreth privat\u00ebsis\u00eb, kontaktoni administrat\u00ebn e Kerreore.</p>
          </>) : (<>
            <p><b>1. Data we collect.</b> Name, email, vehicle details, bank details (for providers), booking history, messages between users, and identity documents you voluntarily upload for verification.</p>
            <p><b>2. How we use it.</b> To enable bookings, payments, communication between users, and to keep the platform safe.</p>
            <p><b>3. Identity documents.</b> Stored in a private bucket, accessible only by you and admins, never public.</p>
            <p><b>4. Data sharing.</b> We don't sell your data. Payment data is processed by our payment provider (Paysera). A provider's bank details are only shown to the renter who selects bank transfer.</p>
            <p><b>5. Retention.</b> Data is kept for as long as your account is active, or as required by law.</p>
            <p><b>6. Your rights.</b> You may request access, correction, or deletion of your data by contacting the Kerreore admin.</p>
            <p><b>7. Contact.</b> For privacy questions, contact the Kerreore admin.</p>
          </>)}
        </div>
      </section>
    </main>
  );
}
