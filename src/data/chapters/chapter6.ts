import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening ===
  {
    id: 'start',
    type: 'background',
    background: 'supply_shop',
    next: 'mentor_enter',
  },
  {
    id: 'mentor_enter',
    type: 'character_enter',
    character: 'mentor',
    position: 'right',
    expression: 'thinking',
    next: 'dialog_1',
  },
  {
    id: 'dialog_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.dialog_1',
    expression: 'thinking',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.dialog_2',
    expression: 'normal',
    next: 'supplier_enter',
  },

  // === Buy at Old Price ===
  {
    id: 'supplier_enter',
    type: 'character_enter',
    character: 'supplier',
    position: 'left',
    expression: 'normal',
    next: 'dialog_supplier_1',
  },
  {
    id: 'dialog_supplier_1',
    type: 'dialog',
    speaker: 'supplier',
    textKey: 'ch6.dialog_supplier_1',
    expression: 'normal',
    next: 'buy_old_tx',
  },
  {
    id: 'buy_old_tx',
    type: 'transaction',
    descriptionKey: 'ch6.buy_old_tx.desc',
    entries: [
      { account: 'INVENTORY', debit: 250 },
      { account: 'CASH', credit: 250 },
    ],
    showAnimation: true,
    next: 'price_increase_narration',
  },

  // === Price Increase ===
  {
    id: 'price_increase_narration',
    type: 'narration',
    textKey: 'ch6.price_increase_narration',
    next: 'dialog_price_increase',
  },
  {
    id: 'dialog_price_increase',
    type: 'dialog',
    speaker: 'supplier',
    textKey: 'ch6.dialog_price_increase',
    expression: 'sad',
    next: 'buy_new_tx',
  },
  {
    id: 'buy_new_tx',
    type: 'transaction',
    descriptionKey: 'ch6.buy_new_tx.desc',
    entries: [
      { account: 'INVENTORY', debit: 400 },
      { account: 'CASH', credit: 400 },
    ],
    showAnimation: true,
    next: 'explain_inventory_deep',
  },
  { id: 'explain_inventory_deep', type: 'dialog', speaker: 'mentor', textKey: 'ch6.explain_inventory_deep', expression: 'thinking', next: 'show_bs_mid' },
  { id: 'show_bs_mid', type: 'report', reportType: 'balance_sheet', messageKey: 'ch6.show_bs_mid.msg', next: 'supplier_exit' },
  {
    id: 'supplier_exit',
    type: 'character_exit',
    character: 'supplier',
    next: 'dialog_inventory_status',
  },
  {
    id: 'dialog_inventory_status',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.dialog_inventory_status',
    expression: 'thinking',
    next: 'transition_to_stand',
  },

  // === Selling - FIFO vs LIFO ===
  {
    id: 'transition_to_stand',
    type: 'background',
    background: 'lemonade_stand',
    next: 'dialog_sell_intro',
  },
  {
    id: 'dialog_sell_intro',
    type: 'narration',
    textKey: 'ch6.dialog_sell_intro',
    next: 'sale_revenue_tx',
  },
  {
    id: 'sale_revenue_tx',
    type: 'transaction',
    descriptionKey: 'ch6.sale_revenue_tx.desc',
    entries: [
      { account: 'CASH', debit: 450 },
      { account: 'SALES_REVENUE', credit: 450 },
    ],
    showAnimation: true,
    next: 'dialog_fifo_lifo',
  },
  {
    id: 'dialog_fifo_lifo',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.dialog_fifo_lifo',
    expression: 'surprised',
    next: 'choice_method',
  },
  {
    id: 'choice_method',
    type: 'choice',
    promptKey: 'ch6.choice_method.prompt',
    choices: [
      {
        labelKey: 'ch6.choice_method.0',
        next: 'fifo_explain',
        effects: { setFlags: { inventoryMethod: 'FIFO' } },
      },
      {
        labelKey: 'ch6.choice_method.1',
        next: 'lifo_explain',
        effects: { setFlags: { inventoryMethod: 'LIFO' } },
      },
    ],
  },

  // === FIFO Path ===
  {
    id: 'fifo_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.fifo_explain',
    expression: 'happy',
    next: 'fifo_cogs_tx',
  },
  {
    id: 'fifo_cogs_tx',
    type: 'transaction',
    descriptionKey: 'ch6.fifo_cogs_tx.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 150 },
      { account: 'INVENTORY', credit: 150 },
    ],
    showAnimation: true,
    next: 'fifo_result',
  },
  {
    id: 'fifo_result',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.fifo_result',
    expression: 'normal',
    next: 'compare_intro',
  },

  // === LIFO Path ===
  {
    id: 'lifo_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.lifo_explain',
    expression: 'happy',
    next: 'lifo_cogs_tx',
  },
  {
    id: 'lifo_cogs_tx',
    type: 'transaction',
    descriptionKey: 'ch6.lifo_cogs_tx.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 240 },
      { account: 'INVENTORY', credit: 240 },
    ],
    showAnimation: true,
    next: 'lifo_result',
  },
  {
    id: 'lifo_result',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.lifo_result',
    expression: 'normal',
    next: 'compare_intro',
  },

  // === Comparison ===
  {
    id: 'compare_intro',
    type: 'background',
    background: 'home',
    next: 'dialog_compare_1',
  },
  {
    id: 'dialog_compare_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.dialog_compare_1',
    expression: 'surprised',
    next: 'dialog_compare_2',
  },
  {
    id: 'dialog_compare_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.dialog_compare_2',
    expression: 'thinking',
    next: 'dialog_compare_3',
  },
  {
    id: 'dialog_compare_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.dialog_compare_3',
    expression: 'normal',
    next: 'show_pl_compare',
  },
  { id: 'show_pl_compare', type: 'report', reportType: 'income_statement', messageKey: 'ch6.show_pl_compare.msg', next: 'show_final_bs' },
  {
    id: 'show_final_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch6.show_final_bs.msg',
    next: 'show_final_pl',
  },
  { id: 'show_final_pl', type: 'report', reportType: 'income_statement', messageKey: 'ch6.show_final_pl.msg', next: 'dialog_final' },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch6.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 7,
    summaryKey: 'ch6.chapter_end.summary',
  },
];

export const chapter6: ChapterScript = {
  id: 6,
  titleKey: 'ch6.title',
  subtitleKey: 'ch6.subtitle',
  nodes,
};
