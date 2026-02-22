import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening ===
  {
    id: 'start',
    type: 'background',
    background: 'office',
    next: 'mentor_enter',
  },
  {
    id: 'mentor_enter',
    type: 'character_enter',
    character: 'mentor',
    position: 'right',
    expression: 'normal',
    next: 'dialog_1',
  },
  {
    id: 'dialog_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.dialog_1',
    expression: 'normal',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.dialog_2',
    expression: 'thinking',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.dialog_3',
    expression: 'normal',
    next: 'taxman_enter',
  },

  // === Tax Officer Arrives ===
  {
    id: 'taxman_enter',
    type: 'character_enter',
    character: 'taxman',
    position: 'left',
    expression: 'normal',
    next: 'dialog_taxman_1',
  },
  {
    id: 'dialog_taxman_1',
    type: 'dialog',
    speaker: 'taxman',
    textKey: 'ch9.dialog_taxman_1',
    expression: 'normal',
    next: 'explain_tax_expense',
  },
  { id: 'explain_tax_expense', type: 'dialog', speaker: 'mentor', textKey: 'ch9.explain_tax_expense', expression: 'thinking', next: 'choice_tax_rate' },
  {
    id: 'choice_tax_rate',
    type: 'choice',
    promptKey: 'ch9.choice_tax_rate.prompt',
    choices: [
      {
        labelKey: 'ch9.choice_tax_rate.0',
        next: 'tax_20',
        effects: { setFlags: { taxRate: 20 } },
      },
      {
        labelKey: 'ch9.choice_tax_rate.1',
        next: 'tax_30',
        effects: { setFlags: { taxRate: 30 } },
      },
    ],
  },

  // === Tax 20% ===
  {
    id: 'tax_20',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.tax_20',
    expression: 'thinking',
    next: 'tax_tx_20',
  },
  {
    id: 'tax_tx_20',
    type: 'transaction',
    descriptionKey: 'ch9.tax_tx_20.desc',
    entries: [
      { account: 'UTILITIES_EXPENSE', debit: 100 },
      { account: 'CASH', credit: 100 },
    ],
    showAnimation: true,
    next: 'after_tax',
  },

  // === Tax 30% ===
  {
    id: 'tax_30',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.tax_30',
    expression: 'thinking',
    next: 'tax_tx_30',
  },
  {
    id: 'tax_tx_30',
    type: 'transaction',
    descriptionKey: 'ch9.tax_tx_30.desc',
    entries: [
      { account: 'UTILITIES_EXPENSE', debit: 150 },
      { account: 'CASH', credit: 150 },
    ],
    showAnimation: true,
    next: 'after_tax',
  },

  // === After Tax ===
  {
    id: 'after_tax',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.after_tax',
    expression: 'normal',
    next: 'dialog_after_tax_2',
  },
  {
    id: 'dialog_after_tax_2',
    type: 'dialog',
    speaker: 'taxman',
    textKey: 'ch9.dialog_after_tax_2',
    expression: 'normal',
    next: 'taxman_exit',
  },
  {
    id: 'taxman_exit',
    type: 'character_exit',
    character: 'taxman',
    next: 'show_bs_after_tax',
  },
  {
    id: 'show_bs_after_tax',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch9.show_bs_after_tax.msg',
    next: 'show_pl_after_tax',
  },
  { id: 'show_pl_after_tax', type: 'report', reportType: 'income_statement', messageKey: 'ch9.show_pl_after_tax.msg', next: 'dialog_pl_tax_explain' },
  { id: 'dialog_pl_tax_explain', type: 'dialog', speaker: 'mentor', textKey: 'ch9.dialog_pl_tax_explain', expression: 'thinking', next: 'liquidation_intro' },

  // === Liquidation Concept ===
  {
    id: 'liquidation_intro',
    type: 'background',
    background: 'home',
    next: 'dialog_liq_1',
  },
  {
    id: 'dialog_liq_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.dialog_liq_1',
    expression: 'thinking',
    next: 'dialog_liq_2',
  },
  {
    id: 'dialog_liq_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.dialog_liq_2',
    expression: 'normal',
    next: 'dialog_liq_3',
  },
  {
    id: 'dialog_liq_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.dialog_liq_3',
    expression: 'surprised',
    next: 'dialog_liq_4',
  },
  {
    id: 'dialog_liq_4',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.dialog_liq_4',
    expression: 'thinking',
    next: 'dialog_liq_5',
  },
  {
    id: 'dialog_liq_5',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.dialog_liq_5',
    expression: 'normal',
    next: 'show_final_bs',
  },
  {
    id: 'show_final_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch9.show_final_bs.msg',
    next: 'show_final_pl',
  },
  { id: 'show_final_pl', type: 'report', reportType: 'income_statement', messageKey: 'ch9.show_final_pl.msg', next: 'dialog_pl_to_equity' },
  { id: 'dialog_pl_to_equity', type: 'dialog', speaker: 'mentor', textKey: 'ch9.dialog_pl_to_equity', expression: 'thinking', next: 'dialog_final' },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch9.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 10,
    summaryKey: 'ch9.chapter_end.summary',
  },
];

export const chapter9: ChapterScript = {
  id: 9,
  titleKey: 'ch9.title',
  subtitleKey: 'ch9.subtitle',
  nodes,
};
