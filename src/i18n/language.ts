export type Language = 'ja' | 'en';

let currentLanguage: Language = 'ja';

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}
