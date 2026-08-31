import { getServerLang } from "@/lib/i18n/lang-server";
import { t } from "@/lib/i18n/dictionary";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function TermsPage() {
  const lang = await getServerLang();
  const sq = lang === "sq";
  return (
    <main className="min-h-screen bg-[#f7f7f4]">
      <header className="border-b border-black/8 bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5"><Link href="/" className="flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16}/> {t(lang, "nav_home")}</Link><LanguageSwitcher/></div></header>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-4xl font-black tracking-[-.05em]">{sq ? "Kushtet e P\u00ebrdorimit" : "Terms of Service"}</h1>
        <p className="mt-3 rounded-2xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-900">{t(lang, "legal_draft_note")}</p>
        <div className="mt-6 space-y-6 rounded-[2rem] border border-black/8 bg-white p-6 text-sm leading-6 text-black/70 md:p-8">
          {sq ? (<>
            <p><b>1. Rreth Kerreore.</b> Kerreore \u00ebsht\u00eb nj\u00eb platform\u00eb q\u00eb lidh pronar\u00eb automjetesh ("ofrues") me qiramarr\u00ebs p\u00ebr qira makinash me or\u00eb n\u00eb Kosov\u00eb. Kerreore nuk \u00ebsht\u00eb pron\u00ebtar i asnj\u00ebrit automjet t\u00eb listuar dhe nuk \u00ebsht\u00eb pal\u00eb n\u00eb marr\u00ebveshjen e qiras\u00eb midis ofruesit dhe qiramarr\u00ebsit.</p>
            <p><b>2. Llogaria juaj.</b> Duhet t\u00eb jeni t\u00eb pakt\u00eb 18 vje\u00e7 dhe t\u00eb keni patent\u00eb t\u00eb vlefshme shofer\u00eb p\u00ebr t\u00eb qir\u00ebn nj\u00eb automjet. Jeni p\u00ebrgjegj\u00ebs p\u00ebr saktsin\u00ebn e informacionit t\u00eb dh\u00ebn\u00eb dhe p\u00ebr sigurin\u00eb e llogaris\u00eb suaj.</p>
            <p><b>3. Rezervimet dhe pagesat.</b> Rezervimet konfirmohen nga ofruesi. \u00c7mimet shfaqen n\u00eb euro dhe llogariten sipas or\u00ebve t\u00eb zgjedhura. Pagesa mund t\u00eb b\u00ebhet me kart\u00eb/bank\u00eb, para n\u00eb dor\u00eb, ose transfert\u00eb bankare, sipas asaj q\u00eb zgjidhni.</p>
            <p><b>4. Depozita e siguris\u00eb.</b> Disa automjete k\u00ebrkojn\u00eb nj\u00eb depozit\u00eb sigurie q\u00eb mbahet gjat\u00eb qiras\u00eb dhe lirohet ose mbahet nga ofruesi n\u00eb baz\u00eb t\u00eb gjendjes s\u00eb automjetit n\u00eb kthim.</p>
            <p><b>5. Anulimet.</b> Rezervimet mund t\u00eb anulohen para se t\u00eb konfirmohen ose t\u00eb p\u00ebrfundoj\u00eb qiraja, sipas rregullave t\u00eb platform\u00ebs.</p>
            <p><b>6. Sjellja dhe konfliktet.</b> P\u00ebrdoruesit duhet t\u00eb komunikojn\u00eb me respekt. Konfliktet mund t\u00eb raportohen n\u00eb platform\u00eb dhe shqyrtohen nga administrata.</p>
            <p><b>7. Kufizimi i p\u00ebrgjegj\u00ebsis\u00eb.</b> Kerreore ofrohet "si \u00ebsht\u00eb" pa garanci. Kerreore nuk \u00ebsht\u00eb p\u00ebrgjegj\u00ebse p\u00ebr d\u00ebme, aksidente, ose mosp\u00ebrmbushje t\u00eb marr\u00ebveshjeve midis p\u00ebrdoruesve.</p>
            <p><b>8. Ndryshimet.</b> K\u00ebto kushte mund t\u00eb p\u00ebrdit\u00ebsohen. Vazhdimi i p\u00ebrdorimit t\u00eb platform\u00ebs nen\u00ebnkupton pranimin e ndryshimeve.</p>
          </>) : (<>
            <p><b>1. About Kerreore.</b> Kerreore is a platform connecting vehicle owners ("providers") with renters for hourly car rentals in Kosovo. Kerreore does not own any listed vehicle and is not a party to the rental agreement between provider and renter.</p>
            <p><b>2. Your account.</b> You must be at least 18 and hold a valid driver's license to rent a vehicle. You're responsible for the accuracy of the information you provide and for keeping your account secure.</p>
            <p><b>3. Bookings and payments.</b> Bookings are confirmed by the provider. Prices are shown in euros and calculated by the hours selected. Payment can be made by card/bank, cash, or bank transfer, depending on your choice.</p>
            <p><b>4. Security deposit.</b> Some vehicles require a security deposit held during the rental and released or claimed by the provider based on the vehicle's condition on return.</p>
            <p><b>5. Cancellations.</b> Bookings can be cancelled before confirmation or completion per the platform's rules.</p>
            <p><b>6. Conduct and disputes.</b> Users must communicate respectfully. Disputes can be reported on the platform and are reviewed by admins.</p>
            <p><b>7. Limitation of liability.</b> Kerreore is provided "as is" with no warranty. Kerreore is not liable for damages, accidents, or breaches of agreements between users.</p>
            <p><b>8. Changes.</b> These terms may be updated. Continued use of the platform means you accept the changes.</p>
          </>)}
        </div>
      </section>
    </main>
  );
}
