import Phaser from 'phaser';
import { VIEW_WIDTH, RENDER_SCALE, getViewHeight } from './layout';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: VIEW_WIDTH * RENDER_SCALE,
  height: getViewHeight() * RENDER_SCALE,
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
