import Phaser from 'phaser';
import { COLORS, DEPTH, FONT_FAMILY } from '../../config/constants';
import { VIEW_WIDTH, getViewHeight } from '../../config/layout';
import { getLanguage } from '../../i18n';
import { getGameStateManager } from '../../state/GameStateManager';
import { getAudioManager } from '../../managers/AudioManager';
import { Button } from './Button';

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 340;
const SLIDER_WIDTH = 260;

/**
 * Settings dialog (BGM on/off, music and effect volume), shared by the title screen and the
 * visual novel screen. It dims the screen behind it and removes itself when closed.
 */
export class SettingsPanel extends Phaser.GameObjects.Container {
  private onClose: () => void;
  private sliderCleanups: (() => void)[] = [];

  constructor(scene: Phaser.Scene, onClose: () => void) {
    super(scene, 0, 0);
    this.onClose = onClose;
    this.setDepth(DEPTH.TRANSITION);

    const ja = getLanguage() === 'ja';
    const gameState = getGameStateManager();
    const settings = gameState.getState().settings;
    const height = getViewHeight();
    const panelX = (VIEW_WIDTH - PANEL_WIDTH) / 2;
    const panelY = Math.round((height - PANEL_HEIGHT) / 2);

    // Overlay: dims the screen and swallows taps
    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(0, 0, VIEW_WIDTH, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, VIEW_WIDTH, height), Phaser.Geom.Rectangle.Contains);
    this.add(overlay);

    // Panel background
    const bg = scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.98);
    bg.fillRoundedRect(panelX, panelY, PANEL_WIDTH, PANEL_HEIGHT, 14);
    bg.lineStyle(2, COLORS.ASSETS, 0.8);
    bg.strokeRoundedRect(panelX, panelY, PANEL_WIDTH, PANEL_HEIGHT, 14);
    bg.setInteractive(new Phaser.Geom.Rectangle(panelX, panelY, PANEL_WIDTH, PANEL_HEIGHT), Phaser.Geom.Rectangle.Contains);
    this.add(bg);

    this.add(this.label(VIEW_WIDTH / 2, panelY + 30, ja ? '設定' : 'Settings', 20, '#ffd700', true, 0.5));

    // BGM on/off
    this.add(this.label(panelX + 30, panelY + 84, 'BGM', 16, '#ffffff', false, 0, 0.5));
    const bgmToggleBtn = new Button(scene, {
      x: panelX + PANEL_WIDTH - 30 - 36,
      y: panelY + 84,
      width: 72,
      height: 40,
      text: settings.bgmEnabled ? 'ON' : 'OFF',
      fontSize: 15,
      onClick: () => {
        const newValue = !gameState.getState().settings.bgmEnabled;
        gameState.updateSettings({ bgmEnabled: newValue });

        const audioManager = getAudioManager();
        if (newValue) {
          audioManager.playBGM();
        } else {
          audioManager.stopBGM();
        }
        bgmToggleBtn.setText(newValue ? 'ON' : 'OFF');
      },
    });
    this.add(bgmToggleBtn);

    // Volume sliders
    this.addSlider(
      panelX + 30,
      panelY + 130,
      ja ? '音楽音量' : 'Music',
      settings.musicVolume,
      volume => {
        gameState.updateSettings({ musicVolume: volume });
        getAudioManager().setMusicVolume(volume);
      }
    );
    this.addSlider(
      panelX + 30,
      panelY + 200,
      ja ? '効果音量' : 'Sound effects',
      settings.sfxVolume,
      volume => gameState.updateSettings({ sfxVolume: volume })
    );

    // Close button
    this.add(new Button(scene, {
      x: VIEW_WIDTH / 2,
      y: panelY + PANEL_HEIGHT - 44,
      width: 160,
      height: 44,
      text: ja ? '閉じる' : 'Close',
      onClick: () => this.close(),
    }));

    scene.add.existing(this);
  }

  private close(): void {
    this.destroy();
    this.onClose();
  }

  private label(
    x: number,
    y: number,
    text: string,
    size: number,
    color: string,
    bold: boolean,
    originX: number,
    originY = 0.5
  ): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, text, {
        fontFamily: FONT_FAMILY,
        fontSize: `${size}px`,
        color,
        fontStyle: bold ? 'bold' : 'normal',
        padding: { top: 4, bottom: 4 },
      })
      .setOrigin(originX, originY);
  }

  /** A label and a draggable volume slider (0-1). */
  private addSlider(x: number, y: number, label: string, value: number, onChange: (volume: number) => void): void {
    const { scene } = this;
    this.add(this.label(x, y, label, 14, '#ffffff', false, 0));

    const trackY = y + 34;
    const track = scene.add.graphics();
    const draw = (volume: number): void => {
      track.clear();
      track.fillStyle(0x4a4a6a, 1);
      track.fillRoundedRect(x, trackY - 4, SLIDER_WIDTH, 8, 4);
      track.fillStyle(COLORS.ASSETS, 1);
      track.fillRoundedRect(x, trackY - 4, Math.max(8, SLIDER_WIDTH * volume), 8, 4);
      track.fillStyle(0xffffff, 1);
      track.fillCircle(x + SLIDER_WIDTH * volume, trackY, 11);
    };
    draw(value);
    this.add(track);

    // A tall hit area so the slider is easy to grab with a finger
    const zone = scene.add.zone(x + SLIDER_WIDTH / 2, trackY, SLIDER_WIDTH + 24, 44);
    zone.setInteractive({ useHandCursor: true });
    let dragging = false;
    const setFrom = (pointer: Phaser.Input.Pointer): void => {
      const volume = Math.max(0, Math.min(1, (pointer.worldX - x) / SLIDER_WIDTH));
      draw(volume);
      onChange(volume);
    };
    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      dragging = true;
      setFrom(pointer);
    });
    const onMove = (pointer: Phaser.Input.Pointer): void => {
      if (dragging) setFrom(pointer);
    };
    const onUp = (): void => {
      dragging = false;
    };
    scene.input.on('pointermove', onMove);
    scene.input.on('pointerup', onUp);
    this.sliderCleanups.push(() => {
      scene.input.off('pointermove', onMove);
      scene.input.off('pointerup', onUp);
    });
    this.add(zone);
  }

  destroy(fromScene?: boolean): void {
    this.sliderCleanups.forEach(cleanup => cleanup());
    this.sliderCleanups = [];
    super.destroy(fromScene);
  }
}
