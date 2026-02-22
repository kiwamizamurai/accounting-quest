import Phaser from 'phaser';
import { CharacterExpression } from '../../vn/types';
import { CHARACTERS } from '../../data/characters';
import { GAME_HEIGHT } from '../../config/constants';

const PORTRAIT_HEIGHT = 240;

export class CharacterPortrait extends Phaser.GameObjects.Container {
  private characterId: string;
  private currentExpression: CharacterExpression = 'normal';
  private portraitGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, characterId: string, x: number) {
    super(scene, x, GAME_HEIGHT - 180 - PORTRAIT_HEIGHT / 2);
    this.characterId = characterId;

    this.portraitGraphics = scene.add.graphics();
    this.add(this.portraitGraphics);

    this.drawCharacter();
    this.setAlpha(0);

    scene.add.existing(this);
  }

  show(expression?: CharacterExpression): void {
    if (expression) {
      this.currentExpression = expression;
    }
    this.drawCharacter();
    if (!this.scene) return;
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });
  }

  hide(): void {
    if (!this.scene) {
      return;
    }
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        if (this.scene) {
          this.destroy();
        }
      },
    });
  }

  setExpression(expression: CharacterExpression): void {
    this.currentExpression = expression;
    this.drawCharacter();
  }

  highlight(active: boolean): void {
    if (!this.scene) return;
    this.scene.tweens.add({
      targets: this,
      alpha: active ? 1 : 0.5,
      duration: 200,
    });
  }

  private drawCharacter(): void {
    this.portraitGraphics.clear();
    const charDef = CHARACTERS[this.characterId];
    if (!charDef) return;

    const color = Phaser.Display.Color.HexStringToColor(charDef.color).color;
    const cx = 0;
    const cy = 0;

    // Body
    this.portraitGraphics.fillStyle(color, 1);
    this.portraitGraphics.fillRect(cx - 30, cy - 20, 60, 80);

    // Head
    this.portraitGraphics.fillStyle(0xffd8b1, 1);
    this.portraitGraphics.fillRect(cx - 24, cy - 80, 48, 56);

    // Hair based on character
    const hairColor = this.getHairColor();
    this.portraitGraphics.fillStyle(hairColor, 1);
    this.portraitGraphics.fillRect(cx - 26, cy - 84, 52, 20);
    // Side hair
    this.portraitGraphics.fillRect(cx - 26, cy - 84, 8, 40);
    this.portraitGraphics.fillRect(cx + 18, cy - 84, 8, 40);

    // Eyes
    this.drawEyes(cx, cy);

    // Mouth
    this.drawMouth(cx, cy);

    // Legs
    this.portraitGraphics.fillStyle(0x2d2d44, 1);
    this.portraitGraphics.fillRect(cx - 24, cy + 60, 20, 40);
    this.portraitGraphics.fillRect(cx + 4, cy + 60, 20, 40);

    // Character-specific details
    this.drawCharacterDetails(cx, cy);
  }

  private getHairColor(): number {
    switch (this.characterId) {
      case 'mentor': return 0x808080;
      case 'supplier': return 0x8b4513;
      case 'customer': return 0x2d2d44;
      case 'banker': return 0x1a1a2e;
      case 'employee': return 0xd4a574;
      case 'taxman': return 0x404040;
      default: return 0x4a3728;
    }
  }

  private drawEyes(cx: number, cy: number): void {
    const eyeY = cy - 60;

    switch (this.currentExpression) {
      case 'happy':
        // Curved closed eyes (happy arcs)
        this.portraitGraphics.fillStyle(0x000000, 1);
        this.portraitGraphics.fillRect(cx - 14, eyeY, 8, 3);
        this.portraitGraphics.fillRect(cx + 6, eyeY, 8, 3);
        break;
      case 'surprised':
        // Wide open eyes
        this.portraitGraphics.fillStyle(0xffffff, 1);
        this.portraitGraphics.fillRect(cx - 16, eyeY - 4, 12, 12);
        this.portraitGraphics.fillRect(cx + 4, eyeY - 4, 12, 12);
        this.portraitGraphics.fillStyle(0x000000, 1);
        this.portraitGraphics.fillRect(cx - 12, eyeY, 6, 6);
        this.portraitGraphics.fillRect(cx + 8, eyeY, 6, 6);
        break;
      case 'thinking':
        // One eye squinted, one normal
        this.portraitGraphics.fillStyle(0x000000, 1);
        this.portraitGraphics.fillRect(cx - 14, eyeY, 8, 3);
        this.portraitGraphics.fillStyle(0xffffff, 1);
        this.portraitGraphics.fillRect(cx + 4, eyeY - 2, 10, 8);
        this.portraitGraphics.fillStyle(0x000000, 1);
        this.portraitGraphics.fillRect(cx + 7, eyeY, 5, 5);
        break;
      case 'sad':
        // Droopy eyes
        this.portraitGraphics.fillStyle(0x000000, 1);
        this.portraitGraphics.fillRect(cx - 14, eyeY + 2, 8, 4);
        this.portraitGraphics.fillRect(cx + 6, eyeY + 2, 8, 4);
        break;
      case 'angry':
        // Angled eyebrows
        this.portraitGraphics.fillStyle(0x000000, 1);
        this.portraitGraphics.fillRect(cx - 14, eyeY, 8, 4);
        this.portraitGraphics.fillRect(cx + 6, eyeY, 8, 4);
        // Angry brows
        this.portraitGraphics.fillRect(cx - 16, eyeY - 6, 10, 3);
        this.portraitGraphics.fillRect(cx + 6, eyeY - 6, 10, 3);
        break;
      default: // normal
        this.portraitGraphics.fillStyle(0xffffff, 1);
        this.portraitGraphics.fillRect(cx - 14, eyeY - 2, 10, 8);
        this.portraitGraphics.fillRect(cx + 4, eyeY - 2, 10, 8);
        this.portraitGraphics.fillStyle(0x000000, 1);
        this.portraitGraphics.fillRect(cx - 10, eyeY, 5, 5);
        this.portraitGraphics.fillRect(cx + 7, eyeY, 5, 5);
        break;
    }
  }

  private drawMouth(cx: number, cy: number): void {
    const mouthY = cy - 40;
    this.portraitGraphics.fillStyle(0x000000, 1);

    switch (this.currentExpression) {
      case 'happy':
        this.portraitGraphics.fillRect(cx - 8, mouthY, 16, 3);
        this.portraitGraphics.fillRect(cx - 10, mouthY - 2, 3, 3);
        this.portraitGraphics.fillRect(cx + 7, mouthY - 2, 3, 3);
        break;
      case 'surprised':
        this.portraitGraphics.fillStyle(0x000000, 1);
        this.portraitGraphics.fillRect(cx - 5, mouthY - 2, 10, 8);
        break;
      case 'sad':
        this.portraitGraphics.fillRect(cx - 8, mouthY, 16, 3);
        this.portraitGraphics.fillRect(cx - 10, mouthY + 2, 3, 3);
        this.portraitGraphics.fillRect(cx + 7, mouthY + 2, 3, 3);
        break;
      default:
        this.portraitGraphics.fillRect(cx - 6, mouthY, 12, 3);
        break;
    }
  }

  private drawCharacterDetails(cx: number, cy: number): void {
    switch (this.characterId) {
      case 'mentor':
        // Glasses
        this.portraitGraphics.lineStyle(2, 0x000000, 1);
        this.portraitGraphics.strokeRect(cx - 16, cy - 66, 14, 12);
        this.portraitGraphics.strokeRect(cx + 2, cy - 66, 14, 12);
        this.portraitGraphics.lineBetween(cx - 2, cy - 60, cx + 2, cy - 60);
        break;
      case 'banker':
        // Tie
        this.portraitGraphics.fillStyle(0xd94a4a, 1);
        this.portraitGraphics.fillRect(cx - 4, cy - 20, 8, 30);
        this.portraitGraphics.fillTriangle(
          cx - 6, cy - 20, cx + 6, cy - 20, cx, cy - 12
        );
        break;
      case 'supplier':
        // Apron
        this.portraitGraphics.fillStyle(0xffffff, 0.8);
        this.portraitGraphics.fillRect(cx - 24, cy, 48, 40);
        break;
    }
  }

  getCharacterId(): string {
    return this.characterId;
  }
}
