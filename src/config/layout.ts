import type Phaser from 'phaser';

/**
 * The game is portrait-first. The canvas is always VIEW_WIDTH logical pixels wide, and its height
 * follows the shape of the window (tall phones get a taller canvas), so one logical pixel is about
 * one CSS pixel on a phone and text is never shrunk. On a wide window (desktop) the canvas is a
 * centred, phone-shaped column.
 */
export const VIEW_WIDTH = 360;
export const VIEW_MIN_HEIGHT = 640; // 9:16
export const VIEW_MAX_HEIGHT = 800;

/** The 800x600 world the scene art (backgrounds, characters) is drawn in. It is scaled into the stage. */
export const ART_WIDTH = 800;
export const ART_HEIGHT = 600;

/**
 * The canvas is rendered RENDER_SCALE times larger than it is laid out (and every scene's camera
 * zooms by the same factor, see utils/renderScale.ts). Text and graphics are then drawn at full
 * resolution instead of being drawn small and enlarged by the browser.
 */
export const RENDER_SCALE = Math.min(3, Math.max(2, Math.round(window.devicePixelRatio || 1)));

/** Canvas height (logical px) that matches a window of the given size, within the supported range. */
export function computeViewHeight(windowWidth: number, windowHeight: number): number {
  if (windowWidth <= 0 || windowHeight <= 0) {
    return VIEW_MIN_HEIGHT;
  }
  const height = Math.round((VIEW_WIDTH * windowHeight) / windowWidth);
  return Math.min(VIEW_MAX_HEIGHT, Math.max(VIEW_MIN_HEIGHT, height));
}

let viewHeight = computeViewHeight(window.innerWidth, window.innerHeight);

/** Current canvas height in logical px. Read it when laying a scene out. */
export function getViewHeight(): number {
  return viewHeight;
}

/**
 * Resize the canvas to the current window shape. Call it at the start of a scene, before the scene
 * lays itself out (resizing while a scene is on screen would leave it half-positioned).
 */
export function fitViewToWindow(game: Phaser.Game): void {
  const next = computeViewHeight(window.innerWidth, window.innerHeight);
  viewHeight = next;
  const width = VIEW_WIDTH * RENDER_SCALE;
  const height = next * RENDER_SCALE;
  if (game.scale.gameSize.width !== width || game.scale.gameSize.height !== height) {
    game.scale.setGameSize(width, height);
  }
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const HUD_HEIGHT = 48;
export const STRIP_HEIGHT = 40;
export const DIALOG_MARGIN = 10;
export const DIALOG_TAG_HEIGHT = 22; // speaker name tag sitting on top of the dialog box

/** Dialog box height while a report sheet is open: just enough for a couple of lines. */
export const DIALOG_COMPACT_HEIGHT = 92;

export interface VNLayout {
  /** Top bar: chapter label, settings, language, BS/PL buttons. */
  hud: Rect;
  /** Scene art (background + characters). */
  stage: Rect;
  /** Dialog box, and the area choices / quiz answers use. Its speaker tag sits above `dialog.y`. */
  dialog: Rect;
  /** Accounting-equation strip at the bottom. */
  strip: Rect;
}

/** Dialog box height at full size: about a quarter of the screen (the longest lines still fit; long text shrinks). */
function fullDialogHeight(viewHeight: number): number {
  return Math.min(200, Math.max(168, Math.round(viewHeight * 0.23)));
}

/**
 * The regions of the visual novel screen. Pass `compact` to shrink the dialog box (report sheet
 * open); `height` defaults to the current canvas height.
 */
export function getVNLayout(compact = false, height = getViewHeight()): VNLayout {
  const fullTop = height - STRIP_HEIGHT - DIALOG_MARGIN - fullDialogHeight(height);
  const dialogHeight = compact ? DIALOG_COMPACT_HEIGHT : fullDialogHeight(height);
  const stageBottom = fullTop - DIALOG_TAG_HEIGHT;
  return {
    hud: { x: 0, y: 0, w: VIEW_WIDTH, h: HUD_HEIGHT },
    stage: { x: 0, y: HUD_HEIGHT, w: VIEW_WIDTH, h: stageBottom - HUD_HEIGHT },
    dialog: {
      x: DIALOG_MARGIN,
      y: height - STRIP_HEIGHT - DIALOG_MARGIN - dialogHeight,
      w: VIEW_WIDTH - DIALOG_MARGIN * 2,
      h: dialogHeight,
    },
    strip: { x: 0, y: height - STRIP_HEIGHT, w: VIEW_WIDTH, h: STRIP_HEIGHT },
  };
}

/**
 * The area a full-height sheet (report, journal entry) may use: between the HUD and the compact
 * dialog box.
 */
export function getSheetRect(height = getViewHeight()): Rect {
  const layout = getVNLayout(true, height);
  const top = HUD_HEIGHT;
  const bottom = layout.dialog.y - DIALOG_TAG_HEIGHT - 4;
  return { x: DIALOG_MARGIN, y: top, w: VIEW_WIDTH - DIALOG_MARGIN * 2, h: bottom - top };
}
