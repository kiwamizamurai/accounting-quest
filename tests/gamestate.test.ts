import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Phaser before importing modules that depend on it
vi.mock('phaser', () => ({
  default: {
    Events: {
      EventEmitter: class {
        on = vi.fn();
        off = vi.fn();
        emit = vi.fn();
        once = vi.fn();
        removeAllListeners = vi.fn();
      },
    },
  },
  Events: {
    EventEmitter: class {
      on = vi.fn();
      off = vi.fn();
      emit = vi.fn();
      once = vi.fn();
      removeAllListeners = vi.fn();
    },
  },
}));

import { GameStateManager } from '../src/state/GameStateManager';

describe('GameStateManager', () => {
  let manager: GameStateManager;

  beforeEach(() => {
    manager = new GameStateManager('TestPlayer');
  });

  describe('Player State', () => {
    it('should initialize with player name', () => {
      const player = manager.getPlayer();
      expect(player.name).toBe('TestPlayer');
      expect(player.level).toBe(1);
      expect(player.gold).toBe(0);
    });

    it('should add experience and level up', () => {
      const result = manager.addPlayerExp(150);
      const player = manager.getPlayer();

      expect(result.leveledUp).toBe(true);
      expect(player.level).toBe(2);
    });

    it('should track player position', () => {
      manager.setPlayerPosition(100, 200);
      const player = manager.getPlayer();

      expect(player.x).toBe(100);
      expect(player.y).toBe(200);
    });
  });

  describe('Accounting Operations', () => {
    it('should process transactions through the manager', () => {
      const processor = manager.getTransactionProcessor();
      const entry = processor.createOwnerInvestment(1000, manager.getCurrentDate());

      const result = manager.processTransaction(entry);

      expect(result.success).toBe(true);
      expect(manager.getCash()).toBe(1000);
    });

    it('should generate balance sheet', () => {
      const processor = manager.getTransactionProcessor();
      const entry = processor.createOwnerInvestment(1000, manager.getCurrentDate());
      manager.processTransaction(entry);

      const bs = manager.getBalanceSheet();
      expect(bs.totalAssets).toBe(1000);
      expect(bs.totalEquity).toBe(1000);
      expect(bs.isBalanced).toBe(true);
    });
  });

  describe('Date Management', () => {
    it('should advance days correctly', () => {
      const initialDate = manager.getCurrentDate();
      expect(initialDate.day).toBe(1);

      manager.advanceDay(5);
      const newDate = manager.getCurrentDate();
      expect(newDate.day).toBe(6);
    });

    it('should handle month rollover', () => {
      for (let i = 0; i < 35; i++) {
        manager.advanceDay();
      }
      const date = manager.getCurrentDate();
      expect(date.month).toBe(2);
    });
  });

  describe('Concept Learning', () => {
    it('should track learned concepts', () => {
      manager.learnConcept('Balance Sheet');
      manager.learnConcept('Accounting Equation');

      expect(manager.hasLearnedConcept('Balance Sheet')).toBe(true);
      expect(manager.hasLearnedConcept('Income Statement')).toBe(false);
    });

    it('should not duplicate concepts', () => {
      manager.learnConcept('Balance Sheet');
      manager.learnConcept('Balance Sheet');

      const player = manager.getPlayer();
      expect(player.masteredConcepts.filter(c => c === 'Balance Sheet').length).toBe(1);
    });
  });

  describe('Chapter Management', () => {
    it('should track current chapter', () => {
      expect(manager.getCurrentChapter()).toBe(1);

      manager.setCurrentChapter(2);
      expect(manager.getCurrentChapter()).toBe(2);
    });

    it('should track completed chapters', () => {
      manager.completeChapter(1);
      const player = manager.getPlayer();

      expect(player.completedChapters).toContain(1);
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize state', () => {
      // Set up some state
      const processor = manager.getTransactionProcessor();
      manager.processTransaction(processor.createOwnerInvestment(1000, manager.getCurrentDate()));
      manager.addPlayerExp(50);
      manager.learnConcept('Test Concept');

      // Serialize
      const json = manager.toJSON();

      // Deserialize
      const restored = GameStateManager.fromJSON(json);

      expect(restored.getCash()).toBe(1000);
      expect(restored.getPlayer().exp).toBe(50);
      expect(restored.hasLearnedConcept('Test Concept')).toBe(true);
    });
  });
});
