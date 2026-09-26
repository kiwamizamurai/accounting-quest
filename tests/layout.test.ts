import { describe, it, expect } from 'vitest';
import {
  VIEW_WIDTH,
  VIEW_MIN_HEIGHT,
  VIEW_MAX_HEIGHT,
  HUD_HEIGHT,
  DIALOG_TAG_HEIGHT,
  computeViewHeight,
  getVNLayout,
  getSheetRect,
} from '../src/config/layout';

describe('portrait layout', () => {
  it('matches the canvas height to the shape of the window', () => {
    // A tall phone gets a tall canvas, so logical px are about CSS px
    expect(computeViewHeight(390, 844)).toBe(779);
    expect(computeViewHeight(360, 800)).toBe(800);
  });

  it('never goes outside the supported height range', () => {
    // A wide (desktop) window gets the shortest canvas: a phone-shaped column
    expect(computeViewHeight(1440, 900)).toBe(VIEW_MIN_HEIGHT);
    // An extremely tall window is capped
    expect(computeViewHeight(360, 1400)).toBe(VIEW_MAX_HEIGHT);
    // A window with no size yet must not produce NaN
    expect(computeViewHeight(0, 0)).toBe(VIEW_MIN_HEIGHT);
  });

  it.each([VIEW_MIN_HEIGHT, 700, 779, VIEW_MAX_HEIGHT])('lays the visual novel screen out without overlaps at height %i', height => {
    const { hud, stage, dialog, strip } = getVNLayout(false, height);

    // Top to bottom: HUD, stage, (speaker tag), dialog box, strip; the strip ends at the bottom edge
    expect(hud.y + hud.h).toBeLessThanOrEqual(stage.y);
    expect(stage.y + stage.h + DIALOG_TAG_HEIGHT).toBeLessThanOrEqual(dialog.y);
    expect(dialog.y + dialog.h).toBeLessThanOrEqual(strip.y);
    expect(strip.y + strip.h).toBe(height);

    // Everything fits the width, and the stage is tall enough for the scene art to read
    for (const rect of [hud, stage, dialog, strip]) {
      expect(rect.x + rect.w).toBeLessThanOrEqual(VIEW_WIDTH);
    }
    expect(stage.h).toBeGreaterThanOrEqual(300);
  });

  it.each([VIEW_MIN_HEIGHT, 779, VIEW_MAX_HEIGHT])('keeps the report sheet between the top bar and the compact dialog at height %i', height => {
    const sheet = getSheetRect(height);
    const compact = getVNLayout(true, height).dialog;

    expect(sheet.y).toBeGreaterThanOrEqual(HUD_HEIGHT);
    expect(sheet.y + sheet.h + DIALOG_TAG_HEIGHT).toBeLessThanOrEqual(compact.y);
    // Room for a title bar, the totals and a few rows
    expect(sheet.h).toBeGreaterThan(350);
  });
});
