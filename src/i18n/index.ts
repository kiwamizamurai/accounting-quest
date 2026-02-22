import ja from './ja.json';
import en from './en.json';

export type Language = 'ja' | 'en';

const translations: Record<Language, Record<string, string>> = { ja, en };
let currentLanguage: Language = 'ja';

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, params?: Record<string, string | number>): string {
  let text = translations[currentLanguage][key] || translations['en'][key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }

  return text;
}
