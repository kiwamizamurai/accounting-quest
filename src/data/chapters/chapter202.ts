import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Cost Accounting ===
  {
    id: 'start',
    type: 'background',
    background: 'factory',
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
    textKey: 'ch202.dialog_1',
    expression: 'thinking',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },

  // === Job Order vs Process Costing ===
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_3',
    expression: 'thinking',
    next: 'dialog_job_order',
  },
  {
    id: 'dialog_job_order',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_job_order',
    expression: 'normal',
    next: 'dialog_process_costing',
  },
  {
    id: 'dialog_process_costing',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_process_costing',
    expression: 'normal',
    next: 'dialog_overhead_alloc_intro',
  },

  // === Material and Labor Input ===
  {
    id: 'dialog_overhead_alloc_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_overhead_alloc_intro',
    expression: 'thinking',
    next: 'material_input_tx',
  },
  {
    id: 'material_input_tx',
    type: 'transaction',
    descriptionKey: 'ch202.material_input_tx.desc',
    entries: [
      { account: 'WORK_IN_PROCESS', debit: 2500 },
      { account: 'RAW_MATERIALS', credit: 2500 },
    ],
    showAnimation: true,
    next: 'labor_input_tx',
  },
  {
    id: 'labor_input_tx',
    type: 'transaction',
    descriptionKey: 'ch202.labor_input_tx.desc',
    entries: [
      { account: 'WORK_IN_PROCESS', debit: 1500 },
      { account: 'CHECKING_ACCOUNT', credit: 1500 },
    ],
    showAnimation: true,
    next: 'dialog_overhead_alloc_explain',
  },

  // === Overhead Allocation ===
  {
    id: 'dialog_overhead_alloc_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_overhead_alloc_explain',
    expression: 'normal',
    next: 'overhead_alloc_tx',
  },
  {
    id: 'overhead_alloc_tx',
    type: 'transaction',
    descriptionKey: 'ch202.overhead_alloc_tx.desc',
    entries: [
      { account: 'WORK_IN_PROCESS', debit: 1000 },
      { account: 'MANUFACTURING_OVERHEAD', credit: 1000 },
    ],
    showAnimation: true,
    next: 'dialog_after_alloc',
  },
  {
    id: 'dialog_after_alloc',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_after_alloc',
    expression: 'happy',
    next: 'journal_entry_overhead',
  },

  // === Journal Entry Input: Overhead Allocation ===
  {
    id: 'journal_entry_overhead',
    type: 'journal_entry_input',
    promptKey: 'ch202.journal_entry_overhead.prompt',
    expectedEntries: [
      { account: 'WORK_IN_PROCESS', debit: 1000 },
      { account: 'MANUFACTURING_OVERHEAD', credit: 1000 },
    ],
    correctFeedbackKey: 'ch202.journal_entry_overhead.correct',
    incorrectFeedbackKey: 'ch202.journal_entry_overhead.incorrect',
    hintKey: 'ch202.journal_entry_overhead.hint',
    expReward: 30,
    next: 'transfer_intro',
  },

  // === Transfer to Finished Goods ===
  {
    id: 'transfer_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.transfer_intro',
    expression: 'normal',
    next: 'transfer_tx',
  },
  {
    id: 'transfer_tx',
    type: 'transaction',
    descriptionKey: 'ch202.transfer_tx.desc',
    entries: [
      { account: 'FINISHED_GOODS', debit: 5000 },
      { account: 'WORK_IN_PROCESS', credit: 5000 },
    ],
    showAnimation: true,
    next: 'dialog_after_transfer',
  },
  {
    id: 'dialog_after_transfer',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_after_transfer',
    expression: 'happy',
    next: 'show_bs_after_transfer',
  },
  {
    id: 'show_bs_after_transfer',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch202.show_bs_after_transfer.msg',
    next: 'sale_intro',
  },

  // === Sell Finished Goods ===
  {
    id: 'sale_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.sale_intro',
    expression: 'normal',
    next: 'customer_enter',
  },
  {
    id: 'customer_enter',
    type: 'character_enter',
    character: 'customer',
    position: 'left',
    expression: 'happy',
    next: 'dialog_customer',
  },
  {
    id: 'dialog_customer',
    type: 'dialog',
    speaker: 'customer',
    textKey: 'ch202.dialog_customer',
    expression: 'happy',
    next: 'sale_revenue_tx',
  },
  {
    id: 'sale_revenue_tx',
    type: 'transaction',
    descriptionKey: 'ch202.sale_revenue_tx.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 8000 },
      { account: 'SALES_REVENUE', credit: 8000 },
    ],
    showAnimation: true,
    next: 'sale_cogs_tx',
  },
  {
    id: 'sale_cogs_tx',
    type: 'transaction',
    descriptionKey: 'ch202.sale_cogs_tx.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 5000 },
      { account: 'FINISHED_GOODS', credit: 5000 },
    ],
    showAnimation: true,
    next: 'dialog_after_sale',
  },
  {
    id: 'dialog_after_sale',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_after_sale',
    expression: 'happy',
    next: 'customer_exit',
  },
  {
    id: 'customer_exit',
    type: 'character_exit',
    character: 'customer',
    next: 'show_pl_after_sale',
  },
  {
    id: 'show_pl_after_sale',
    type: 'report',
    reportType: 'income_statement',
    messageKey: 'ch202.show_pl_after_sale.msg',
    next: 'dialog_profit_explain',
  },
  {
    id: 'dialog_profit_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_profit_explain',
    expression: 'thinking',
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch202.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 203,
    summaryKey: 'ch202.chapter_end.summary',
  },
];

export const chapter202: ChapterScript = {
  id: 202,
  titleKey: 'ch202.title',
  subtitleKey: 'ch202.subtitle',
  nodes,
};
