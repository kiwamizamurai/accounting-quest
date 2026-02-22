/**
 * Pixel art color palette
 * Based on popular retro game palettes
 */
export const PALETTE = {
  // Primary colors
  BLACK: 0x1a1a2e,
  DARK_BLUE: 0x16213e,
  NAVY: 0x0f3460,
  BLUE: 0x4a90d9,
  LIGHT_BLUE: 0x7ec8e3,

  // Warm colors
  DARK_RED: 0x8b0000,
  RED: 0xd94a4a,
  ORANGE: 0xe94560,
  GOLD: 0xffd700,
  YELLOW: 0xfff176,

  // Cool colors
  DARK_GREEN: 0x1b5e20,
  GREEN: 0x4ad94a,
  LIGHT_GREEN: 0x81c784,
  TEAL: 0x26a69a,
  CYAN: 0x4dd0e1,

  // Neutrals
  DARK_GRAY: 0x2d2d44,
  GRAY: 0x4a4a6a,
  LIGHT_GRAY: 0x9e9e9e,
  WHITE: 0xffffff,
  CREAM: 0xfff8dc,

  // Special
  PURPLE: 0x9b4ad9,
  PINK: 0xff69b4,
  BROWN: 0x8b4513,

  // Accounting specific
  ASSET_COLOR: 0x4a90d9,
  LIABILITY_COLOR: 0xd94a4a,
  EQUITY_COLOR: 0x4ad94a,
  REVENUE_COLOR: 0xffd700,
  EXPENSE_COLOR: 0x9b4ad9,
} as const;

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: number): { r: number; g: number; b: number } {
  return {
    r: (hex >> 16) & 255,
    g: (hex >> 8) & 255,
    b: hex & 255,
  };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b;
}

/**
 * Lighten a color
 */
export function lighten(color: number, amount: number): number {
  const { r, g, b } = hexToRgb(color);
  const factor = 1 + amount;
  return rgbToHex(
    Math.min(255, Math.floor(r * factor)),
    Math.min(255, Math.floor(g * factor)),
    Math.min(255, Math.floor(b * factor))
  );
}

/**
 * Darken a color
 */
export function darken(color: number, amount: number): number {
  const { r, g, b } = hexToRgb(color);
  const factor = 1 - amount;
  return rgbToHex(
    Math.floor(r * factor),
    Math.floor(g * factor),
    Math.floor(b * factor)
  );
}

/**
 * Get contrasting text color (black or white)
 */
export function getContrastColor(backgroundColor: number): number {
  const { r, g, b } = hexToRgb(backgroundColor);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? PALETTE.BLACK : PALETTE.WHITE;
}
