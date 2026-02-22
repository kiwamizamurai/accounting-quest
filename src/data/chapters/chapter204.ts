import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Break-Even Analysis ===
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
    expression: 'thinking',
    next: 'dialog_1',
  },
  {
    id: 'dialog_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_1',
    expression: 'thinking',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_3',
    expression: 'normal',
    next: 'dialog_variable_cost',
  },

  // === Variable vs Fixed Costs ===
  {
    id: 'dialog_variable_cost',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_variable_cost',
    expression: 'thinking',
    next: 'dialog_fixed_cost',
  },
  {
    id: 'dialog_fixed_cost',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_fixed_cost',
    expression: 'thinking',
    next: 'dialog_example_intro',
  },

  // === Example with Transactions ===
  {
    id: 'dialog_example_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_example_intro',
    expression: 'normal',
    next: 'fixed_cost_rent_tx',
  },
  {
    id: 'fixed_cost_rent_tx',
    type: 'transaction',
    descriptionKey: 'ch204.fixed_cost_rent_tx.desc',
    entries: [
      { account: 'RENT_EXPENSE', debit: 2000 },
      { account: 'CHECKING_ACCOUNT', credit: 2000 },
    ],
    showAnimation: true,
    next: 'fixed_cost_depreciation_tx',
  },
  {
    id: 'fixed_cost_depreciation_tx',
    type: 'transaction',
    descriptionKey: 'ch204.fixed_cost_depreciation_tx.desc',
    entries: [
      { account: 'DEPRECIATION_EXPENSE', debit: 500 },
      { account: 'ACCUMULATED_DEPRECIATION', credit: 500 },
    ],
    showAnimation: true,
    next: 'dialog_after_fixed',
  },
  {
    id: 'dialog_after_fixed',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_after_fixed',
    expression: 'normal',
    next: 'variable_cost_materials_tx',
  },
  {
    id: 'variable_cost_materials_tx',
    type: 'transaction',
    descriptionKey: 'ch204.variable_cost_materials_tx.desc',
    entries: [
      { account: 'RAW_MATERIALS', debit: 3000 },
      { account: 'CHECKING_ACCOUNT', credit: 3000 },
    ],
    showAnimation: true,
    next: 'variable_cost_labor_tx',
  },
  {
    id: 'variable_cost_labor_tx',
    type: 'transaction',
    descriptionKey: 'ch204.variable_cost_labor_tx.desc',
    entries: [
      { account: 'WORK_IN_PROCESS', debit: 1500 },
      { account: 'CHECKING_ACCOUNT', credit: 1500 },
    ],
    showAnimation: true,
    next: 'dialog_after_variable',
  },
  {
    id: 'dialog_after_variable',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_after_variable',
    expression: 'normal',
    next: 'show_pl_costs',
  },
  {
    id: 'show_pl_costs',
    type: 'report',
    reportType: 'income_statement',
    messageKey: 'ch204.show_pl_costs.msg',
    next: 'contribution_margin_intro',
  },

  // === Contribution Margin ===
  {
    id: 'contribution_margin_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.contribution_margin_intro',
    expression: 'thinking',
    next: 'dialog_contribution_calc',
  },
  {
    id: 'dialog_contribution_calc',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_contribution_calc',
    expression: 'normal',
    next: 'dialog_contribution_ratio',
  },
  {
    id: 'dialog_contribution_ratio',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_contribution_ratio',
    expression: 'thinking',
    next: 'breakeven_intro',
  },

  // === Break-Even Point ===
  {
    id: 'breakeven_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.breakeven_intro',
    expression: 'thinking',
    next: 'dialog_breakeven_formula',
  },
  {
    id: 'dialog_breakeven_formula',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_breakeven_formula',
    expression: 'normal',
    next: 'dialog_breakeven_example',
  },
  {
    id: 'dialog_breakeven_example',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_breakeven_example',
    expression: 'thinking',
    next: 'dialog_breakeven_meaning',
  },
  {
    id: 'dialog_breakeven_meaning',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_breakeven_meaning',
    expression: 'happy',
    next: 'choice_scenario',
  },

  // === Scenario Choice ===
  {
    id: 'choice_scenario',
    type: 'choice',
    promptKey: 'ch204.choice_scenario.prompt',
    choices: [
      {
        labelKey: 'ch204.choice_scenario.0',
        next: 'scenario_more_sales',
        effects: { setFlags: { scenario: 'more_sales' } },
      },
      {
        labelKey: 'ch204.choice_scenario.1',
        next: 'scenario_cut_costs',
        effects: { setFlags: { scenario: 'cut_costs' } },
      },
    ],
  },
  {
    id: 'scenario_more_sales',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.scenario_more_sales',
    expression: 'happy',
    next: 'quiz_intro',
  },
  {
    id: 'scenario_cut_costs',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.scenario_cut_costs',
    expression: 'happy',
    next: 'quiz_intro',
  },

  // === Quiz: Break-Even Formula ===
  {
    id: 'quiz_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.quiz_intro',
    expression: 'happy',
    next: 'quiz_breakeven',
  },
  {
    id: 'quiz_breakeven',
    type: 'quiz',
    questionKey: 'ch204.quiz_breakeven.question',
    options: [
      { labelKey: 'ch204.quiz_breakeven.0' },
      { labelKey: 'ch204.quiz_breakeven.1' },
      { labelKey: 'ch204.quiz_breakeven.2' },
    ],
    correctIndex: 2,
    correctFeedbackKey: 'ch204.quiz_breakeven.correct',
    incorrectFeedbackKey: 'ch204.quiz_breakeven.incorrect',
    expReward: 30,
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_summary',
    expression: 'normal',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch204.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 205,
    summaryKey: 'ch204.chapter_end.summary',
  },
];

export const chapter204: ChapterScript = {
  id: 204,
  titleKey: 'ch204.title',
  subtitleKey: 'ch204.subtitle',
  nodes,
};
