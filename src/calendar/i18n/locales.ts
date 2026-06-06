import type { Locale } from "date-fns";
import {
  af,
  ar,
  az,
  bg,
  bn,
  ca,
  cs,
  da,
  de,
  el,
  enGB,
  enUS,
  es,
  et,
  eu,
  faIR,
  fi,
  fr,
  gl,
  he,
  hi,
  hr,
  hu,
  id,
  is,
  it,
  ja,
  ka,
  kk,
  ko,
  lt,
  lv,
  ms,
  nb,
  nl,
  pl,
  pt,
  ptBR,
  ro,
  ru,
  sk,
  sl,
  sq,
  sr,
  sv,
  th,
  tr,
  uk,
  vi,
  zhCN,
  zhTW,
} from "date-fns/locale";

export interface ILanguage {
  /** BCP-47-ish code used as the persisted key. */
  code: string;
  /** Endonym — the language's name in its own script. */
  label: string;
  /** Matching date-fns locale (drives month/day names, ordering, week start). */
  locale: Locale;
  /** Text direction for the document. */
  dir: "ltr" | "rtl";
}

// The 50 most-spoken / most-used UI languages, each mapped to a date-fns locale.
// Date rendering (months, weekdays, week start, ordinals) localizes for ALL of
// these out of the box; UI string coverage lives in ./translations.
export const LANGUAGES: ILanguage[] = [
  { code: "en-US", label: "English (US)", locale: enUS, dir: "ltr" },
  { code: "en-GB", label: "English (UK)", locale: enGB, dir: "ltr" },
  { code: "de", label: "Deutsch", locale: de, dir: "ltr" },
  { code: "es", label: "Español", locale: es, dir: "ltr" },
  { code: "fr", label: "Français", locale: fr, dir: "ltr" },
  { code: "pt-BR", label: "Português (Brasil)", locale: ptBR, dir: "ltr" },
  { code: "pt", label: "Português", locale: pt, dir: "ltr" },
  { code: "it", label: "Italiano", locale: it, dir: "ltr" },
  { code: "nl", label: "Nederlands", locale: nl, dir: "ltr" },
  { code: "pl", label: "Polski", locale: pl, dir: "ltr" },
  { code: "ru", label: "Русский", locale: ru, dir: "ltr" },
  { code: "uk", label: "Українська", locale: uk, dir: "ltr" },
  { code: "tr", label: "Türkçe", locale: tr, dir: "ltr" },
  { code: "ar", label: "العربية", locale: ar, dir: "rtl" },
  { code: "he", label: "עברית", locale: he, dir: "rtl" },
  { code: "fa", label: "فارسی", locale: faIR, dir: "rtl" },
  { code: "hi", label: "हिन्दी", locale: hi, dir: "ltr" },
  { code: "bn", label: "বাংলা", locale: bn, dir: "ltr" },
  { code: "ja", label: "日本語", locale: ja, dir: "ltr" },
  { code: "ko", label: "한국어", locale: ko, dir: "ltr" },
  { code: "zh-CN", label: "简体中文", locale: zhCN, dir: "ltr" },
  { code: "zh-TW", label: "繁體中文", locale: zhTW, dir: "ltr" },
  { code: "id", label: "Bahasa Indonesia", locale: id, dir: "ltr" },
  { code: "ms", label: "Bahasa Melayu", locale: ms, dir: "ltr" },
  { code: "th", label: "ไทย", locale: th, dir: "ltr" },
  { code: "vi", label: "Tiếng Việt", locale: vi, dir: "ltr" },
  { code: "sv", label: "Svenska", locale: sv, dir: "ltr" },
  { code: "da", label: "Dansk", locale: da, dir: "ltr" },
  { code: "nb", label: "Norsk", locale: nb, dir: "ltr" },
  { code: "fi", label: "Suomi", locale: fi, dir: "ltr" },
  { code: "cs", label: "Čeština", locale: cs, dir: "ltr" },
  { code: "sk", label: "Slovenčina", locale: sk, dir: "ltr" },
  { code: "hu", label: "Magyar", locale: hu, dir: "ltr" },
  { code: "ro", label: "Română", locale: ro, dir: "ltr" },
  { code: "bg", label: "Български", locale: bg, dir: "ltr" },
  { code: "el", label: "Ελληνικά", locale: el, dir: "ltr" },
  { code: "hr", label: "Hrvatski", locale: hr, dir: "ltr" },
  { code: "sr", label: "Српски", locale: sr, dir: "ltr" },
  { code: "sl", label: "Slovenščina", locale: sl, dir: "ltr" },
  { code: "lt", label: "Lietuvių", locale: lt, dir: "ltr" },
  { code: "lv", label: "Latviešu", locale: lv, dir: "ltr" },
  { code: "et", label: "Eesti", locale: et, dir: "ltr" },
  { code: "ca", label: "Català", locale: ca, dir: "ltr" },
  { code: "eu", label: "Euskara", locale: eu, dir: "ltr" },
  { code: "gl", label: "Galego", locale: gl, dir: "ltr" },
  { code: "af", label: "Afrikaans", locale: af, dir: "ltr" },
  { code: "is", label: "Íslenska", locale: is, dir: "ltr" },
  { code: "sq", label: "Shqip", locale: sq, dir: "ltr" },
  { code: "az", label: "Azərbaycan", locale: az, dir: "ltr" },
  { code: "ka", label: "ქართული", locale: ka, dir: "ltr" },
  { code: "kk", label: "Қазақ", locale: kk, dir: "ltr" },
];

export const DEFAULT_LANGUAGE_CODE = "en-US";

export function getLanguage(code: string): ILanguage {
  return LANGUAGES.find(l => l.code === code) ?? LANGUAGES[0];
}
