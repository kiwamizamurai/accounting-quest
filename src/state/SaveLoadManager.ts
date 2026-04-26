import { STORAGE_KEYS } from '../config/constants';
import { CURRENT_SAVE_VERSION } from '../models/GameState';
import { GameStateManager, setGameStateManager } from './GameStateManager';

export interface SaveSlot {
  id: number;
  playerName: string;
  chapter: number;
  level: number;
  playTime: number;
  savedAt: number;
  data: string;
}

const MAX_SAVE_SLOTS = 3;

/**
 * Handles game save/load using localStorage
 */
export class SaveLoadManager {
  /**
   * Save game to a slot
   */
  static saveGame(manager: GameStateManager, slotId: number): boolean {
    if (slotId < 1 || slotId > MAX_SAVE_SLOTS) {
      console.error(`Invalid save slot: ${slotId}`);
      return false;
    }

    try {
      const state = manager.getState();
      const saveSlot: SaveSlot = {
        id: slotId,
        playerName: state.player.name,
        chapter: state.player.currentChapter,
        level: state.player.level,
        playTime: state.totalPlayTime,
        savedAt: Date.now(),
        data: manager.toJSON(),
      };

      const key = `${STORAGE_KEYS.GAME_STATE}_${slotId}`;
      localStorage.setItem(key, JSON.stringify(saveSlot));

      console.log(`Game saved to slot ${slotId}`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game from a slot
   */
  static loadGame(slotId: number): GameStateManager | null {
    if (slotId < 1 || slotId > MAX_SAVE_SLOTS) {
      console.error(`Invalid save slot: ${slotId}`);
      return null;
    }

    try {
      const key = `${STORAGE_KEYS.GAME_STATE}_${slotId}`;
      const saved = localStorage.getItem(key);

      if (!saved) {
        console.log(`No save data in slot ${slotId}`);
        return null;
      }

      const saveSlot: SaveSlot = JSON.parse(saved);
      const saveData = JSON.parse(saveSlot.data);
      if (saveData.version && saveData.version !== CURRENT_SAVE_VERSION) {
        console.warn(`Save data version mismatch: save=${saveData.version}, current=${CURRENT_SAVE_VERSION}`);
      }
      const manager = GameStateManager.fromJSON(saveSlot.data);
      setGameStateManager(manager);

      console.log(`Game loaded from slot ${slotId}`);
      return manager;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Get save slot info without loading the full state
   */
  static getSaveSlotInfo(slotId: number): Omit<SaveSlot, 'data'> | null {
    try {
      const key = `${STORAGE_KEYS.GAME_STATE}_${slotId}`;
      const saved = localStorage.getItem(key);

      if (!saved) {
        return null;
      }

      const saveSlot: SaveSlot = JSON.parse(saved);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, ...info } = saveSlot;
      return info;
    } catch {
      return null;
    }
  }

  /**
   * Get all save slots info
   */
  static getAllSaveSlots(): (Omit<SaveSlot, 'data'> | null)[] {
    const slots: (Omit<SaveSlot, 'data'> | null)[] = [];
    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
      slots.push(this.getSaveSlotInfo(i));
    }
    return slots;
  }

  /**
   * Delete a save slot
   */
  static deleteSave(slotId: number): boolean {
    if (slotId < 1 || slotId > MAX_SAVE_SLOTS) {
      return false;
    }

    try {
      const key = `${STORAGE_KEYS.GAME_STATE}_${slotId}`;
      localStorage.removeItem(key);
      console.log(`Save slot ${slotId} deleted`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a save slot exists
   */
  static hasSave(slotId: number): boolean {
    const key = `${STORAGE_KEYS.GAME_STATE}_${slotId}`;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Auto-save to slot 0 (hidden auto-save slot)
   */
  static autoSave(manager: GameStateManager): boolean {
    try {
      const key = `${STORAGE_KEYS.GAME_STATE}_auto`;
      const state = manager.getState();
      const saveSlot: SaveSlot = {
        id: 0,
        playerName: state.player.name,
        chapter: state.player.currentChapter,
        level: state.player.level,
        playTime: state.totalPlayTime,
        savedAt: Date.now(),
        data: manager.toJSON(),
      };

      localStorage.setItem(key, JSON.stringify(saveSlot));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load auto-save
   */
  static loadAutoSave(): GameStateManager | null {
    try {
      const key = `${STORAGE_KEYS.GAME_STATE}_auto`;
      const saved = localStorage.getItem(key);

      if (!saved) {
        return null;
      }

      const saveSlot: SaveSlot = JSON.parse(saved);
      const saveData = JSON.parse(saveSlot.data);
      if (saveData.version && saveData.version !== CURRENT_SAVE_VERSION) {
        console.warn(`Auto-save version mismatch: save=${saveData.version}, current=${CURRENT_SAVE_VERSION}`);
      }
      const manager = GameStateManager.fromJSON(saveSlot.data);
      setGameStateManager(manager);

      return manager;
    } catch {
      return null;
    }
  }

  /**
   * Format play time for display
   */
  static formatPlayTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }

  /**
   * Save settings (separate from game state)
   */
  static saveSettings(settings: Record<string, unknown>): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load settings
   */
  static loadSettings(): Record<string, unknown> | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
}
