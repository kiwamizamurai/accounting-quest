import ja from './ja.json';
import en from './en.json';
import { Language, getLanguage } from './language';
import { formatMoney } from '../utils/MoneyFormatter';

export type { Language };
export { getLanguage, setLanguage } from './language';

const translations: Record<Language, Record<string, string>> = { ja, en };

/**
 * Look up a text and fill `{name}` placeholders from `params` (every occurrence).
 * `{name:money}` writes the number as an amount with the currency of the current language.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const text = translations[getLanguage()][key] || translations['en'][key] || key;

  if (!params) return text;

  return text.replace(/\{(\w+)(?::(\w+))?\}/g, (placeholder, name: string, format?: string) => {
    if (!(name in params)) return placeholder;
    const value = params[name];
    return format === 'money' ? formatMoney(Number(value)) : String(value);
  });
}
