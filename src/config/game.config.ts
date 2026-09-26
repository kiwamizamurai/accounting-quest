import Phaser from 'phaser';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 16;
export const SCALE_FACTOR = 2;

/**
 * The game is laid out in an 800x600 world, but the canvas is rendered RENDER_SCALE times larger
 * (and every scene's camera zooms by the same factor, see utils/renderScale.ts). Text and graphics
 * are then drawn at full resolution instead of being drawn small and enlarged by the browser.
 */
export const RENDER_SCALE = Math.min(3, Math.max(2, Math.round(window.devicePixelRatio || 1)));

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH * RENDER_SCALE,
  height: GAME_HEIGHT * RENDER_SCALE,
  pixelArt: false,
  roundPixels: false,
  antialias: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
  },
  backgroundColor: '#1a1a2e',
};
