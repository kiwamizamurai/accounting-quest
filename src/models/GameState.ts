import { Account, AccountCategory, createAccount, getAccountDefsForLevel } from './Account';
import { JournalEntry, GameDate } from './Transaction';
import { ChapterProgress, Quest } from './Chapter';
import { Player, createNewPlayer } from './Player';

export interface GameState {
  // Player data
  player: Player;

  // Accounting data
  accounts: Map<AccountCategory, Account>;
  journalEntries: JournalEntry[];
  currentDate: GameDate;

  // Progress
  chapterProgress: Map<number, ChapterProgress>;
  activeQuests: Quest[];
  completedQuests: string[];

  // Inventory (RPG items)
  inventory: InventoryItem[];

  // VN state
  vnState?: VNSaveState;

  // Settings
  settings: GameSettings;

  // Game level
  gameLevel: 1 | 2 | 3;

  // Meta
  version: string;
  createdAt: number;
  updatedAt: number;
  totalPlayTime: number;
}

export interface VNSaveState {
  currentNodeId: string;
  currentChapter: number;
  flags: Record<string, unknown>;
  charactersOnScreen: [string, string][];
  currentBackground: string;
  choiceHistory: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  quantity: number;
  type: ItemType;
  value: number;
}

export enum ItemType {
  MATERIAL = 'MATERIAL',
  PRODUCT = 'PRODUCT',
  EQUIPMENT = 'EQUIPMENT',
  KEY_ITEM = 'KEY_ITEM',
  DOCUMENT = 'DOCUMENT',
}

export interface GameSettings {
  language: 'ja' | 'en';
  musicVolume: number;
  sfxVolume: number;
  textSpeed: 'slow' | 'normal' | 'fast';
  showTutorials: boolean;
  bgmEnabled: boolean;
}

export const CURRENT_SAVE_VERSION = '1.0.0';

export function createInitialGameState(playerName: string, level: 1 | 2 | 3 = 1): GameState {
  const accounts = new Map<AccountCategory, Account>();

  // Initialize accounts based on game level
  const accountDefs = getAccountDefsForLevel(level);
  for (const def of accountDefs) {
    accounts.set(def.category, createAccount(def.category, def.name, def.nameJa, def.level));
  }

  return {
    player: createNewPlayer(playerName),
    accounts,
    journalEntries: [],
    gameLevel: level,
    currentDate: { year: 1, month: 1, day: 1 },
    chapterProgress: new Map(),
    activeQuests: [],
    completedQuests: [],
    inventory: [],
    settings: {
      language: 'ja',
      musicVolume: 0.7,
      sfxVolume: 0.8,
      textSpeed: 'normal',
      showTutorials: true,
      bgmEnabled: true,
    },
    version: CURRENT_SAVE_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    totalPlayTime: 0,
  };
}
