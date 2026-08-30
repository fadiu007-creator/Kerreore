import type { Lang } from "./dictionary";

/**
 * Translates a raw error (from Supabase Auth, PostgREST, or one of our own
 * `raise exception` messages in a database function) into a short, friendly,
 * bilingual message. Never show a raw database/driver error to the user --
 * unrecognized messages fall back to a generic "something went wrong"
 * message instead of leaking internals like constraint names or SQL detail.
 */
export function translateError(raw: string | null | undefined, lang: Lang): string {
  const m = (raw || "").toLowerCase();
  const sq = lang === "sq";

  const rules: [RegExp, string, string][] = [
    [/rate limit|too many requests|too many email/, "Shum\u00eb k\u00ebrkesa me email. Ju lutem prisni para se t\u00eb k\u00ebrkoni nj\u00eb email tjet\u00ebr konfirmimi ose rivendosjeje.", "Too many email requests. Please wait before requesting another confirmation or reset email."],
    [/invalid login credentials/, "Email-i ose fjalkalimi \u00ebsht\u00eb i gabuar. N\u00ebse ke tashm\u00eb llogari, p\u00ebrdor Identifikohu ose Harrove fjalkalimin n\u00eb vend t\u00eb krijimit t\u00eb nj\u00eb llogarie t\u00eb re.", "Email or password is incorrect. If you already have an account, use Sign in or Forgot password instead of creating a new account."],
    [/user already registered|already registered/, "Ky email \u00ebsht\u00eb tashm\u00eb i regjistruar. Provo t\u00eb identifikohesh n\u00eb vend t\u00eb kesaj.", "This email is already registered. Try signing in instead."],

    [/vehicle is already booked/, "Kjo makin\u00eb \u00ebsht\u00eb e rezervuar tashm\u00eb p\u00ebr k\u00ebt\u00eb koh\u00eb.", "This vehicle is already booked for that time."],
    [/outside provider availability/, "Ky orar \u00ebsht\u00eb jasht\u00eb disponueshm\u00ebris\u00eb s\u00eb ofruesit.", "That time is outside the provider's availability."],
    [/between 1 and 24 hours/, "Rezervimet duhet t\u00eb jen\u00eb midis 1 dhe 24 or\u00ebsh.", "Bookings must be between 1 and 24 hours."],
    [/start and end on the same day/, "Rezervimi duhet t\u00eb filloj\u00eb dhe t\u00eb mbaroj\u00eb t\u00eb nj\u00ebjt\u00ebn dit\u00eb.", "The booking must start and end on the same day."],
    [/start in the future/, "Rezervimi duhet t\u00eb filloj\u00eb n\u00eb t\u00eb ardhmen.", "The booking must start in the future."],
    [/end time must be after start time/, "Ora e mbarimit duhet t\u00eb jet\u00eb pas or\u00ebs s\u00eb fillimit.", "End time must be after start time."],
    [/vehicle is not available/, "Kjo makin\u00eb nuk \u00ebsht\u00eb e disponueshme.", "This vehicle is not available."],
    [/cannot book your own vehicle/, "Nuk mund t\u00eb rezervosh makin\u00ebn t\u00ebnde.", "You cannot book your own vehicle."],
    [/invalid provider status transition/, "Ky veprim s'lejohet p\u00ebr ofruesin n\u00eb k\u00ebt\u00eb status rezervimi.", "That action isn't allowed for this booking's current status."],
    [/invalid renter cancellation/, "Ky rezervim nuk mund t\u00eb anulohet n\u00eb k\u00ebt\u00eb status.", "This booking can't be cancelled in its current status."],
    [/already paid/, "Ky rezervim \u00ebsht\u00eb paguar tashm\u00eb.", "This booking has already been paid."],
    [/not configured/, "Pagesat nuk jan\u00eb aktivizuar ende. Kontakto administrat\u00ebn.", "Payments aren't enabled yet. Please contact the administrator."],
    [/booking must be completed to leave a review/, "Vler\u00ebsimi lejohet vet\u00ebm pas p\u00ebrfundimit t\u00eb qiras\u00eb.", "You can only review a rental after it's completed."],
    [/booking is not completed yet/, "Qiraja ende nuk ka p\u00ebrfunduar.", "This rental isn't finished yet."],
    [/invalid rating/, "Vler\u00ebsimi duhet t\u00eb jet\u00eb midis 1 dhe 5.", "Rating must be between 1 and 5."],
    [/message cannot be empty/, "Mesazhi nuk mund t\u00eb jet\u00eb bosh.", "Message cannot be empty."],
    [/dispute already open/, "Ka tashm\u00eb nj\u00eb konflikt t\u00eb hapur p\u00ebr k\u00ebt\u00eb rezervim.", "There's already an open dispute for this booking."],
    [/a reason is required/, "Duhet nj\u00eb arsye.", "A reason is required."],
    [/invalid deposit status/, "Depozita nuk \u00ebsht\u00eb n\u00eb status t\u00eb duhur p\u00ebr k\u00ebt\u00eb veprim.", "The deposit isn't in the right status for that action."],
    [/user not found/, "P\u00ebrdoruesi nuk u gjet.", "User not found."],
    [/booking not found/, "Rezervimi nuk u gjet.", "Booking not found."],
    [/not authorized/, "Nuk ke autorizim p\u00ebr k\u00ebt\u00eb veprim.", "You're not authorized to do that."],
    [/authentication required/, "Duhet t\u00eb identifikohesh p\u00ebr k\u00ebt\u00eb veprim.", "You need to sign in to do that."],

    [/violates check constraint|violates.*constraint/, "Disa nga vlerat e futura nuk jan\u00eb t\u00eb vlefshme. Kontrollo t\u00eb dh\u00ebnat dhe provo p\u00ebrs\u00ebri.", "Some of the entered values aren't valid. Please check the details and try again."],
    [/duplicate key|already exists/, "Ky rekord ekziston tashm\u00eb.", "This record already exists."],
    [/permission denied|row-level security|rls/, "Nuk ke leje p\u00ebr k\u00ebt\u00eb veprim.", "You don't have permission to do that."],
    [/jwt|session/, "Sesioni yt ka skaduar. Identifikohu p\u00ebrs\u00ebri.", "Your session has expired. Please sign in again."],
    [/network|fetch failed|failed to fetch/, "Problem lidhjeje. Kontrollo internetin dhe provo p\u00ebrs\u00ebri.", "Connection problem. Check your internet and try again."],
  ];

  for (const [pattern, sqMsg, enMsg] of rules) {
    if (pattern.test(m)) return sq ? sqMsg : enMsg;
  }
  return sq ? "Di\u00e7ka shkoi keq. Provo p\u00ebrs\u00ebri." : "Something went wrong. Please try again.";
}
