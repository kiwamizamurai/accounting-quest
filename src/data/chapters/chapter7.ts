import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening ===
  {
    id: 'start',
    type: 'background',
    background: 'lemonade_stand',
    next: 'mentor_enter',
  },
  {
    id: 'mentor_enter',
    type: 'character_enter',
    character: 'mentor',
    position: 'right',
    expression: 'happy',
    next: 'dialog_1',
  },
  {
    id: 'dialog_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_1',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_2',
    expression: 'thinking',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_3',
    expression: 'normal',
    next: 'transition_to_shop',
  },

  // === Buy Equipment ===
  {
    id: 'transition_to_shop',
    type: 'background',
    background: 'supply_shop',
    next: 'supplier_enter',
  },
  {
    id: 'supplier_enter',
    type: 'character_enter',
    character: 'supplier',
    position: 'left',
    expression: 'happy',
    next: 'dialog_supplier',
  },
  {
    id: 'dialog_supplier',
    type: 'dialog',
    speaker: 'supplier',
    textKey: 'ch7.dialog_supplier',
    expression: 'happy',
    next: 'choice_equipment',
  },
  {
    id: 'choice_equipment',
    type: 'choice',
    promptKey: 'ch7.choice_equipment.prompt',
    choices: [
      {
        labelKey: 'ch7.choice_equipment.0',
        next: 'buy_mixer',
        effects: { setFlags: { equipmentCost: 300, equipmentName: 'mixer' } },
      },
      {
        labelKey: 'ch7.choice_equipment.1',
        next: 'buy_stand',
        effects: { setFlags: { equipmentCost: 500, equipmentName: 'deluxe_stand' } },
      },
    ],
  },
  {
    id: 'buy_mixer',
    type: 'transaction',
    descriptionKey: 'ch7.buy_mixer.desc',
    entries: [
      { account: 'EQUIPMENT', debit: 300 },
      { account: 'CASH', credit: 300 },
    ],
    showAnimation: true,
    next: 'after_purchase',
  },
  {
    id: 'buy_stand',
    type: 'transaction',
    descriptionKey: 'ch7.buy_stand.desc',
    entries: [
      { account: 'EQUIPMENT', debit: 500 },
      { account: 'CASH', credit: 500 },
    ],
    showAnimation: true,
    next: 'after_purchase',
  },

  // === After Purchase ===
  {
    id: 'after_purchase',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.after_purchase',
    expression: 'normal',
    next: 'explain_equipment_account',
  },
  { id: 'explain_equipment_account', type: 'dialog', speaker: 'mentor', textKey: 'ch7.explain_equipment_account', expression: 'thinking', next: 'show_bs_after_purchase' },
  {
    id: 'show_bs_after_purchase',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch7.show_bs_after_purchase.msg',
    next: 'supplier_exit',
  },
  {
    id: 'supplier_exit',
    type: 'character_exit',
    character: 'supplier',
    next: 'depreciation_intro',
  },

  // === Depreciation ===
  {
    id: 'depreciation_intro',
    type: 'background',
    background: 'home',
    next: 'dialog_dep_1',
  },
  {
    id: 'dialog_dep_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_dep_1',
    expression: 'thinking',
    next: 'dialog_dep_2',
  },
  {
    id: 'dialog_dep_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_dep_2',
    expression: 'normal',
    next: 'dialog_dep_3',
  },
  {
    id: 'dialog_dep_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_dep_3',
    expression: 'thinking',
    next: 'dep_period_1_narration',
  },

  // === First Depreciation Period ===
  {
    id: 'dep_period_1_narration',
    type: 'narration',
    textKey: 'ch7.dep_period_1_narration',
    next: 'dep_period_1_tx',
  },
  {
    id: 'dep_period_1_tx',
    type: 'transaction',
    descriptionKey: 'ch7.dep_period_1_tx.desc',
    entries: [
      { account: 'DEPRECIATION_EXPENSE', debit: 60 },
      { account: 'ACCUMULATED_DEPRECIATION', credit: 60 },
    ],
    showAnimation: true,
    next: 'dialog_after_dep_1',
  },
  {
    id: 'dialog_after_dep_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_after_dep_1',
    expression: 'normal',
    next: 'explain_depreciation_accounts',
  },
  { id: 'explain_depreciation_accounts', type: 'dialog', speaker: 'mentor', textKey: 'ch7.explain_depreciation_accounts', expression: 'thinking', next: 'show_bs_after_dep_1' },
  {
    id: 'show_bs_after_dep_1',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch7.show_bs_after_dep_1.msg',
    next: 'show_pl_after_dep_1',
  },
  { id: 'show_pl_after_dep_1', type: 'report', reportType: 'income_statement', messageKey: 'ch7.show_pl_after_dep_1.msg', next: 'dep_period_2_narration' },

  // === Second Depreciation Period ===
  {
    id: 'dep_period_2_narration',
    type: 'narration',
    textKey: 'ch7.dep_period_2_narration',
    next: 'dep_period_2_tx',
  },
  {
    id: 'dep_period_2_tx',
    type: 'transaction',
    descriptionKey: 'ch7.dep_period_2_tx.desc',
    entries: [
      { account: 'DEPRECIATION_EXPENSE', debit: 60 },
      { account: 'ACCUMULATED_DEPRECIATION', credit: 60 },
    ],
    showAnimation: true,
    next: 'dialog_after_dep_2',
  },
  {
    id: 'dialog_after_dep_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_after_dep_2',
    expression: 'thinking',
    next: 'dialog_capital_vs_expense',
  },

  // === Capital vs Revenue Expenditure ===
  {
    id: 'dialog_capital_vs_expense',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_capital_vs_expense',
    expression: 'normal',
    next: 'dialog_capital_1',
  },
  {
    id: 'dialog_capital_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_capital_1',
    expression: 'thinking',
    next: 'dialog_capital_2',
  },
  {
    id: 'dialog_capital_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_capital_2',
    expression: 'thinking',
    next: 'dialog_capital_3',
  },
  {
    id: 'dialog_capital_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_capital_3',
    expression: 'normal',
    next: 'show_final_bs',
  },
  {
    id: 'show_final_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch7.show_final_bs.msg',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch7.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 8,
    summaryKey: 'ch7.chapter_end.summary',
  },
];

export const chapter7: ChapterScript = {
  id: 7,
  titleKey: 'ch7.title',
  subtitleKey: 'ch7.subtitle',
  nodes,
};
