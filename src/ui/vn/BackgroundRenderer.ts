import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../../config/constants';

type BackgroundDrawer = (gfx: Phaser.GameObjects.Graphics) => void;

const BACKGROUNDS: Record<string, BackgroundDrawer> = {
  lemonade_stand: drawLemonadeStand,
  bank: drawBank,
  supply_shop: drawSupplyShop,
  home: drawHome,
  street: drawStreet,
  office: drawOffice,
};

export class BackgroundRenderer extends Phaser.GameObjects.Container {
  private bgGraphics: Phaser.GameObjects.Graphics;
  private currentBg = '';

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.bgGraphics = scene.add.graphics();
    this.add(this.bgGraphics);

    this.setDepth(DEPTH.GROUND);
    scene.add.existing(this);
  }

  setBackground(name: string, animate: boolean = true): void {
    if (name === this.currentBg) return;
    this.currentBg = name;

    if (animate) {
      this.setAlpha(0);
      this.drawBackground(name);
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        duration: 500,
        ease: 'Power2',
      });
    } else {
      this.drawBackground(name);
    }
  }

  private drawBackground(name: string): void {
    this.bgGraphics.clear();
    const drawer = BACKGROUNDS[name];
    if (drawer) {
      drawer(this.bgGraphics);
    } else {
      drawDefault(this.bgGraphics);
    }
  }

  getCurrentBackground(): string {
    return this.currentBg;
  }
}

