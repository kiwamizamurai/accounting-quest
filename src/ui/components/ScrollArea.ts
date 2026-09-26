import Phaser from 'phaser';
import { Rect } from '../../config/layout';

const DRAG_THRESHOLD = 6;

/**
 * A vertically scrolling region: put things in `content`, tell it how tall they are, and the player
 * can drag (touch or mouse), use the wheel or the arrow keys. Anything outside `rect` is clipped.
 *
 * Buttons inside the content keep working: dragging only starts once the pointer has moved a few
 * pixels, and a button should ignore its release when `moved` is true.
 */
export class ScrollArea {
  readonly content: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private rect: Rect;
  private scrollBar: Phaser.GameObjects.Graphics;
  private scrollY = 0;
  private contentHeight = 0;
  private pressed = false;
  private dragging = false;
  private startY = 0;
  private lastY = 0;
  private enabled = true;

  constructor(scene: Phaser.Scene, rect: Rect, parent: Phaser.GameObjects.Container) {
    this.scene = scene;
    this.rect = rect;

    this.content = scene.add.container(0, 0);
    parent.add(this.content);

    const maskShape = scene.make.graphics({}, false);
    maskShape.fillStyle(0xffffff, 1);
    maskShape.fillRect(rect.x, rect.y, rect.w, rect.h);
    this.content.setMask(maskShape.createGeometryMask());

    this.scrollBar = scene.add.graphics();
    parent.add(this.scrollBar);

    scene.input.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerup', this.onPointerUp, this);
    scene.input.on('wheel', this.onWheel, this);
  }

  /** True while the pointer that scrolled the area is still down (or just released after a drag). */
  get moved(): boolean {
    return this.dragging;
  }

  get maxScroll(): number {
    return Math.max(0, this.contentHeight - this.rect.h);
  }

  /** Only an enabled area reacts to input (a hidden sheet must not scroll). */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.pressed = false;
      this.dragging = false;
    }
  }

  /** `height` is the content's height measured from the top of `rect`. */
  setContentHeight(height: number): void {
    this.contentHeight = height;
    this.scrollTo(this.scrollY);
  }

  scrollTo(y: number): void {
    this.scrollY = Math.max(0, Math.min(this.maxScroll, y));
    this.content.y = -this.scrollY;
    this.drawScrollBar();
  }

  scrollBy(delta: number): void {
    if (this.enabled) this.scrollTo(this.scrollY + delta);
  }

  private drawScrollBar(): void {
    this.scrollBar.clear();
    if (this.maxScroll <= 0) return;
    const trackH = this.rect.h - 8;
    const thumbH = Math.max(28, (this.rect.h / this.contentHeight) * trackH);
    const thumbY = this.rect.y + 4 + (this.scrollY / this.maxScroll) * (trackH - thumbH);
    this.scrollBar.fillStyle(0xffffff, 0.35);
    this.scrollBar.fillRoundedRect(this.rect.x + this.rect.w - 5, thumbY, 3, thumbH, 1.5);
  }

  private inside(pointer: Phaser.Input.Pointer): boolean {
    const { x, y, w, h } = this.rect;
    return pointer.worldX >= x && pointer.worldX <= x + w && pointer.worldY >= y && pointer.worldY <= y + h;
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled || !this.inside(pointer)) return;
    this.pressed = true;
    this.dragging = false;
    this.startY = pointer.worldY;
    this.lastY = pointer.worldY;
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.pressed || !this.enabled) return;
    if (!this.dragging && Math.abs(pointer.worldY - this.startY) < DRAG_THRESHOLD) return;
    this.dragging = true;
    this.scrollTo(this.scrollY - (pointer.worldY - this.lastY));
    this.lastY = pointer.worldY;
  }

  private onPointerUp(): void {
    this.pressed = false;
    // Buttons read `moved` while handling their own release, which runs after this; clear it a tick later
    if (this.dragging) {
      this.scene.time.delayedCall(0, () => {
        this.dragging = false;
      });
    }
  }

  private onWheel(pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number): void {
    if (this.enabled && this.inside(pointer)) {
      this.scrollTo(this.scrollY + dy);
    }
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.scene.input.off('wheel', this.onWheel, this);
    this.content.clearMask(true);
    this.content.destroy();
    this.scrollBar.destroy();
  }
}
