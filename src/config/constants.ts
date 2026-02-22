// Game Constants

// Display
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 16;
export const SCALE_FACTOR = 2;

// Colors (Accounting Categories)
export const COLORS = {
  ASSETS: 0x4a90d9,        // Blue
  LIABILITIES: 0xd94a4a,   // Red
  EQUITY: 0x4ad94a,        // Green
  REVENUE: 0xd9b44a,       // Gold
  EXPENSES: 0x9b4ad9,      // Purple

  // UI Colors
  BACKGROUND: 0x1a1a2e,
  PANEL: 0x2d2d44,
  TEXT: 0xffffff,
  TEXT_HIGHLIGHT: 0xffd700,
  BUTTON: 0x4a4a6a,
  BUTTON_HOVER: 0x6a6a8a,

  // RPG Colors
  HP: 0x22c55e,
  MP: 0x3b82f6,
  EXP: 0xeab308,
} as const;

// Animation
export const ANIMATION = {
  WALK_SPEED: 6,
  DIALOG_SPEED: 50,
  FADE_DURATION: 500,
} as const;

// Player
export const PLAYER = {
  SPEED: 160,
  STARTING_GOLD: 0,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  GAME_STATE: 'accounting_quest_save',
  SETTINGS: 'accounting_quest_settings',
} as const;

// Scene Keys
export const SCENES = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  LEVEL_SELECT: 'LevelSelectScene',
  CHAPTER_TITLE: 'ChapterTitleScene',
  VN: 'VNScene',
} as const;

// Depth Layers
export const DEPTH = {
  GROUND: 0,
  OBJECTS: 10,
  PLAYER: 20,
  NPC: 20,
  UI_BACKGROUND: 100,
  UI_PANEL: 110,
  UI_TEXT: 120,
  DIALOG: 200,
  TRANSITION: 300,
} as const;