function drawDefault(gfx: Phaser.GameObjects.Graphics): void {
  // Sky gradient
  gfx.fillStyle(0x1a1a2e, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Stars
  for (let i = 0; i < 50; i++) {
    const x = (i * 127 + 43) % GAME_WIDTH;
    const y = (i * 89 + 17) % (GAME_HEIGHT * 0.6);
    const size = (i % 3) + 1;
    gfx.fillStyle(0xffffff, 0.3 + (i % 5) * 0.15);
    gfx.fillRect(x, y, size, size);
  }
}

function drawLemonadeStand(gfx: Phaser.GameObjects.Graphics): void {
  // Sky
  gfx.fillStyle(0x87ceeb, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.6);

  // Sun
  gfx.fillStyle(0xffd700, 1);
  gfx.fillCircle(650, 80, 40);
  // Sun rays
  gfx.fillStyle(0xffd700, 0.3);
  gfx.fillCircle(650, 80, 60);

  // Clouds
  gfx.fillStyle(0xffffff, 0.8);
  gfx.fillCircle(150, 70, 30);
  gfx.fillCircle(180, 60, 35);
  gfx.fillCircle(210, 70, 28);

  gfx.fillCircle(450, 90, 25);
  gfx.fillCircle(475, 80, 30);
  gfx.fillCircle(500, 90, 22);

  // Grass
  gfx.fillStyle(0x4ad94a, 1);
  gfx.fillRect(0, GAME_HEIGHT * 0.6, GAME_WIDTH, GAME_HEIGHT * 0.4);

  // Darker grass stripes
  gfx.fillStyle(0x3ac93a, 1);
  for (let x = 0; x < GAME_WIDTH; x += 40) {
    gfx.fillRect(x, GAME_HEIGHT * 0.6, 20, GAME_HEIGHT * 0.4);
  }

  // Lemonade stand
  const standX = GAME_WIDTH / 2 - 80;
  const standY = GAME_HEIGHT * 0.45;

  // Stand counter
  gfx.fillStyle(0x8b4513, 1);
  gfx.fillRect(standX, standY + 60, 160, 40);
  gfx.fillStyle(0x6b3513, 1);
  gfx.fillRect(standX, standY + 90, 160, 10);

  // Stand legs
  gfx.fillStyle(0x8b4513, 1);
  gfx.fillRect(standX + 10, standY + 100, 12, 40);
  gfx.fillRect(standX + 138, standY + 100, 12, 40);

  // Awning
  gfx.fillStyle(0xd94a4a, 1);
  gfx.fillRect(standX - 10, standY, 180, 20);
  // Awning stripes
  for (let i = 0; i < 6; i++) {
    gfx.fillStyle(i % 2 === 0 ? 0xd94a4a : 0xffffff, 1);
    gfx.fillRect(standX - 10 + i * 30, standY + 20, 30, 40);
  }

  // Awning poles
  gfx.fillStyle(0x8b4513, 1);
  gfx.fillRect(standX - 6, standY, 6, 100);
  gfx.fillRect(standX + 160, standY, 6, 100);

  // Lemonade pitcher
  gfx.fillStyle(0xffff00, 0.6);
  gfx.fillRect(standX + 60, standY + 40, 30, 25);
  gfx.fillStyle(0xffffff, 0.4);
  gfx.fillRect(standX + 60, standY + 35, 30, 8);

  // Sign
  gfx.fillStyle(0xfff176, 1);
  gfx.fillRect(standX + 30, standY - 20, 100, 22);
  gfx.fillStyle(0x8b4513, 1);
  // LEMONADE text placeholder
  gfx.fillRect(standX + 40, standY - 16, 80, 3);
  gfx.fillRect(standX + 50, standY - 10, 60, 3);

  // Path
  gfx.fillStyle(0xd2b48c, 1);
  gfx.fillRect(GAME_WIDTH / 2 - 40, GAME_HEIGHT * 0.7, 80, GAME_HEIGHT * 0.3);
}

function drawBank(gfx: Phaser.GameObjects.Graphics): void {
  // Indoor dark background
  gfx.fillStyle(0x1a1a3e, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Marble floor
  gfx.fillStyle(0xd4c5a9, 1);
  gfx.fillRect(0, GAME_HEIGHT * 0.6, GAME_WIDTH, GAME_HEIGHT * 0.4);
  // Floor tiles
  for (let x = 0; x < GAME_WIDTH; x += 60) {
    for (let y = GAME_HEIGHT * 0.6; y < GAME_HEIGHT; y += 40) {
      gfx.fillStyle((x / 60 + y / 40) % 2 === 0 ? 0xd4c5a9 : 0xc4b599, 1);
      gfx.fillRect(x, y, 60, 40);
    }
  }

  // Back wall
  gfx.fillStyle(0x2d2d5e, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.6);

  // Pillars
  for (let i = 0; i < 3; i++) {
    const px = 100 + i * 250;
    gfx.fillStyle(0xc0c0c0, 1);
    gfx.fillRect(px, GAME_HEIGHT * 0.1, 40, GAME_HEIGHT * 0.5);
    gfx.fillStyle(0xd0d0d0, 1);
    gfx.fillRect(px - 5, GAME_HEIGHT * 0.1, 50, 20);
    gfx.fillRect(px - 5, GAME_HEIGHT * 0.55, 50, 20);
  }

  // Counter
  gfx.fillStyle(0x4a3728, 1);
  gfx.fillRect(100, GAME_HEIGHT * 0.55, 500, 30);
  gfx.fillStyle(0x5a4738, 1);
  gfx.fillRect(100, GAME_HEIGHT * 0.55, 500, 8);

  // Bank sign
  gfx.fillStyle(0xffd700, 0.8);
  gfx.fillRect(GAME_WIDTH / 2 - 60, 40, 120, 30);
}

function drawSupplyShop(gfx: Phaser.GameObjects.Graphics): void {
  // Indoor warm background
  gfx.fillStyle(0x2e1a0e, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Wooden floor
  gfx.fillStyle(0x8b6914, 1);
  gfx.fillRect(0, GAME_HEIGHT * 0.6, GAME_WIDTH, GAME_HEIGHT * 0.4);
  // Floor boards
  for (let y = GAME_HEIGHT * 0.6; y < GAME_HEIGHT; y += 20) {
    gfx.fillStyle(y % 40 === 0 ? 0x8b6914 : 0x7b5904, 1);
    gfx.fillRect(0, y, GAME_WIDTH, 20);
    gfx.lineStyle(1, 0x5a3804, 0.3);
    gfx.lineBetween(0, y, GAME_WIDTH, y);
  }

  // Shelves
  for (let shelf = 0; shelf < 3; shelf++) {
    const sy = 60 + shelf * 100;
    gfx.fillStyle(0x6b4513, 1);
    gfx.fillRect(50, sy, 300, 12);
    gfx.fillRect(450, sy, 300, 12);

    // Items on shelves
    for (let item = 0; item < 4; item++) {
      const ix = 70 + item * 70;
      // Lemons
      gfx.fillStyle(0xffd700, 1);
      gfx.fillCircle(ix, sy - 10, 8);

      const ix2 = 470 + item * 70;
      // Sugar bags
      gfx.fillStyle(0xffffff, 0.9);
      gfx.fillRect(ix2 - 8, sy - 18, 16, 18);
    }
  }

  // Counter
  gfx.fillStyle(0x6b4513, 1);
  gfx.fillRect(200, GAME_HEIGHT * 0.55, 400, 30);

  // Cash register
  gfx.fillStyle(0x808080, 1);
  gfx.fillRect(GAME_WIDTH / 2 - 20, GAME_HEIGHT * 0.55 - 25, 40, 25);
}

function drawHome(gfx: Phaser.GameObjects.Graphics): void {
  // Indoor cozy background
  gfx.fillStyle(0x2e2a1a, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Warm interior wall
  gfx.fillStyle(0x4a3e2e, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.6);

  // Wooden floor
  gfx.fillStyle(0x6b5534, 1);
  gfx.fillRect(0, GAME_HEIGHT * 0.6, GAME_WIDTH, GAME_HEIGHT * 0.4);

  // Window
  gfx.fillStyle(0x87ceeb, 0.7);
  gfx.fillRect(100, 80, 120, 100);
  gfx.lineStyle(4, 0x6b4513, 1);
  gfx.strokeRect(100, 80, 120, 100);
  gfx.lineBetween(160, 80, 160, 180);
  gfx.lineBetween(100, 130, 220, 130);

  // Desk
  gfx.fillStyle(0x8b6914, 1);
  gfx.fillRect(400, GAME_HEIGHT * 0.45, 200, 15);
  gfx.fillRect(410, GAME_HEIGHT * 0.45 + 15, 10, 60);
  gfx.fillRect(590, GAME_HEIGHT * 0.45 + 15, 10, 60);

  // Book on desk
  gfx.fillStyle(0xd94a4a, 1);
  gfx.fillRect(460, GAME_HEIGHT * 0.45 - 8, 30, 8);

  // Lamp
  gfx.fillStyle(0xffd700, 0.4);
  gfx.fillCircle(520, GAME_HEIGHT * 0.35, 40);
  gfx.fillStyle(0xffd700, 1);
  gfx.fillCircle(520, GAME_HEIGHT * 0.35, 8);
}

function drawStreet(gfx: Phaser.GameObjects.Graphics): void {
  // Sky
  gfx.fillStyle(0x87ceeb, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.4);

  // Buildings in background
  const buildingColors = [0x8b6f47, 0x7a6037, 0x9b7f57, 0x6a5027];
  for (let i = 0; i < 6; i++) {
    const bx = i * 140 - 20;
    const bh = 120 + (i * 37) % 80;
    gfx.fillStyle(buildingColors[i % buildingColors.length], 1);
    gfx.fillRect(bx, GAME_HEIGHT * 0.4 - bh, 130, bh);
    // Windows
    gfx.fillStyle(0xffd700, 0.5);
    for (let wy = 0; wy < 3; wy++) {
      for (let wx = 0; wx < 3; wx++) {
        gfx.fillRect(bx + 15 + wx * 38, GAME_HEIGHT * 0.4 - bh + 20 + wy * 35, 15, 20);
      }
    }
  }

  // Road
  gfx.fillStyle(0x505050, 1);
  gfx.fillRect(0, GAME_HEIGHT * 0.4, GAME_WIDTH, GAME_HEIGHT * 0.35);

  // Road markings
  gfx.fillStyle(0xffffff, 0.6);
  for (let x = 0; x < GAME_WIDTH; x += 80) {
    gfx.fillRect(x, GAME_HEIGHT * 0.57, 40, 4);
  }

  // Sidewalk
  gfx.fillStyle(0xc0c0c0, 1);
  gfx.fillRect(0, GAME_HEIGHT * 0.75, GAME_WIDTH, GAME_HEIGHT * 0.25);

  // Sidewalk tiles
  for (let x = 0; x < GAME_WIDTH; x += 50) {
    gfx.lineStyle(1, 0xa0a0a0, 0.5);
    gfx.lineBetween(x, GAME_HEIGHT * 0.75, x, GAME_HEIGHT);
  }
}

function drawOffice(gfx: Phaser.GameObjects.Graphics): void {
  // Indoor professional background
  gfx.fillStyle(0x1e1e3a, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Wall
  gfx.fillStyle(0x2a2a4e, 1);
  gfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.6);

  // Carpet floor
  gfx.fillStyle(0x3a2a1a, 1);
  gfx.fillRect(0, GAME_HEIGHT * 0.6, GAME_WIDTH, GAME_HEIGHT * 0.4);

  // Filing cabinets
  for (let i = 0; i < 3; i++) {
    const cx = 50 + i * 80;
    gfx.fillStyle(0x606080, 1);
    gfx.fillRect(cx, GAME_HEIGHT * 0.25, 60, GAME_HEIGHT * 0.35);
    // Drawer lines
    for (let d = 0; d < 4; d++) {
      gfx.lineStyle(1, 0x404060, 1);
      gfx.lineBetween(cx, GAME_HEIGHT * 0.25 + d * 22 + 22, cx + 60, GAME_HEIGHT * 0.25 + d * 22 + 22);
      // Handles
      gfx.fillStyle(0xc0c0c0, 1);
      gfx.fillRect(cx + 24, GAME_HEIGHT * 0.25 + d * 22 + 10, 12, 4);
    }
  }

  // Large desk
  gfx.fillStyle(0x5a4020, 1);
  gfx.fillRect(350, GAME_HEIGHT * 0.48, 350, 20);
  gfx.fillRect(360, GAME_HEIGHT * 0.48 + 20, 10, 50);
  gfx.fillRect(690, GAME_HEIGHT * 0.48 + 20, 10, 50);

  // Computer monitor
  gfx.fillStyle(0x303030, 1);
  gfx.fillRect(480, GAME_HEIGHT * 0.3, 80, 60);
  gfx.fillStyle(0x4090d0, 0.8);
  gfx.fillRect(484, GAME_HEIGHT * 0.3 + 4, 72, 52);
  // Stand
  gfx.fillStyle(0x303030, 1);
  gfx.fillRect(510, GAME_HEIGHT * 0.3 + 60, 20, 20);
  gfx.fillRect(500, GAME_HEIGHT * 0.48 - 4, 40, 6);

  // Papers on desk
  gfx.fillStyle(0xffffff, 0.9);
  gfx.fillRect(400, GAME_HEIGHT * 0.45, 40, 30);
  gfx.fillRect(395, GAME_HEIGHT * 0.44, 40, 30);

  // Clock on wall
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(GAME_WIDTH / 2, 60, 25);
  gfx.lineStyle(2, 0x000000, 1);
  gfx.strokeCircle(GAME_WIDTH / 2, 60, 25);
  gfx.lineBetween(GAME_WIDTH / 2, 60, GAME_WIDTH / 2, 42);
  gfx.lineBetween(GAME_WIDTH / 2, 60, GAME_WIDTH / 2 + 12, 55);
}
