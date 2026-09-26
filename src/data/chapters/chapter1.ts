import { CalcExpr, ChapterScript, ChoiceOption, ScriptNode } from '../../vn/types';

// Customers that come at each price; a cup costs 50 to make. Selling at 150 pays best when there is stock for all six.
const DEMAND_BY_PRICE: Record<number, number> = { 100: 10, 150: 6, 200: 3 };
const CUP_COST = 50;

const demand = (price: CalcExpr): CalcExpr => ({ op: 'table', of: price, table: DEMAND_BY_PRICE });

const invest = (labelKey: string, capital: number): ChoiceOption => ({
  labelKey,
  next: 'enter_capital',
  effects: { setFlags: { capital } },
});

// Only the amounts the cash on hand can pay for can be picked
const buy = (labelKey: string, qty: number): ChoiceOption => ({
  labelKey,
  next: 'calc_cost',
  requires: { type: 'account_gte', account: 'CASH', amount: qty * CUP_COST },
  lockedKey: 'ch1.ask_qty.locked',
  effects: { setFlags: { qty } },
});

const sellAt = (labelKey: string, price: number): ChoiceOption => ({
  labelKey,
  next: 'calc_demand',
  effects: { setFlags: { price } },
});

const nodes: ScriptNode[] = [
  // === Opening: the accounting equation and the day's forecast ===
  { id: 'start', type: 'background', background: 'lemonade_stand', next: 'mentor_enter' },
  { id: 'mentor_enter', type: 'character_enter', character: 'mentor', position: 'right', expression: 'happy', next: 'dialog_1' },
  { id: 'dialog_1', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_1', expression: 'happy', next: 'dialog_3' },
  { id: 'dialog_3', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_3', expression: 'thinking', next: 'dialog_forecast' },
  { id: 'dialog_forecast', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_forecast', expression: 'normal', next: 'dialog_capital' },
  { id: 'dialog_capital', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_capital', expression: 'normal', next: 'ask_capital' },

  // === Decide 1: the capital, and record it ===
  {
    id: 'ask_capital',
    type: 'choice',
    speaker: 'mentor',
    promptKey: 'ch1.ask_capital.prompt',
    choices: [invest('ch1.ask_capital.0', 300), invest('ch1.ask_capital.1', 500), invest('ch1.ask_capital.2', 800)],
  },
  {
    id: 'enter_capital',
    type: 'transaction',
    entry: 'player',
    descriptionKey: 'ch1.enter_capital.desc',
    hintKey: 'ch1.enter_capital.hint',
    entries: [
      { account: 'CASH', debit: { flag: 'capital' } },
      { account: 'OWNERS_CAPITAL', credit: { flag: 'capital' } },
    ],
    distractors: [
      [
        { account: 'OWNERS_CAPITAL', debit: { flag: 'capital' } },
        { account: 'CASH', credit: { flag: 'capital' } },
      ],
      [
        { account: 'CASH', debit: { flag: 'capital' } },
        { account: 'LOANS_PAYABLE', credit: { flag: 'capital' } },
      ],
    ],
    eventType: 'OWNER_INVESTMENT',
    showAnimation: false,
    next: 'dialog_capital_result',
  },
  { id: 'dialog_capital_result', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_capital_result', expression: 'happy', next: 'show_first_bs' },
  { id: 'show_first_bs', type: 'report', reportType: 'balance_sheet', messageKey: 'ch1.show_first_bs.msg', next: 'transition_to_shop' },

  // === Decide 2: how many cups of supplies to buy, and record it ===
  { id: 'transition_to_shop', type: 'background', background: 'supply_shop', next: 'supplier_enter' },
  { id: 'supplier_enter', type: 'character_enter', character: 'supplier', position: 'left', expression: 'happy', next: 'dialog_shop' },
  { id: 'dialog_shop', type: 'dialog', speaker: 'supplier', textKey: 'ch1.dialog_shop', expression: 'happy', next: 'ask_qty' },
  {
    id: 'ask_qty',
    type: 'choice',
    speaker: 'supplier',
    promptKey: 'ch1.ask_qty.prompt',
    choices: [buy('ch1.ask_qty.0', 4), buy('ch1.ask_qty.1', 6), buy('ch1.ask_qty.2', 10)],
  },
  { id: 'calc_cost', type: 'calc', set: 'cost', expr: { op: 'mul', args: [{ flag: 'qty' }, CUP_COST] }, next: 'enter_buy' },
  {
    id: 'enter_buy',
    type: 'transaction',
    entry: 'player',
    descriptionKey: 'ch1.enter_buy.desc',
    hintKey: 'ch1.enter_buy.hint',
    entries: [
      { account: 'INVENTORY', debit: { flag: 'cost' } },
      { account: 'CASH', credit: { flag: 'cost' } },
    ],
    distractors: [
      [
        { account: 'CASH', debit: { flag: 'cost' } },
        { account: 'INVENTORY', credit: { flag: 'cost' } },
      ],
      [
        { account: 'COST_OF_GOODS_SOLD', debit: { flag: 'cost' } },
        { account: 'CASH', credit: { flag: 'cost' } },
      ],
    ],
    eventType: 'PURCHASE_INVENTORY',
    showAnimation: false,
    next: 'after_buy',
  },
  { id: 'after_buy', type: 'dialog', speaker: 'mentor', textKey: 'ch1.after_buy', expression: 'happy', next: 'show_bs_after_buy' },
  { id: 'show_bs_after_buy', type: 'report', reportType: 'balance_sheet', messageKey: 'ch1.show_bs_after_buy.msg', next: 'supplier_exit' },
  { id: 'supplier_exit', type: 'character_exit', character: 'supplier', next: 'transition_to_stand' },

  // === Decide 3: the price. The result depends on stock and price together ===
  { id: 'transition_to_stand', type: 'background', background: 'lemonade_stand', next: 'customer_enter' },
  { id: 'customer_enter', type: 'character_enter', character: 'customer', position: 'left', expression: 'happy', next: 'dialog_price' },
  { id: 'dialog_price', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_price', expression: 'normal', next: 'ask_price' },
  {
    id: 'ask_price',
    type: 'choice',
    speaker: 'mentor',
    promptKey: 'ch1.ask_price.prompt',
    choices: [sellAt('ch1.ask_price.0', 100), sellAt('ch1.ask_price.1', 150), sellAt('ch1.ask_price.2', 200)],
  },
  { id: 'calc_demand', type: 'calc', set: 'demand', expr: demand({ flag: 'price' }), next: 'calc_sold' },
  { id: 'calc_sold', type: 'calc', set: 'sold', expr: { op: 'min', args: [{ flag: 'qty' }, { flag: 'demand' }] }, next: 'calc_revenue' },
  { id: 'calc_revenue', type: 'calc', set: 'revenue', expr: { op: 'mul', args: [{ flag: 'sold' }, { flag: 'price' }] }, next: 'calc_cogs' },
  { id: 'calc_cogs', type: 'calc', set: 'cogs', expr: { op: 'mul', args: [{ flag: 'sold' }, CUP_COST] }, next: 'calc_unsold' },
  { id: 'calc_unsold', type: 'calc', set: 'unsold', expr: { op: 'sub', args: [{ flag: 'qty' }, { flag: 'sold' }] }, next: 'calc_lost' },
  { id: 'calc_lost', type: 'calc', set: 'lost', expr: { op: 'sub', args: [{ flag: 'demand' }, { flag: 'sold' }] }, next: 'sales_result' },
  { id: 'sales_result', type: 'narration', textKey: 'ch1.sales_result', next: 'enter_sale' },

  // === Record the sale: two entries, both entered by the player ===
  {
    id: 'enter_sale',
    type: 'transaction',
    entry: 'player',
    descriptionKey: 'ch1.enter_sale.desc',
    hintKey: 'ch1.enter_sale.hint',
    entries: [
      { account: 'CASH', debit: { flag: 'revenue' } },
      { account: 'SALES_REVENUE', credit: { flag: 'revenue' } },
    ],
    distractors: [
      [
        { account: 'SALES_REVENUE', debit: { flag: 'revenue' } },
        { account: 'CASH', credit: { flag: 'revenue' } },
      ],
      [
        { account: 'ACCOUNTS_RECEIVABLE', debit: { flag: 'revenue' } },
        { account: 'SALES_REVENUE', credit: { flag: 'revenue' } },
      ],
    ],
    eventType: 'CASH_SALE',
    showAnimation: false,
    next: 'enter_cogs',
  },
  {
    id: 'enter_cogs',
    type: 'transaction',
    entry: 'player',
    descriptionKey: 'ch1.enter_cogs.desc',
    hintKey: 'ch1.enter_cogs.hint',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: { flag: 'cogs' } },
      { account: 'INVENTORY', credit: { flag: 'cogs' } },
    ],
    distractors: [
      [
        { account: 'INVENTORY', debit: { flag: 'cogs' } },
        { account: 'COST_OF_GOODS_SOLD', credit: { flag: 'cogs' } },
      ],
      [
        { account: 'COST_OF_GOODS_SOLD', debit: { flag: 'cogs' } },
        { account: 'CASH', credit: { flag: 'cogs' } },
      ],
    ],
    eventType: 'SELL_INVENTORY',
    showAnimation: false,
    next: 'dialog_sale_explain_1',
  },
  { id: 'dialog_sale_explain_1', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_sale_explain_1', expression: 'thinking', next: 'dialog_sale_explain_2' },
  { id: 'dialog_sale_explain_2', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_sale_explain_2', expression: 'happy', next: 'customer_exit' },
  { id: 'customer_exit', type: 'character_exit', character: 'customer', next: 'show_first_pl' },
  { id: 'show_first_pl', type: 'report', reportType: 'income_statement', messageKey: 'ch1.show_first_pl.msg', next: 'dialog_pl_explain' },
  { id: 'dialog_pl_explain', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_pl_explain', expression: 'thinking', next: 'check_unsold' },

  // === What the decisions led to: leftover stock, a sell-out with lost sales, or a perfect match ===
  { id: 'check_unsold', type: 'conditional', condition: { type: 'flag_gte', flag: 'unsold', amount: 1 }, trueNext: 'dialog_unsold', falseNext: 'check_lost' },
  { id: 'dialog_unsold', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_unsold', expression: 'thinking', next: 'end_of_day' },
  { id: 'check_lost', type: 'conditional', condition: { type: 'flag_gte', flag: 'lost', amount: 1 }, trueNext: 'dialog_lost', falseNext: 'dialog_perfect' },
  { id: 'dialog_lost', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_lost', expression: 'surprised', next: 'end_of_day' },
  { id: 'dialog_perfect', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_perfect', expression: 'happy', next: 'end_of_day' },

  // === End of the day: BS and PL are connected, then the rules behind the entries ===
  { id: 'end_of_day', type: 'background', background: 'home', next: 'show_final_bs' },
  { id: 'show_final_bs', type: 'report', reportType: 'balance_sheet', messageKey: 'ch1.show_final_bs.msg', next: 'dialog_bs_pl_link_1' },
  { id: 'dialog_bs_pl_link_1', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_bs_pl_link_1', expression: 'normal', next: 'dialog_bs_pl_link_2' },
  { id: 'dialog_bs_pl_link_2', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_bs_pl_link_2', expression: 'happy', next: 'dialog_txn_elements' },
  { id: 'dialog_txn_elements', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_txn_elements', expression: 'thinking', next: 'dialog_txn_rule' },
  { id: 'dialog_txn_rule', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_txn_rule', expression: 'normal', next: 'quiz_txn_2' },
  {
    id: 'quiz_txn_2',
    type: 'quiz',
    questionKey: 'ch1.quiz_txn_2.question',
    options: [
      { labelKey: 'ch1.quiz_txn_2.option_0' },
      { labelKey: 'ch1.quiz_txn_2.option_1' },
      { labelKey: 'ch1.quiz_txn_2.option_2' },
    ],
    correctIndex: 2,
    correctFeedbackKey: 'ch1.quiz_txn_2.correct',
    incorrectFeedbackKey: 'ch1.quiz_txn_2.incorrect',
    expReward: 10,
    next: 'dialog_end_final',
  },
  { id: 'dialog_end_final', type: 'dialog', speaker: 'mentor', textKey: 'ch1.dialog_end_final', expression: 'happy', next: 'chapter_end' },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 2,
    summaryKey: 'ch1.chapter_end.summary',
    rating: [
      { labelKey: 'ch1.goal.profit', when: { type: 'net_income_gte', amount: 500 } },
      { labelKey: 'ch1.goal.no_unsold', when: { type: 'flag_lte', flag: 'unsold', amount: 0 } },
      { labelKey: 'ch1.goal.accuracy', when: { type: 'accuracy_gte', amount: 0.75 } },
    ],
  },
];

export const chapter1: ChapterScript = {
  id: 1,
  titleKey: 'ch1.title',
  subtitleKey: 'ch1.subtitle',
  opening: {},
  nodes,
};
