/**
 * Format a number as currency
 */
export function formatMoney(amount: number, showSign: boolean = false): string {
  const formatted = new Intl.NumberFormat('ja-JP').format(Math.abs(amount));

  if (showSign) {
    if (amount > 0) {
      return `+${formatted}G`;
    } else if (amount < 0) {
      return `-${formatted}G`;
    }
  }

  if (amount < 0) {
    return `-${formatted}G`;
  }

  return `${formatted}G`;
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
  const cleaned = str.replace(/[G,\s+]/g, '');
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
