import Phaser from 'phaser';
import { getGameStateManager } from '../state/GameStateManager';

/**
 * AudioManager - Singleton for managing background music and sound effects
 * Uses Phaser Web Audio API for playback and volume control
 */
export class AudioManager {
  private static instance: AudioManager;
  private scene!: Phaser.Scene;
  private bgmKeys: Record<1 | 2 | 3, string> = {
    1: 'bgm_level1',
    2: 'bgm_level2',
    3: 'bgm_level3',
  };
  private currentBgm?: Phaser.Sound.BaseSound;
  private sfxKeys: Record<string, string> = {
    transaction: 'sfx_transaction',
    dialog: 'sfx_dialog',
    success: 'sfx_success',
    error: 'sfx_error',
  };
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio manager with a Phaser scene
   * Must be called before playing any audio.
   * Always updates the scene reference so that a new scene instance can be used.
   */
  init(scene: Phaser.Scene): void {
    this.scene = scene;
    this.isInitialized = true;
  }

  /**
   * Load audio assets (call in scene preload)
   */
  preload(scene: Phaser.Scene): void {
    // BGM - Load all level-specific background music
    for (const [, key] of Object.entries(this.bgmKeys)) {
      if (!scene.sys.game.cache.audio.has(key)) {
        scene.load.audio(key, `${import.meta.env.BASE_URL}audio/${key}.mp3`);
      }
    }

    // SFX - Load sound effects
    for (const [, key] of Object.entries(this.sfxKeys)) {
      if (!scene.sys.game.cache.audio.has(key)) {
        scene.load.audio(key, `${import.meta.env.BASE_URL}audio/${key}.mp3`);
      }
    }
  }

  /**
   * Play background music (loops) for a specific level or current gameLevel
   */
  playBGM(level?: 1 | 2 | 3): void {
    if (!this.isInitialized) {
      console.warn('AudioManager not initialized. Call init() first.');
      return;
    }

    const gameState = getGameStateManager();
    const settings = gameState.getState().settings;

    // Check if BGM is enabled
    if (!settings.bgmEnabled) {
      console.log('BGM is disabled');
      return;
    }

    // Stop existing BGM if playing
    if (this.currentBgm?.isPlaying) {
      this.currentBgm.stop();
    }

    // Determine target level (use provided level or current gameLevel)
    const targetLevel: 1 | 2 | 3 = level ?? (gameState.getState().gameLevel as 1 | 2 | 3);
    const bgmKey = this.bgmKeys[targetLevel];
    const volume = settings.musicVolume;

    try {
      this.currentBgm = this.scene.sound.add(bgmKey, {
        loop: true,
        volume,
      });
      this.currentBgm.play();
    } catch (err) {
      console.warn('Failed to play BGM:', err);
    }
  }

  /**
   * Stop background music
   */
  stopBGM(): void {
    if (this.currentBgm && this.currentBgm.isPlaying) {
      this.currentBgm.stop();
    }
  }

  /**
   * Play a sound effect
   */
  playSFX(effectName: 'transaction' | 'dialog' | 'success' | 'error'): void {
    if (!this.isInitialized) {
      console.warn('AudioManager not initialized. Call init() first.');
      return;
    }

    const key = this.sfxKeys[effectName];
    if (!key) {
      console.warn(`Unknown SFX effect: ${effectName}`);
      return;
    }

    const gameState = getGameStateManager();
    const volume = gameState.getState().settings.sfxVolume;

    try {
      const sfx = this.scene.sound.add(key, { volume });
      sfx.play();
    } catch (err) {
      console.warn(`Failed to play SFX (${effectName}):`, err);
    }
  }

  /**
   * Update the volume of the currently playing BGM
   */
  setMusicVolume(volume: number): void {
    if (this.currentBgm && this.currentBgm.isPlaying && 'setVolume' in this.currentBgm) {
      (this.currentBgm as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setVolume(volume);
    }
  }

  /**
   * Check if BGM is playing
   */
  isBGMPlaying(): boolean {
    return this.currentBgm?.isPlaying ?? false;
  }

  /**
   * Cleanup audio resources
   */
  dispose(): void {
    this.stopBGM();
    this.isInitialized = false;
  }
}

export function getAudioManager(): AudioManager {
  return AudioManager.getInstance();
}
