import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, type Lang } from "./dictionary";

/** Server components/actions read the language from the same cookie the
 * client-side switcher writes to, so both halves of the app always agree. */
export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(LANG_COOKIE)?.value;
  return v === "en" ? "en" : DEFAULT_LANG;
}
