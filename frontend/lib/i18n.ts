import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";

export type Language = "en" | "hi" | "mr";

export type Translation = typeof en;

const translations: Record<Language, any> = {
  en,
  hi,
  mr,
};

export function getTranslation(lang: Language = "en"): Translation {
  return translations[lang] || en;
}
