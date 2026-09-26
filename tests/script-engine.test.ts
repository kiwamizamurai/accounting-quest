import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import { AccountCategory } from '../src/models/Account';
import { GameStateManager } from '../src/state/GameStateManager';
import { ScriptEngine, ScriptEngineCallback } from '../src/vn/ScriptEngine';
import { ConditionEvaluator, ENTRY_STATS } from '../src/vn/ConditionEvaluator';
import { CalcContext, evaluateCalc, resolveAmount, resolveEntries } from '../src/vn/Calc';
import { ChapterScript, ScriptNode, VNState } from '../src/vn/types';
import { getLanguage, setLanguage, t } from '../src/i18n';

// ---------------------------------------------------------------------------
// Calc
// ---------------------------------------------------------------------------
describe('evaluateCalc', () => {
  const ctx = (flags: Record<string, unknown> = {}): CalcContext => ({
    flags,
    balance: account => (account === 'CASH' ? 900 : 0),
    netIncome: () => 120,
  });

  it('reads numbers, flags, balances and net income', () => {
    expect(evaluateCalc(7, ctx())).toBe(7);
    expect(evaluateCalc({ flag: 'qty' }, ctx({ qty: 4 }))).toBe(4);
    expect(evaluateCalc({ balance: 'CASH' }, ctx())).toBe(900);
    expect(evaluateCalc({ netIncome: true }, ctx())).toBe(120);
  });

  it('does arithmetic left to right', () => {
    expect(evaluateCalc({ op: 'add', args: [1, 2, 3] }, ctx())).toBe(6);
    expect(evaluateCalc({ op: 'sub', args: [10, 3, 2] }, ctx())).toBe(5);
    expect(evaluateCalc({ op: 'mul', args: [2, 3, 4] }, ctx())).toBe(24);
    expect(evaluateCalc({ op: 'min', args: [4, 2, 9] }, ctx())).toBe(2);
    expect(evaluateCalc({ op: 'max', args: [4, 2, 9] }, ctx())).toBe(9);
  });

  it('rounds division down and treats division by zero as zero', () => {
    expect(evaluateCalc({ op: 'div', args: [{ balance: 'CASH' }, 50] }, ctx())).toBe(18);
    expect(evaluateCalc({ op: 'div', args: [7, 2] }, ctx())).toBe(3);
    expect(evaluateCalc({ op: 'div', args: [7, 0] }, ctx())).toBe(0);
  });

  it('looks a value up in a table by the greatest key not above the input', () => {
    const table = { op: 'table', of: { flag: 'price' }, table: { 100: 10, 150: 6, 200: 3 } } as const;
    expect(evaluateCalc(table, ctx({ price: 100 }))).toBe(10);
    expect(evaluateCalc(table, ctx({ price: 170 }))).toBe(6);
    expect(evaluateCalc(table, ctx({ price: 500 }))).toBe(3);
    expect(evaluateCalc(table, ctx({ price: 50 }))).toBe(10);
  });

  it('logs an error and uses zero for a flag that is not a number', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(evaluateCalc({ flag: 'missing' }, ctx())).toBe(0);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});

describe('resolveEntries', () => {
  it('turns flag amounts into numbers and leaves the other side unset', () => {
    expect(resolveAmount(undefined, {})).toBeUndefined();
    expect(resolveAmount(50, {})).toBe(50);
    expect(resolveAmount({ flag: 'cost' }, { cost: 300 })).toBe(300);
    expect(
      resolveEntries(
        [
          { account: 'INVENTORY', debit: { flag: 'cost' } },
          { account: 'CASH', credit: 300 },
        ],
        { cost: 300 }
      )
    ).toEqual([
      { account: 'INVENTORY', debit: 300 },
      { account: 'CASH', credit: 300 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// t()
// ---------------------------------------------------------------------------
describe('t placeholders', () => {
  beforeEach(() => setLanguage('ja'));

  it('fills every occurrence of a placeholder', () => {
    expect(t('{n}個と{n}個', { n: 3 })).toBe('3個と3個');
  });

  it('writes {name:money} as an amount in the currency of the language', () => {
    expect(t('元手は{cash:money}', { cash: 1500 })).toBe('元手は1,500円');
    setLanguage('en');
    expect(t('Capital: {cash:money}', { cash: 1500 })).toBe('Capital: 1,500G');
    expect(getLanguage()).toBe('en');
  });

  it('leaves a placeholder that has no value', () => {
    expect(t('{a} と {b}', { a: 1 })).toBe('1 と {b}');
  });
});

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------
describe('ConditionEvaluator', () => {
  let gm: GameStateManager;
  let evaluator: ConditionEvaluator;
  const state = (flags: Record<string, unknown>): VNState => ({
    currentNodeId: '',
    currentChapter: 1,
    flags,
    charactersOnScreen: new Map(),
    currentBackground: '',
    choiceHistory: [],
  });

  beforeEach(() => {
    gm = new GameStateManager('Test', 1);
    evaluator = new ConditionEvaluator(gm);
  });

  it('compares numeric flags', () => {
    expect(evaluator.evaluate({ type: 'flag_gte', flag: 'n', amount: 5 }, state({ n: 5 }))).toBe(true);
    expect(evaluator.evaluate({ type: 'flag_gte', flag: 'n', amount: 6 }, state({ n: 5 }))).toBe(false);
    expect(evaluator.evaluate({ type: 'flag_lte', flag: 'n', amount: 5 }, state({ n: 5 }))).toBe(true);
    expect(evaluator.evaluate({ type: 'flag_lte', flag: 'n', amount: 5 }, state({ n: '5' }))).toBe(false);
    expect(evaluator.evaluate({ type: 'flag_lte', flag: 'n', amount: 5 }, state({}))).toBe(false);
  });

  it('compares net income', () => {
    gm.resetBooks({ CASH: 1000 });
    gm.processTransaction({
      id: 'x',
      date: gm.getCurrentDate(),
      description: '',
      descriptionJa: '',
      lines: [
        { accountCategory: AccountCategory.CASH, debit: 300, credit: 0 },
        { accountCategory: AccountCategory.SALES_REVENUE, debit: 0, credit: 300 },
      ],
      eventType: 'VN_SCRIPT_TRANSACTION' as never,
      chapter: 1,
      validated: false,
    });
    expect(evaluator.evaluate({ type: 'net_income_gte', amount: 300 }, state({}))).toBe(true);
    expect(evaluator.evaluate({ type: 'net_income_gte', amount: 301 }, state({}))).toBe(false);
    expect(evaluator.evaluate({ type: 'net_income_lte', amount: 300 }, state({}))).toBe(true);
  });

  it('measures the accuracy of the player entries, and is perfect when there were none', () => {
    const half = state({ [ENTRY_STATS.total]: 2, [ENTRY_STATS.firstTry]: 1 });
    expect(evaluator.evaluate({ type: 'accuracy_gte', amount: 1 }, state({}))).toBe(true);
    expect(evaluator.evaluate({ type: 'accuracy_gte', amount: 0.5 }, half)).toBe(true);
    expect(evaluator.evaluate({ type: 'accuracy_gte', amount: 0.6 }, half)).toBe(false);
  });

  it('holds for `all` only when every condition holds', () => {
    const both = { type: 'all', all: [{ type: 'flag_gte', flag: 'a', amount: 1 }, { type: 'flag_gte', flag: 'b', amount: 1 }] } as const;
    expect(evaluator.evaluate(both, state({ a: 1, b: 1 }))).toBe(true);
    expect(evaluator.evaluate(both, state({ a: 1, b: 0 }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GameStateManager: opening balances and chapter results
// ---------------------------------------------------------------------------
describe('GameStateManager.resetBooks', () => {
  it('sets the opening balances and lets retained earnings balance the books', () => {
    const gm = new GameStateManager('Test', 1);
    gm.resetBooks({ CASH: 800, INVENTORY: 200, LOANS_PAYABLE: 300, OWNERS_CAPITAL: 500 });

    expect(gm.getAccountBalance(AccountCategory.CASH)).toBe(800);
    expect(gm.getAccountBalance(AccountCategory.INVENTORY)).toBe(200);
    expect(gm.getAccountBalance(AccountCategory.LOANS_PAYABLE)).toBe(300);
    expect(gm.getAccountBalance(AccountCategory.OWNERS_CAPITAL)).toBe(500);
    expect(gm.getAccountBalance(AccountCategory.RETAINED_EARNINGS)).toBe(200);
    expect(gm.getBalanceSheet().isBalanced).toBe(true);
    expect(gm.getJournalEntries()).toHaveLength(1);
  });

  it('forgets everything from before, including the income statement', () => {
    const gm = new GameStateManager('Test', 1);
    gm.resetBooks({ CASH: 500, OWNERS_CAPITAL: 500 });
    gm.processTransaction({
      id: 'sale',
      date: gm.getCurrentDate(),
      description: '',
      descriptionJa: '',
      lines: [
        { accountCategory: AccountCategory.CASH, debit: 200, credit: 0 },
        { accountCategory: AccountCategory.SALES_REVENUE, debit: 0, credit: 200 },
      ],
      eventType: 'VN_SCRIPT_TRANSACTION' as never,
      chapter: 1,
      validated: false,
    });

    gm.resetBooks({ CASH: 100, INVENTORY: 50 });

    expect(gm.getAccountBalance(AccountCategory.SALES_REVENUE)).toBe(0);
    expect(gm.getAccountBalance(AccountCategory.OWNERS_CAPITAL)).toBe(0);
    expect(gm.getAccountBalance(AccountCategory.CASH)).toBe(100);
    expect(gm.getIncomeStatement().netIncome).toBe(0);
    expect(gm.getBalanceSheet().isBalanced).toBe(true);
    expect(gm.getJournalEntries()).toHaveLength(1);
  });

  it('puts a negative asset balance (a contra account) on the credit side', () => {
    const gm = new GameStateManager('Test', 1);
    gm.resetBooks({ EQUIPMENT: 1000, ACCUMULATED_DEPRECIATION: -200, OWNERS_CAPITAL: 800 });
    expect(gm.getAccountBalance(AccountCategory.ACCUMULATED_DEPRECIATION)).toBe(-200);
    expect(gm.getBalanceSheet().isBalanced).toBe(true);
  });
});

describe('GameStateManager.setChapterResult', () => {
  it('keeps the best result over all attempts', () => {
    const gm = new GameStateManager('Test', 1);
    gm.setChapterResult(1, 2, 3);
    gm.setChapterResult(1, 1, 3);
    expect(gm.getChapterProgress(1)?.score).toBe(2);
    gm.setChapterResult(1, 3, 3);
    expect(gm.getChapterProgress(1)?.score).toBe(3);
    expect(gm.getChapterProgress(1)?.maxScore).toBe(3);
  });

  it('survives a save and load', () => {
    const gm = new GameStateManager('Test', 1);
    gm.setChapterResult(4, 3, 3);
    const loaded = GameStateManager.fromJSON(gm.toJSON());
    expect(loaded.getChapterProgress(4)?.score).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// ScriptEngine
// ---------------------------------------------------------------------------
function setup(
  nodes: ScriptNode[],
  extra: Partial<ChapterScript> = {},
  overrides: Partial<ScriptEngineCallback> = {}
) {
  const gm = new GameStateManager('Test', 1);
  const engine = new ScriptEngine(gm);
  engine.registerChapter({ id: 1, titleKey: 't', subtitleKey: 's', nodes, ...extra });
  const callbacks: ScriptEngineCallback = {
    onDialog: vi.fn(),
    onChoice: vi.fn(),
    onTransaction: vi.fn(),
    onReport: vi.fn(),
    onNarration: vi.fn(),
    onCharacterEnter: vi.fn(),
    onCharacterExit: vi.fn(),
    onBackgroundChange: vi.fn(),
    onWait: vi.fn(),
    onChapterEnd: vi.fn(),
    onQuiz: vi.fn(),
    onJournalEntryInput: vi.fn(),
    ...overrides,
  };
  engine.setCallbacks(callbacks);
  return { gm, engine, callbacks };
}

const end: ScriptNode = { id: 'end', type: 'dialog', speaker: 'mentor', textKey: 'end', next: 'end' };

describe('ScriptEngine: calc and flag amounts', () => {
  it('computes flags and posts a transaction with flag amounts', () => {
    const { gm, engine, callbacks } = setup(
      [
        { id: 'qty', type: 'set_flag', flags: { qty: 4 }, next: 'cost' },
        { id: 'cost', type: 'calc', set: 'cost', expr: { op: 'mul', args: [{ flag: 'qty' }, 50] }, next: 'buy' },
        {
          id: 'buy',
          type: 'transaction',
          descriptionKey: 'buy',
          entries: [
            { account: 'INVENTORY', debit: { flag: 'cost' } },
            { account: 'CASH', credit: { flag: 'cost' } },
          ],
          showAnimation: false,
          next: 'end',
        },
        end,
      ],
      { opening: { CASH: 1000, OWNERS_CAPITAL: 1000 } }
    );
    engine.startChapter(1);

    expect(engine.getVNState().flags.cost).toBe(200);
    expect(gm.getAccountBalance(AccountCategory.INVENTORY)).toBe(200);
    expect(gm.getAccountBalance(AccountCategory.CASH)).toBe(800);
    expect(callbacks.onTransaction).toHaveBeenCalledWith(
      'buy',
      [
        { account: 'INVENTORY', debit: 200, credit: undefined },
        { account: 'CASH', debit: undefined, credit: 200 },
      ],
      false
    );
  });

  it('starts the chapter from its opening balances', () => {
    const { gm, engine } = setup([end], { opening: { CASH: 500, OWNERS_CAPITAL: 500 } });
    engine.startChapter(1);
    expect(gm.getCash()).toBe(500);
    expect(gm.getBalanceSheet().isBalanced).toBe(true);
  });
});

describe('ScriptEngine: number input', () => {
  const buyNode: ScriptNode = {
    id: 'ask',
    type: 'number_input',
    promptKey: 'how many',
    flag: 'qty',
    min: 0,
    max: { op: 'div', args: [{ balance: 'CASH' }, 50] },
    step: 1,
    initial: 5,
    preview: { textKey: '{qty} cups cost {cost} and leave {left}', values: { cost: { op: 'mul', args: [{ flag: 'qty' }, 50] }, left: { op: 'sub', args: [{ balance: 'CASH' }, { op: 'mul', args: [{ flag: 'qty' }, 50] }] } } },
    next: 'end',
  };
  const opening = { opening: { CASH: 520, OWNERS_CAPITAL: 520 } };

  it('asks with a range that follows the cash on hand', () => {
    const onNumberInput = vi.fn();
    const { engine } = setup([buyNode, end], opening, { onNumberInput });
    engine.startChapter(1);

    expect(onNumberInput).toHaveBeenCalledTimes(1);
    const request = onNumberInput.mock.calls[0][0];
    expect(request).toMatchObject({ prompt: 'how many', min: 0, max: 10, step: 1, initial: 5 });
    expect(request.preview(4)).toBe('4 cups cost 200 and leave 320');
  });

  it('stores the picked number, snapped into the range, and moves on', () => {
    const onNumberInput = vi.fn();
    const { engine, callbacks } = setup([buyNode, end], opening, { onNumberInput });
    engine.startChapter(1);

    expect(engine.submitNumber(99)).toBe(10);
    expect(engine.getVNState().flags.qty).toBe(10);
    expect(callbacks.onDialog).toHaveBeenCalledTimes(1);
  });

  it('snaps to the step and never goes below the minimum', () => {
    const onNumberInput = vi.fn();
    const stepped: ScriptNode = { ...buyNode, min: 100, max: 400, step: 50, initial: undefined } as ScriptNode;
    const { engine } = setup([stepped, end], opening, { onNumberInput });
    engine.startChapter(1);

    expect(onNumberInput.mock.calls[0][0]).toMatchObject({ min: 100, max: 400, step: 50, initial: 100 });
    expect(engine.submitNumber(240)).toBe(250);
  });

  it('takes the initial value when the UI cannot ask', () => {
    const { engine, callbacks } = setup([buyNode, end], opening);
    engine.startChapter(1);
    expect(engine.getVNState().flags.qty).toBe(5);
    expect(callbacks.onDialog).toHaveBeenCalledTimes(1);
  });
});

describe('ScriptEngine: player entries', () => {
  const nodes: ScriptNode[] = [
    { id: 'set', type: 'set_flag', flags: { cost: 200 }, next: 'buy' },
    {
      id: 'buy',
      type: 'transaction',
      descriptionKey: 'buy',
      entries: [
        { account: 'INVENTORY', debit: { flag: 'cost' } },
        { account: 'CASH', credit: { flag: 'cost' } },
      ],
      showAnimation: true,
      entry: 'player',
      hintKey: 'hint',
      attempts: 2,
      next: 'end',
    },
    end,
  ];
  const opening = { opening: { CASH: 1000, OWNERS_CAPITAL: 1000 } };
  const right = [
    { account: 'CASH', credit: 200 },
    { account: 'INVENTORY', debit: 200 },
  ];
  const wrong = [
    { account: 'CASH', credit: 200 },
    { account: 'EQUIPMENT', debit: 200 },
  ];

  it('asks for the entry without recording it yet', () => {
    const onPlayerTransaction = vi.fn();
    const { gm, engine, callbacks } = setup(nodes, opening, { onPlayerTransaction });
    engine.startChapter(1);

    expect(onPlayerTransaction).toHaveBeenCalledWith({
      description: 'buy',
      entries: [
        { account: 'INVENTORY', debit: 200, credit: undefined },
        { account: 'CASH', debit: undefined, credit: 200 },
      ],
      hint: 'hint',
      attempts: 2,
    });
    expect(callbacks.onTransaction).not.toHaveBeenCalled();
    expect(gm.getAccountBalance(AccountCategory.INVENTORY)).toBe(0);
  });

  it('records the entry once the player gets it right, and counts a first-try hit', () => {
    const { gm, engine } = setup(nodes, opening, { onPlayerTransaction: vi.fn() });
    engine.startChapter(1);

    expect(engine.submitPlayerEntry(right)).toEqual({ correct: true, done: true });
    expect(gm.getAccountBalance(AccountCategory.INVENTORY)).toBe(200);
    expect(gm.getCash()).toBe(800);
    expect(engine.getCurrentNode()?.id).toBe('end');
    expect(engine.getVNState().flags[ENTRY_STATS.total]).toBe(1);
    expect(engine.getVNState().flags[ENTRY_STATS.firstTry]).toBe(1);
    expect(engine.getVNState().flags[ENTRY_STATS.mistakes]).toBeUndefined();
  });

  it('lets the player try again after a mistake without recording anything', () => {
    const { gm, engine } = setup(nodes, opening, { onPlayerTransaction: vi.fn() });
    engine.startChapter(1);

    expect(engine.submitPlayerEntry(wrong)).toEqual({ correct: false, done: false });
    expect(gm.getAccountBalance(AccountCategory.INVENTORY)).toBe(0);
    expect(engine.getCurrentNode()?.id).toBe('buy');

    expect(engine.submitPlayerEntry(right)).toEqual({ correct: true, done: true });
    expect(gm.getAccountBalance(AccountCategory.INVENTORY)).toBe(200);
    expect(engine.getVNState().flags[ENTRY_STATS.total]).toBe(1);
    expect(engine.getVNState().flags[ENTRY_STATS.firstTry]).toBeUndefined();
    expect(engine.getVNState().flags[ENTRY_STATS.mistakes]).toBe(1);
  });

  it('records the correct entry itself when the tries run out', () => {
    const { gm, engine } = setup(nodes, opening, { onPlayerTransaction: vi.fn() });
    engine.startChapter(1);

    expect(engine.submitPlayerEntry(wrong)).toEqual({ correct: false, done: false });
    expect(engine.submitPlayerEntry(wrong)).toEqual({ correct: false, done: true });
    expect(gm.getAccountBalance(AccountCategory.INVENTORY)).toBe(200);
    expect(gm.getBalanceSheet().isBalanced).toBe(true);
    expect(engine.getVNState().flags[ENTRY_STATS.mistakes]).toBe(2);
  });

  it('records the entry automatically when the UI cannot ask', () => {
    const { gm, engine, callbacks } = setup(nodes, opening);
    engine.startChapter(1);
    expect(gm.getAccountBalance(AccountCategory.INVENTORY)).toBe(200);
    expect(callbacks.onTransaction).toHaveBeenCalled();
  });
});

describe('ScriptEngine: practice journal entry', () => {
  it('checks the entry against flag amounts and counts it', () => {
    const onJournalEntryInput = vi.fn();
    const { engine } = setup(
      [
        { id: 'set', type: 'set_flag', flags: { sales: 300 }, next: 'je' },
        {
          id: 'je',
          type: 'journal_entry_input',
          promptKey: 'p',
          expectedEntries: [
            { account: 'CASH', debit: { flag: 'sales' } },
            { account: 'SALES_REVENUE', credit: { flag: 'sales' } },
          ],
          correctFeedbackKey: 'ok',
          incorrectFeedbackKey: 'ng',
          next: 'end',
        },
        end,
      ],
      {},
      { onJournalEntryInput }
    );
    engine.startChapter(1);

    expect(onJournalEntryInput.mock.calls[0][1]).toEqual([
      { account: 'CASH', debit: 300, credit: undefined },
      { account: 'SALES_REVENUE', debit: undefined, credit: 300 },
    ]);
    expect(
      engine.submitJournalEntry([
        { account: 'SALES_REVENUE', credit: 300 },
        { account: 'CASH', debit: 300 },
      ])
    ).toBe(true);
    expect(engine.getVNState().flags[ENTRY_STATS.total]).toBe(1);
    expect(engine.getVNState().flags[ENTRY_STATS.firstTry]).toBe(1);
  });
});

describe('ScriptEngine: locked choices', () => {
  const nodes: ScriptNode[] = [
    { id: 'set', type: 'set_flag', flags: { budget: 100 }, next: 'pick' },
    {
      id: 'pick',
      type: 'choice',
      promptKey: 'pick',
      choices: [
        { labelKey: 'cheap', next: 'end', effects: { setFlags: { bought: 'cheap' } } },
        {
          labelKey: 'costly',
          next: 'end',
          requires: { type: 'flag_gte', flag: 'budget', amount: 500 },
          lockedKey: 'not enough budget',
          effects: { setFlags: { bought: 'costly' } },
        },
      ],
    },
    end,
  ];

  it('hands the UI the locked state and the reason', () => {
    const { engine, callbacks } = setup(nodes);
    engine.startChapter(1);

    const choices = (callbacks.onChoice as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(choices.map((c: { locked: boolean }) => c.locked)).toEqual([false, true]);
    expect(choices[0].label).toBe('cheap');
    expect(choices[1].lockedText).toBe('not enough budget');
  });

  it('ignores a locked choice and accepts an open one', () => {
    const { engine } = setup(nodes);
    engine.startChapter(1);

    engine.selectChoice(1);
    expect(engine.getCurrentNode()?.id).toBe('pick');
    expect(engine.getVNState().flags.bought).toBeUndefined();

    engine.selectChoice(0);
    expect(engine.getCurrentNode()?.id).toBe('end');
    expect(engine.getVNState().flags.bought).toBe('cheap');
  });

  it('lets a choice post a transaction from flags it has just set', () => {
    const { gm, engine } = setup(
      [
        {
          id: 'pick',
          type: 'choice',
          promptKey: 'pick',
          choices: [
            {
              labelKey: 'invest',
              next: 'end',
              effects: {
                setFlags: { capital: 700 },
                transaction: {
                  entries: [
                    { account: 'CASH', debit: { flag: 'capital' } },
                    { account: 'OWNERS_CAPITAL', credit: { flag: 'capital' } },
                  ],
                },
              },
            },
          ],
        },
        end,
      ]
    );
    engine.startChapter(1);
    engine.selectChoice(0);
    expect(gm.getCash()).toBe(700);
  });
});

describe('ScriptEngine: chapter rating', () => {
  const nodes: ScriptNode[] = [
    {
      id: 'sale',
      type: 'transaction',
      descriptionKey: 'sale',
      entries: [
        { account: 'CASH', debit: 500 },
        { account: 'SALES_REVENUE', credit: 500 },
      ],
      showAnimation: false,
      next: 'fin',
    },
    {
      id: 'fin',
      type: 'chapter_end',
      rating: [
        { labelKey: 'profit of {goal:money}', when: { type: 'net_income_gte', amount: 400 } },
        { labelKey: 'lots of cash', when: { type: 'account_gte', account: 'CASH', amount: 1000 } },
        { labelKey: 'no mistakes', when: { type: 'accuracy_gte', amount: 1 } },
      ],
    },
  ];

  it('counts the goals met as stars and saves the result', () => {
    const { gm, engine, callbacks } = setup(nodes);
    engine.startChapter(1);
    engine.advance('fin');

    expect(callbacks.onChapterEnd).toHaveBeenCalledWith(undefined, undefined, {
      goals: [
        { label: 'profit of {goal:money}', met: true },
        { label: 'lots of cash', met: false },
        { label: 'no mistakes', met: true },
      ],
      stars: 2,
    });
    expect(gm.getChapterProgress(1)).toMatchObject({ score: 2, maxScore: 3, completed: true });
  });

  it('gives no result for a chapter without goals', () => {
    const { engine, callbacks } = setup([{ id: 'fin', type: 'chapter_end', nextChapter: 2 }]);
    engine.startChapter(1);
    expect(callbacks.onChapterEnd).toHaveBeenCalledWith(2, undefined, undefined);
  });
});
