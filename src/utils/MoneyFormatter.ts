import { getLanguage } from '../i18n/language';

/**
 * Currency unit shown after amounts: 円 in Japanese (matches the story text), G in English
 */
function currencyUnit(): string {
  return getLanguage() === 'ja' ? '円' : 'G';
}

/**
 * Format a number as currency
 */
export function formatMoney(amount: number, showSign: boolean = false): string {
  const formatted = new Intl.NumberFormat('ja-JP').format(Math.abs(amount));
  const unit = currencyUnit();

  if (showSign) {
    if (amount > 0) {
      return `+${formatted}${unit}`;
    } else if (amount < 0) {
      return `-${formatted}${unit}`;
    }
  }

  if (amount < 0) {
    return `-${formatted}${unit}`;
  }

  return `${formatted}${unit}`;
}

/**
 * Format an amount for a cell of a statement table: no unit (the table states it once), and a
 * negative amount as △50 in Japanese, the way a statement writes it, or -50 in English
 */
export function formatAmount(amount: number): string {
  const formatted = new Intl.NumberFormat('ja-JP').format(Math.abs(amount));
  if (amount < 0) {
    return getLanguage() === 'ja' ? `△${formatted}` : `-${formatted}`;
  }
  return formatted;
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ja-JP').format(num);
}

/**
 * Parse a money string back to number
 */
export function parseMoney(str: string): number {
  const cleaned = str.replace(/[G円,\s+]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Calculate percentage
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

/**
 * Format large numbers with abbreviations
 */
export function formatCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
