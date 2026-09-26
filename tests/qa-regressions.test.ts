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

import { AccountingEngine } from '../src/engine/accounting/AccountingEngine';
import { TransactionProcessor } from '../src/engine/accounting/TransactionProcessor';
import { ALL_ACCOUNT_DEFS, AccountCategory, createAccount, getAccountDefsForLevel } from '../src/models/Account';
import { GameDate } from '../src/models/Transaction';
import { GameStateManager } from '../src/state/GameStateManager';
import { SaveLoadManager } from '../src/state/SaveLoadManager';
import { setLanguage } from '../src/i18n';
import { formatMoney } from '../src/utils/MoneyFormatter';

const testDate: GameDate = { year: 1, month: 1, day: 1 };

// ---------------------------------------------------------------------------
// Chapter data: every account a chapter posts to must exist at that chapter's level.
// A missing account makes ScriptEngine log "Transaction failed ... Account not found" and
// silently skip the entry (Lv1 chapter 9 used TAX_EXPENSE, which only existed from Lv2).
// ---------------------------------------------------------------------------
const chapterModules = import.meta.glob('../src/data/chapters/chapter*.ts', { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

const chapters = Object.entries(chapterModules).map(([path, mod]) => {
  const id = Number(/chapter(\d+)\.ts$/.exec(path)![1]);
  const level = id < 100 ? 1 : id < 200 ? 2 : 3;
  return { id, level, script: mod[`chapter${id}`] };
});

const accountLevels = new Map(ALL_ACCOUNT_DEFS.map(def => [def.category as string, def.level]));

interface Posting {
  nodeId: string;
  entries: { account: string; debit?: number; credit?: number }[];
}

/** Collect every `entries` array (transactions, choice effects, ...) with the id of its node. */
function collectPostings(value: unknown, nodeId = '', out: Posting[] = []): Posting[] {
  if (Array.isArray(value)) {
    value.forEach(item => collectPostings(item, nodeId, out));
  } else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const id = typeof obj.id === 'string' && typeof obj.type === 'string' ? obj.id : nodeId;
    const entries = obj.entries;
    if (Array.isArray(entries) && entries.length > 0 && entries.every(e => e && typeof (e as { account?: unknown }).account === 'string')) {
      out.push({ nodeId: id, entries: entries as Posting['entries'] });
    }
    Object.values(obj).forEach(v => collectPostings(v, id, out));
  }
  return out;
}

describe('Chapter data', () => {
  it('loads all 32 chapters', () => {
    expect(chapters).toHaveLength(32);
  });

  it.each(chapters.map(c => [c.id, c] as const))('chapter %i only posts to accounts available at its level', (_id, chapter) => {
    const missing: string[] = [];
    for (const { nodeId, entries } of collectPostings(chapter.script)) {
      for (const { account } of entries) {
        const level = accountLevels.get(account);
        if (level === undefined || level > chapter.level) {
          missing.push(`${nodeId}: ${account} (${level === undefined ? 'unknown account' : `needs Lv${level}`})`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it.each(chapters.map(c => [c.id, c] as const))('chapter %i has balanced transactions', (_id, chapter) => {
    const unbalanced = collectPostings(chapter.script)
      .filter(({ entries }) => entries.reduce((s, e) => s + (e.debit ?? 0), 0) !== entries.reduce((s, e) => s + (e.credit ?? 0), 0))
      .map(({ nodeId }) => nodeId);
    expect(unbalanced).toEqual([]);
  });

  it('makes the tax expense account available from Lv1', () => {
    expect(getAccountDefsForLevel(1).map(d => d.category)).toContain(AccountCategory.TAX_EXPENSE);
  });
});

// ---------------------------------------------------------------------------
// Balance sheet: net income must appear once in the equity section
// ---------------------------------------------------------------------------
describe('Balance sheet net income row', () => {
  it('flags exactly one synthetic net income row in the equity section', () => {
    const accounts = new Map<AccountCategory, ReturnType<typeof createAccount>>();
    accounts.set(AccountCategory.CASH, createAccount(AccountCategory.CASH, 'Cash', '現金'));
    accounts.set(AccountCategory.INVENTORY, createAccount(AccountCategory.INVENTORY, 'Inventory', '棚卸資産'));
    accounts.set(AccountCategory.OWNERS_CAPITAL, createAccount(AccountCategory.OWNERS_CAPITAL, "Owner's Capital", '資本金'));
    accounts.set(AccountCategory.RETAINED_EARNINGS, createAccount(AccountCategory.RETAINED_EARNINGS, 'Retained Earnings', '利益剰余金'));
    accounts.set(AccountCategory.SALES_REVENUE, createAccount(AccountCategory.SALES_REVENUE, 'Sales Revenue', '売上高'));
    accounts.set(AccountCategory.COST_OF_GOODS_SOLD, createAccount(AccountCategory.COST_OF_GOODS_SOLD, 'Cost of Goods Sold', '売上原価'));
    const engine = new AccountingEngine(accounts, []);
    const processor = new TransactionProcessor(1);

    engine.processJournalEntry(processor.createOwnerInvestment(1000, testDate));
    engine.processJournalEntry(processor.createCashPurchase(200, testDate));
    for (const entry of processor.createCashSale(300, 100, testDate)) {
      engine.processJournalEntry(entry);
    }

    const bs = engine.getBalanceSheet();
    const netIncomeRows = bs.equity.filter(e => e.isNetIncome);

    expect(netIncomeRows).toHaveLength(1);
    expect(netIncomeRows[0].balance).toBe(bs.netIncome);
    expect(bs.netIncome).toBe(200);
    // The equity rows still add up to the total (the UI skips the flagged row and draws it itself)
    expect(bs.equity.reduce((sum, e) => sum + e.balance, 0)).toBe(bs.totalEquity);
    expect(bs.isBalanced).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Currency unit follows the language
// ---------------------------------------------------------------------------
describe('formatMoney', () => {
  it('uses 円 in Japanese and G in English', () => {
    setLanguage('ja');
    expect(formatMoney(1500)).toBe('1,500円');
    expect(formatMoney(-50)).toBe('-50円');
    expect(formatMoney(300, true)).toBe('+300円');

    setLanguage('en');
    expect(formatMoney(1500)).toBe('1,500G');
    expect(formatMoney(-50)).toBe('-50G');

    setLanguage('ja');
  });
});

// ---------------------------------------------------------------------------
// Auto-save: the title screen must be able to see and load it
// ---------------------------------------------------------------------------
describe('Auto-save', () => {
  beforeEach(() => {
    // Plain in-memory Storage: the localStorage that Node/jsdom provide differs between versions
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, String(value)),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
    });
  });

  it('reports no auto-save before anything is saved', () => {
    expect(SaveLoadManager.hasAutoSave()).toBe(false);
    expect(SaveLoadManager.getAutoSaveInfo()).toBeNull();
  });

  it('lists the auto-save with its chapter and restores it', () => {
    const manager = new GameStateManager('Tester', 1);
    manager.setCurrentChapter(4);

    expect(SaveLoadManager.autoSave(manager)).toBe(true);
    expect(SaveLoadManager.hasAutoSave()).toBe(true);

    const info = SaveLoadManager.getAutoSaveInfo();
    expect(info).not.toBeNull();
    expect(info!.chapter).toBe(4);
    expect(info!.playerName).toBe('Tester');
    expect(info).not.toHaveProperty('data');

    const restored = SaveLoadManager.loadAutoSave();
    expect(restored).not.toBeNull();
    expect(restored!.getPlayer().currentChapter).toBe(4);
  });

  it('stores the chapter-start snapshot instead of the mid-chapter state', () => {
    const manager = new GameStateManager('Tester', 1);
    manager.setCurrentChapter(2);
    const snapshot = manager.toJSON();

    // Post an entry after the snapshot was taken (a transaction played mid-chapter)
    const processor = new TransactionProcessor(2);
    manager.processTransaction(processor.createOwnerInvestment(500, testDate));
    expect(manager.getCash()).toBe(500);

    SaveLoadManager.autoSave(manager, snapshot);

    const restored = SaveLoadManager.loadAutoSave();
    expect(restored!.getCash()).toBe(0);
    expect(restored!.getPlayer().currentChapter).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Loading a save made before the account definitions changed
// ---------------------------------------------------------------------------
describe('Loading an older save', () => {
  it('adds accounts defined after the save was made and drops removed, unused ones', () => {
    const json = JSON.parse(new GameStateManager('Tester', 2).toJSON());
    // A save from before CASH_OVER_SHORT existed, that still has the removed SUPPLIES_EXPENSE account
    json.accounts = json.accounts.filter(([category]: [string]) => category !== 'CASH_OVER_SHORT');
    json.accounts.push([
      'SUPPLIES_EXPENSE',
      { id: 'SUPPLIES_EXPENSE', name: 'Supplies Expense', nameJa: '消耗品費', type: 'EXPENSE', category: 'SUPPLIES_EXPENSE', balance: 0, normalBalance: 'DEBIT', level: 1 },
    ]);

    const restored = GameStateManager.fromJSON(JSON.stringify(json));

    expect(restored.getAccounts().has(AccountCategory.CASH_OVER_SHORT)).toBe(true);
    expect(restored.getAccounts().has(AccountCategory.SUPPLIES_EXPENSE)).toBe(false);
  });
});
