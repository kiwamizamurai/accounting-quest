// Account types following double-entry bookkeeping principles
export enum AccountType {
  // Balance Sheet - Assets (Debit increases)
  ASSET = 'ASSET',
  // Balance Sheet - Liabilities (Credit increases)
  LIABILITY = 'LIABILITY',
  // Balance Sheet - Equity (Credit increases)
  EQUITY = 'EQUITY',
  // Income Statement - Revenue (Credit increases)
  REVENUE = 'REVENUE',
  // Income Statement - Expense (Debit increases)
  EXPENSE = 'EXPENSE',
}

// Specific account categories
export enum AccountCategory {
  // ===== ASSETS =====
  // Lv1 (existing)
  CASH = 'CASH',
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  INVENTORY = 'INVENTORY',
  PREPAID_EXPENSES = 'PREPAID_EXPENSES',
  EQUIPMENT = 'EQUIPMENT',
  ACCUMULATED_DEPRECIATION = 'ACCUMULATED_DEPRECIATION',

  // Lv2 - Current Assets
  PETTY_CASH = 'PETTY_CASH',
  CHECKING_ACCOUNT = 'CHECKING_ACCOUNT',
  SAVINGS_ACCOUNT = 'SAVINGS_ACCOUNT',
  TIME_DEPOSIT = 'TIME_DEPOSIT',
  ELECTRONICALLY_RECORDED_RECEIVABLE = 'ELECTRONICALLY_RECORDED_RECEIVABLE',
  CREDIT_CARD_RECEIVABLE = 'CREDIT_CARD_RECEIVABLE',
  LOANS_RECEIVABLE = 'LOANS_RECEIVABLE',
  ADVANCES_PAID = 'ADVANCES_PAID',
  PREPAID_PAYMENTS = 'PREPAID_PAYMENTS',
  ACCRUED_REVENUE = 'ACCRUED_REVENUE',
  TEMPORARY_PAYMENTS = 'TEMPORARY_PAYMENTS',
  GIFT_CERTIFICATES_RECEIVED = 'GIFT_CERTIFICATES_RECEIVED',
  SECURITY_DEPOSITS = 'SECURITY_DEPOSITS',
  SUPPLIES_INVENTORY = 'SUPPLIES_INVENTORY',
  CONSUMPTION_TAX_RECEIVABLE = 'CONSUMPTION_TAX_RECEIVABLE',
  ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS = 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS',

  // Lv2 - Fixed Assets
  BUILDINGS = 'BUILDINGS',
  VEHICLES = 'VEHICLES',

  // Lv3 - Assets
  LAND = 'LAND',
  CONTRACT_ASSETS = 'CONTRACT_ASSETS',
  GOODWILL = 'GOODWILL',
  PATENTS = 'PATENTS',
  SOFTWARE = 'SOFTWARE',
  SECURITIES = 'SECURITIES',
  TRADING_SECURITIES = 'TRADING_SECURITIES',
  HELD_TO_MATURITY_SECURITIES = 'HELD_TO_MATURITY_SECURITIES',
  SUBSIDIARY_SECURITIES = 'SUBSIDIARY_SECURITIES',
  WORK_IN_PROCESS = 'WORK_IN_PROCESS',
  RAW_MATERIALS = 'RAW_MATERIALS',
  FINISHED_GOODS = 'FINISHED_GOODS',

  // ===== LIABILITIES =====
  // Lv1 (existing)
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  NOTES_PAYABLE = 'NOTES_PAYABLE',
  ACCRUED_EXPENSES = 'ACCRUED_EXPENSES',
  UNEARNED_REVENUE = 'UNEARNED_REVENUE',
  LOANS_PAYABLE = 'LOANS_PAYABLE',

  // Lv2 - Liabilities
  ELECTRONICALLY_RECORDED_PAYABLE = 'ELECTRONICALLY_RECORDED_PAYABLE',
  ADVANCE_RECEIVED = 'ADVANCE_RECEIVED',
  OVERDRAFT = 'OVERDRAFT',
  ACCOUNTS_PAYABLE_OTHER = 'ACCOUNTS_PAYABLE_OTHER',
  TEMPORARY_RECEIPTS = 'TEMPORARY_RECEIPTS',
  DEPOSITS_RECEIVED = 'DEPOSITS_RECEIVED',
  INCOME_TAX_WITHHOLDING = 'INCOME_TAX_WITHHOLDING',
  SOCIAL_INSURANCE_WITHHOLDING = 'SOCIAL_INSURANCE_WITHHOLDING',
  CONSUMPTION_TAX_PAYABLE = 'CONSUMPTION_TAX_PAYABLE',
  ACCRUED_CONSUMPTION_TAX = 'ACCRUED_CONSUMPTION_TAX',
  ACCRUED_CORPORATE_TAX = 'ACCRUED_CORPORATE_TAX',

  // Lv3 - Liabilities
  DIVIDENDS_PAYABLE = 'DIVIDENDS_PAYABLE',
  BONDS_PAYABLE = 'BONDS_PAYABLE',
  BONUS_PROVISION = 'BONUS_PROVISION',
  RETIREMENT_PROVISION = 'RETIREMENT_PROVISION',

  // ===== EQUITY =====
  // Lv1 (existing)
  OWNERS_CAPITAL = 'OWNERS_CAPITAL',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',

  // Lv3 - Equity
  LEGAL_RESERVE = 'LEGAL_RESERVE',
  CAPITAL_SURPLUS = 'CAPITAL_SURPLUS',
  VALUATION_DIFFERENCE_ON_SECURITIES = 'VALUATION_DIFFERENCE_ON_SECURITIES',
  NON_CONTROLLING_INTERESTS = 'NON_CONTROLLING_INTERESTS',

  // ===== REVENUE =====
  // Lv1 (existing)
  SALES_REVENUE = 'SALES_REVENUE',
  SERVICE_REVENUE = 'SERVICE_REVENUE',

  // Lv2 - Revenue
  RENT_INCOME = 'RENT_INCOME',
  LAND_RENT_INCOME = 'LAND_RENT_INCOME',
  COMMISSION_INCOME = 'COMMISSION_INCOME',
  INTEREST_INCOME = 'INTEREST_INCOME',
  MISCELLANEOUS_INCOME = 'MISCELLANEOUS_INCOME',
  GAIN_ON_SALE_OF_FIXED_ASSETS = 'GAIN_ON_SALE_OF_FIXED_ASSETS',

  // Lv3 - Revenue
  GAIN_ON_SALE_OF_SECURITIES = 'GAIN_ON_SALE_OF_SECURITIES',
  VALUATION_GAIN_ON_SECURITIES = 'VALUATION_GAIN_ON_SECURITIES',

  // ===== EXPENSES =====
  // Lv1 (existing)
  COST_OF_GOODS_SOLD = 'COST_OF_GOODS_SOLD',
  WAGES_EXPENSE = 'WAGES_EXPENSE',
  RENT_EXPENSE = 'RENT_EXPENSE',
  UTILITIES_EXPENSE = 'UTILITIES_EXPENSE',
  SUPPLIES_EXPENSE = 'SUPPLIES_EXPENSE',
  DEPRECIATION_EXPENSE = 'DEPRECIATION_EXPENSE',
  INTEREST_EXPENSE = 'INTEREST_EXPENSE',
  BAD_DEBT_EXPENSE = 'BAD_DEBT_EXPENSE',

  // Lv2 - Expenses
  SHIPPING_EXPENSE = 'SHIPPING_EXPENSE',
  STATUTORY_WELFARE_EXPENSE = 'STATUTORY_WELFARE_EXPENSE',
  ADVERTISING_EXPENSE = 'ADVERTISING_EXPENSE',
  COMMISSION_EXPENSE = 'COMMISSION_EXPENSE',
  TRAVEL_EXPENSE = 'TRAVEL_EXPENSE',
  COMMUNICATION_EXPENSE = 'COMMUNICATION_EXPENSE',
  CONSUMABLES_EXPENSE = 'CONSUMABLES_EXPENSE',
  INSURANCE_EXPENSE = 'INSURANCE_EXPENSE',
  TAXES_AND_DUES = 'TAXES_AND_DUES',
  REPAIR_EXPENSE = 'REPAIR_EXPENSE',
  MISCELLANEOUS_EXPENSE = 'MISCELLANEOUS_EXPENSE',
  ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS_EXPENSE = 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS_EXPENSE',
  LOSS_ON_SALE_OF_FIXED_ASSETS = 'LOSS_ON_SALE_OF_FIXED_ASSETS',
  TAX_EXPENSE = 'TAX_EXPENSE',

  // Lv3 - Expenses
  LOSS_ON_SALE_OF_SECURITIES = 'LOSS_ON_SALE_OF_SECURITIES',
  GOODWILL_AMORTIZATION = 'GOODWILL_AMORTIZATION',
  RESEARCH_AND_DEVELOPMENT = 'RESEARCH_AND_DEVELOPMENT',
  MANUFACTURING_OVERHEAD = 'MANUFACTURING_OVERHEAD',
  DIRECT_MATERIALS = 'DIRECT_MATERIALS',
  DIRECT_LABOR = 'DIRECT_LABOR',
  MATERIAL_PRICE_VARIANCE = 'MATERIAL_PRICE_VARIANCE',
  LABOR_EFFICIENCY_VARIANCE = 'LABOR_EFFICIENCY_VARIANCE',
}

export interface Account {
  id: string;
  name: string;
  nameJa: string;
  type: AccountType;
  category: AccountCategory;
  balance: number;
  normalBalance: 'DEBIT' | 'CREDIT';
  level: 1 | 2 | 3;
}

export function getAccountType(category: AccountCategory): AccountType {
  const typeMap: Record<AccountCategory, AccountType> = {
    // Assets
    [AccountCategory.CASH]: AccountType.ASSET,
    [AccountCategory.ACCOUNTS_RECEIVABLE]: AccountType.ASSET,
    [AccountCategory.INVENTORY]: AccountType.ASSET,
    [AccountCategory.PREPAID_EXPENSES]: AccountType.ASSET,
    [AccountCategory.EQUIPMENT]: AccountType.ASSET,
    [AccountCategory.ACCUMULATED_DEPRECIATION]: AccountType.ASSET,
    [AccountCategory.PETTY_CASH]: AccountType.ASSET,
    [AccountCategory.CHECKING_ACCOUNT]: AccountType.ASSET,
    [AccountCategory.SAVINGS_ACCOUNT]: AccountType.ASSET,
    [AccountCategory.TIME_DEPOSIT]: AccountType.ASSET,
    [AccountCategory.ELECTRONICALLY_RECORDED_RECEIVABLE]: AccountType.ASSET,
    [AccountCategory.CREDIT_CARD_RECEIVABLE]: AccountType.ASSET,
    [AccountCategory.LOANS_RECEIVABLE]: AccountType.ASSET,
    [AccountCategory.ADVANCES_PAID]: AccountType.ASSET,
    [AccountCategory.PREPAID_PAYMENTS]: AccountType.ASSET,
    [AccountCategory.ACCRUED_REVENUE]: AccountType.ASSET,
    [AccountCategory.TEMPORARY_PAYMENTS]: AccountType.ASSET,
    [AccountCategory.GIFT_CERTIFICATES_RECEIVED]: AccountType.ASSET,
    [AccountCategory.SECURITY_DEPOSITS]: AccountType.ASSET,
    [AccountCategory.SUPPLIES_INVENTORY]: AccountType.ASSET,
    [AccountCategory.CONSUMPTION_TAX_RECEIVABLE]: AccountType.ASSET,
    [AccountCategory.ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS]: AccountType.ASSET,
    [AccountCategory.BUILDINGS]: AccountType.ASSET,
    [AccountCategory.VEHICLES]: AccountType.ASSET,
    [AccountCategory.LAND]: AccountType.ASSET,
    [AccountCategory.CONTRACT_ASSETS]: AccountType.ASSET,
    [AccountCategory.GOODWILL]: AccountType.ASSET,
    [AccountCategory.PATENTS]: AccountType.ASSET,
    [AccountCategory.SOFTWARE]: AccountType.ASSET,
    [AccountCategory.SECURITIES]: AccountType.ASSET,
    [AccountCategory.TRADING_SECURITIES]: AccountType.ASSET,
    [AccountCategory.HELD_TO_MATURITY_SECURITIES]: AccountType.ASSET,
    [AccountCategory.SUBSIDIARY_SECURITIES]: AccountType.ASSET,
    [AccountCategory.WORK_IN_PROCESS]: AccountType.ASSET,
    [AccountCategory.RAW_MATERIALS]: AccountType.ASSET,
    [AccountCategory.FINISHED_GOODS]: AccountType.ASSET,

    // Liabilities
    [AccountCategory.ACCOUNTS_PAYABLE]: AccountType.LIABILITY,
    [AccountCategory.NOTES_PAYABLE]: AccountType.LIABILITY,
    [AccountCategory.ACCRUED_EXPENSES]: AccountType.LIABILITY,
    [AccountCategory.UNEARNED_REVENUE]: AccountType.LIABILITY,
    [AccountCategory.LOANS_PAYABLE]: AccountType.LIABILITY,
    [AccountCategory.ELECTRONICALLY_RECORDED_PAYABLE]: AccountType.LIABILITY,
    [AccountCategory.ADVANCE_RECEIVED]: AccountType.LIABILITY,
    [AccountCategory.OVERDRAFT]: AccountType.LIABILITY,
    [AccountCategory.ACCOUNTS_PAYABLE_OTHER]: AccountType.LIABILITY,
    [AccountCategory.TEMPORARY_RECEIPTS]: AccountType.LIABILITY,
    [AccountCategory.DEPOSITS_RECEIVED]: AccountType.LIABILITY,
    [AccountCategory.INCOME_TAX_WITHHOLDING]: AccountType.LIABILITY,
    [AccountCategory.SOCIAL_INSURANCE_WITHHOLDING]: AccountType.LIABILITY,
    [AccountCategory.CONSUMPTION_TAX_PAYABLE]: AccountType.LIABILITY,
    [AccountCategory.ACCRUED_CONSUMPTION_TAX]: AccountType.LIABILITY,
    [AccountCategory.ACCRUED_CORPORATE_TAX]: AccountType.LIABILITY,
    [AccountCategory.DIVIDENDS_PAYABLE]: AccountType.LIABILITY,
    [AccountCategory.BONDS_PAYABLE]: AccountType.LIABILITY,
    [AccountCategory.BONUS_PROVISION]: AccountType.LIABILITY,
    [AccountCategory.RETIREMENT_PROVISION]: AccountType.LIABILITY,

    // Equity
    [AccountCategory.OWNERS_CAPITAL]: AccountType.EQUITY,
    [AccountCategory.RETAINED_EARNINGS]: AccountType.EQUITY,
    [AccountCategory.LEGAL_RESERVE]: AccountType.EQUITY,
    [AccountCategory.CAPITAL_SURPLUS]: AccountType.EQUITY,
    [AccountCategory.VALUATION_DIFFERENCE_ON_SECURITIES]: AccountType.EQUITY,
    [AccountCategory.NON_CONTROLLING_INTERESTS]: AccountType.EQUITY,

    // Revenue
    [AccountCategory.SALES_REVENUE]: AccountType.REVENUE,
    [AccountCategory.SERVICE_REVENUE]: AccountType.REVENUE,
    [AccountCategory.RENT_INCOME]: AccountType.REVENUE,
    [AccountCategory.LAND_RENT_INCOME]: AccountType.REVENUE,
    [AccountCategory.COMMISSION_INCOME]: AccountType.REVENUE,
    [AccountCategory.INTEREST_INCOME]: AccountType.REVENUE,
    [AccountCategory.MISCELLANEOUS_INCOME]: AccountType.REVENUE,
    [AccountCategory.GAIN_ON_SALE_OF_FIXED_ASSETS]: AccountType.REVENUE,
    [AccountCategory.GAIN_ON_SALE_OF_SECURITIES]: AccountType.REVENUE,
    [AccountCategory.VALUATION_GAIN_ON_SECURITIES]: AccountType.REVENUE,

    // Expenses
    [AccountCategory.COST_OF_GOODS_SOLD]: AccountType.EXPENSE,
    [AccountCategory.WAGES_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.RENT_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.UTILITIES_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.SUPPLIES_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.DEPRECIATION_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.INTEREST_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.BAD_DEBT_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.SHIPPING_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.STATUTORY_WELFARE_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.ADVERTISING_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.COMMISSION_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.TRAVEL_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.COMMUNICATION_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.CONSUMABLES_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.INSURANCE_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.TAXES_AND_DUES]: AccountType.EXPENSE,
    [AccountCategory.REPAIR_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.MISCELLANEOUS_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.LOSS_ON_SALE_OF_FIXED_ASSETS]: AccountType.EXPENSE,
    [AccountCategory.TAX_EXPENSE]: AccountType.EXPENSE,
    [AccountCategory.LOSS_ON_SALE_OF_SECURITIES]: AccountType.EXPENSE,
    [AccountCategory.GOODWILL_AMORTIZATION]: AccountType.EXPENSE,
    [AccountCategory.RESEARCH_AND_DEVELOPMENT]: AccountType.EXPENSE,
    [AccountCategory.MANUFACTURING_OVERHEAD]: AccountType.EXPENSE,
    [AccountCategory.DIRECT_MATERIALS]: AccountType.EXPENSE,
    [AccountCategory.DIRECT_LABOR]: AccountType.EXPENSE,
    [AccountCategory.MATERIAL_PRICE_VARIANCE]: AccountType.EXPENSE,
    [AccountCategory.LABOR_EFFICIENCY_VARIANCE]: AccountType.EXPENSE,
  };

  return typeMap[category];
}

// Account definitions with name, Japanese name, and level
export interface AccountDef {
  category: AccountCategory;
  name: string;
  nameJa: string;
  level: 1 | 2 | 3;
  isContra?: boolean;
}

export const ALL_ACCOUNT_DEFS: AccountDef[] = [
  // ===== ASSETS =====
  // Lv1
  { category: AccountCategory.CASH, name: 'Cash', nameJa: '現金', level: 1 },
  { category: AccountCategory.ACCOUNTS_RECEIVABLE, name: 'Accounts Receivable', nameJa: '売掛金', level: 1 },
  { category: AccountCategory.INVENTORY, name: 'Inventory', nameJa: '棚卸資産', level: 1 },
  { category: AccountCategory.PREPAID_EXPENSES, name: 'Prepaid Expenses', nameJa: '前払費用', level: 1 },
  { category: AccountCategory.EQUIPMENT, name: 'Equipment', nameJa: '備品', level: 1 },
  { category: AccountCategory.ACCUMULATED_DEPRECIATION, name: 'Accumulated Depreciation', nameJa: '減価償却累計額', level: 1, isContra: true },

  // Lv2 - Current Assets
  { category: AccountCategory.PETTY_CASH, name: 'Petty Cash', nameJa: '小口現金', level: 2 },
  { category: AccountCategory.CHECKING_ACCOUNT, name: 'Checking Account', nameJa: '当座預金', level: 2 },
  { category: AccountCategory.SAVINGS_ACCOUNT, name: 'Savings Account', nameJa: '普通預金', level: 2 },
  { category: AccountCategory.TIME_DEPOSIT, name: 'Time Deposit', nameJa: '定期預金', level: 2 },
  { category: AccountCategory.ELECTRONICALLY_RECORDED_RECEIVABLE, name: 'Electronically Recorded Receivable', nameJa: '電子記録債権', level: 2 },
  { category: AccountCategory.CREDIT_CARD_RECEIVABLE, name: 'Credit Card Receivable', nameJa: 'クレジット売掛金', level: 2 },
  { category: AccountCategory.LOANS_RECEIVABLE, name: 'Loans Receivable', nameJa: '貸付金', level: 2 },
  { category: AccountCategory.ADVANCES_PAID, name: 'Advances Paid', nameJa: '立替金', level: 2 },
  { category: AccountCategory.PREPAID_PAYMENTS, name: 'Prepaid Payments', nameJa: '前払金', level: 2 },
  { category: AccountCategory.ACCRUED_REVENUE, name: 'Accrued Revenue', nameJa: '未収収益', level: 2 },
  { category: AccountCategory.TEMPORARY_PAYMENTS, name: 'Temporary Payments', nameJa: '仮払金', level: 2 },
  { category: AccountCategory.GIFT_CERTIFICATES_RECEIVED, name: 'Gift Certificates Received', nameJa: '受取商品券', level: 2 },
  { category: AccountCategory.SECURITY_DEPOSITS, name: 'Security Deposits', nameJa: '差入保証金', level: 2 },
  { category: AccountCategory.SUPPLIES_INVENTORY, name: 'Supplies Inventory', nameJa: '貯蔵品', level: 2 },
  { category: AccountCategory.CONSUMPTION_TAX_RECEIVABLE, name: 'Consumption Tax Receivable', nameJa: '仮払消費税', level: 2 },
  { category: AccountCategory.ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS, name: 'Allowance for Doubtful Accounts', nameJa: '貸倒引当金', level: 2, isContra: true },

  // Lv2 - Fixed Assets
  { category: AccountCategory.BUILDINGS, name: 'Buildings', nameJa: '建物', level: 2 },
  { category: AccountCategory.VEHICLES, name: 'Vehicles', nameJa: '車両運搬具', level: 2 },

  // Lv3 - Assets
  { category: AccountCategory.LAND, name: 'Land', nameJa: '土地', level: 3 },
  { category: AccountCategory.CONTRACT_ASSETS, name: 'Contract Assets', nameJa: '契約資産', level: 3 },
  { category: AccountCategory.GOODWILL, name: 'Goodwill', nameJa: 'のれん', level: 3 },
  { category: AccountCategory.PATENTS, name: 'Patents', nameJa: '特許権', level: 3 },
  { category: AccountCategory.SOFTWARE, name: 'Software', nameJa: 'ソフトウェア', level: 3 },
  { category: AccountCategory.SECURITIES, name: 'Securities', nameJa: '有価証券', level: 3 },
  { category: AccountCategory.TRADING_SECURITIES, name: 'Trading Securities', nameJa: '売買目的有価証券', level: 3 },
  { category: AccountCategory.HELD_TO_MATURITY_SECURITIES, name: 'Held-to-Maturity Securities', nameJa: '満期保有目的債券', level: 3 },
  { category: AccountCategory.SUBSIDIARY_SECURITIES, name: 'Subsidiary Securities', nameJa: '子会社株式', level: 3 },
  { category: AccountCategory.WORK_IN_PROCESS, name: 'Work in Process', nameJa: '仕掛品', level: 3 },
  { category: AccountCategory.RAW_MATERIALS, name: 'Raw Materials', nameJa: '材料', level: 3 },
  { category: AccountCategory.FINISHED_GOODS, name: 'Finished Goods', nameJa: '製品', level: 3 },

  // ===== LIABILITIES =====
  // Lv1
  { category: AccountCategory.ACCOUNTS_PAYABLE, name: 'Accounts Payable', nameJa: '買掛金', level: 1 },
  { category: AccountCategory.NOTES_PAYABLE, name: 'Notes Payable', nameJa: '支払手形', level: 1 },
  { category: AccountCategory.ACCRUED_EXPENSES, name: 'Accrued Expenses', nameJa: '未払費用', level: 1 },
  { category: AccountCategory.UNEARNED_REVENUE, name: 'Unearned Revenue', nameJa: '前受収益', level: 1 },
  { category: AccountCategory.LOANS_PAYABLE, name: 'Loans Payable', nameJa: '借入金', level: 1 },

  // Lv2
  { category: AccountCategory.ELECTRONICALLY_RECORDED_PAYABLE, name: 'Electronically Recorded Payable', nameJa: '電子記録債務', level: 2 },
  { category: AccountCategory.ADVANCE_RECEIVED, name: 'Advance Received', nameJa: '前受金', level: 2 },
  { category: AccountCategory.OVERDRAFT, name: 'Overdraft', nameJa: '当座借越', level: 2 },
  { category: AccountCategory.ACCOUNTS_PAYABLE_OTHER, name: 'Accounts Payable - Other', nameJa: '未払金', level: 2 },
  { category: AccountCategory.TEMPORARY_RECEIPTS, name: 'Temporary Receipts', nameJa: '仮受金', level: 2 },
  { category: AccountCategory.DEPOSITS_RECEIVED, name: 'Deposits Received', nameJa: '預り金', level: 2 },
  { category: AccountCategory.INCOME_TAX_WITHHOLDING, name: 'Income Tax Withholding', nameJa: '所得税預り金', level: 2 },
  { category: AccountCategory.SOCIAL_INSURANCE_WITHHOLDING, name: 'Social Insurance Withholding', nameJa: '社会保険料預り金', level: 2 },
  { category: AccountCategory.CONSUMPTION_TAX_PAYABLE, name: 'Consumption Tax Payable', nameJa: '仮受消費税', level: 2 },
  { category: AccountCategory.ACCRUED_CONSUMPTION_TAX, name: 'Accrued Consumption Tax', nameJa: '未払消費税', level: 2 },
  { category: AccountCategory.ACCRUED_CORPORATE_TAX, name: 'Accrued Corporate Tax', nameJa: '未払法人税等', level: 2 },

  // Lv3
  { category: AccountCategory.DIVIDENDS_PAYABLE, name: 'Dividends Payable', nameJa: '未払配当金', level: 3 },
  { category: AccountCategory.BONDS_PAYABLE, name: 'Bonds Payable', nameJa: '社債', level: 3 },
  { category: AccountCategory.BONUS_PROVISION, name: 'Bonus Provision', nameJa: '賞与引当金', level: 3 },
  { category: AccountCategory.RETIREMENT_PROVISION, name: 'Retirement Benefit Provision', nameJa: '退職給付引当金', level: 3 },

  // ===== EQUITY =====
  // Lv1
  { category: AccountCategory.OWNERS_CAPITAL, name: "Owner's Capital", nameJa: '資本金', level: 1 },
  { category: AccountCategory.RETAINED_EARNINGS, name: 'Retained Earnings', nameJa: '利益剰余金', level: 1 },

  // Lv3
  { category: AccountCategory.LEGAL_RESERVE, name: 'Legal Reserve', nameJa: '利益準備金', level: 3 },
  { category: AccountCategory.CAPITAL_SURPLUS, name: 'Capital Surplus', nameJa: '資本剰余金', level: 3 },
  { category: AccountCategory.VALUATION_DIFFERENCE_ON_SECURITIES, name: 'Valuation Difference on Securities', nameJa: 'その他有価証券評価差額金', level: 3 },
  { category: AccountCategory.NON_CONTROLLING_INTERESTS, name: 'Non-controlling Interests', nameJa: '非支配株主持分', level: 3 },

  // ===== REVENUE =====
  // Lv1
  { category: AccountCategory.SALES_REVENUE, name: 'Sales Revenue', nameJa: '売上高', level: 1 },
  { category: AccountCategory.SERVICE_REVENUE, name: 'Service Revenue', nameJa: 'サービス収益', level: 1 },

  // Lv2
  { category: AccountCategory.RENT_INCOME, name: 'Rent Income', nameJa: '受取家賃', level: 2 },
  { category: AccountCategory.LAND_RENT_INCOME, name: 'Land Rent Income', nameJa: '受取地代', level: 2 },
  { category: AccountCategory.COMMISSION_INCOME, name: 'Commission Income', nameJa: '受取手数料', level: 2 },
  { category: AccountCategory.INTEREST_INCOME, name: 'Interest Income', nameJa: '受取利息', level: 2 },
  { category: AccountCategory.MISCELLANEOUS_INCOME, name: 'Miscellaneous Income', nameJa: '雑益', level: 2 },
  { category: AccountCategory.GAIN_ON_SALE_OF_FIXED_ASSETS, name: 'Gain on Sale of Fixed Assets', nameJa: '固定資産売却益', level: 2 },

  // Lv3
  { category: AccountCategory.GAIN_ON_SALE_OF_SECURITIES, name: 'Gain on Sale of Securities', nameJa: '有価証券売却益', level: 3 },
  { category: AccountCategory.VALUATION_GAIN_ON_SECURITIES, name: 'Valuation Gain on Securities', nameJa: '有価証券評価益', level: 3 },

  // ===== EXPENSES =====
  // Lv1
  { category: AccountCategory.COST_OF_GOODS_SOLD, name: 'Cost of Goods Sold', nameJa: '売上原価', level: 1 },
  { category: AccountCategory.WAGES_EXPENSE, name: 'Wages Expense', nameJa: '給料', level: 1 },
  { category: AccountCategory.RENT_EXPENSE, name: 'Rent Expense', nameJa: '家賃', level: 1 },
  { category: AccountCategory.UTILITIES_EXPENSE, name: 'Utilities Expense', nameJa: '水道光熱費', level: 1 },
  { category: AccountCategory.SUPPLIES_EXPENSE, name: 'Supplies Expense', nameJa: '消耗品費', level: 1 },
  { category: AccountCategory.DEPRECIATION_EXPENSE, name: 'Depreciation Expense', nameJa: '減価償却費', level: 1 },
  { category: AccountCategory.INTEREST_EXPENSE, name: 'Interest Expense', nameJa: '支払利息', level: 1 },
  { category: AccountCategory.BAD_DEBT_EXPENSE, name: 'Bad Debt Expense', nameJa: '貸倒損失', level: 1 },

  // Lv2
  { category: AccountCategory.SHIPPING_EXPENSE, name: 'Shipping Expense', nameJa: '発送費', level: 2 },
  { category: AccountCategory.STATUTORY_WELFARE_EXPENSE, name: 'Statutory Welfare Expense', nameJa: '法定福利費', level: 2 },
  { category: AccountCategory.ADVERTISING_EXPENSE, name: 'Advertising Expense', nameJa: '広告宣伝費', level: 2 },
  { category: AccountCategory.COMMISSION_EXPENSE, name: 'Commission Expense', nameJa: '支払手数料', level: 2 },
  { category: AccountCategory.TRAVEL_EXPENSE, name: 'Travel Expense', nameJa: '旅費交通費', level: 2 },
  { category: AccountCategory.COMMUNICATION_EXPENSE, name: 'Communication Expense', nameJa: '通信費', level: 2 },
  { category: AccountCategory.CONSUMABLES_EXPENSE, name: 'Consumables Expense', nameJa: '消耗品費', level: 2 },
  { category: AccountCategory.INSURANCE_EXPENSE, name: 'Insurance Expense', nameJa: '保険料', level: 2 },
  { category: AccountCategory.TAXES_AND_DUES, name: 'Taxes and Dues', nameJa: '租税公課', level: 2 },
  { category: AccountCategory.REPAIR_EXPENSE, name: 'Repair Expense', nameJa: '修繕費', level: 2 },
  { category: AccountCategory.MISCELLANEOUS_EXPENSE, name: 'Miscellaneous Expense', nameJa: '雑費', level: 2 },
  { category: AccountCategory.ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS_EXPENSE, name: 'Allowance for Doubtful Accounts Expense', nameJa: '貸倒引当金繰入', level: 2 },
  { category: AccountCategory.LOSS_ON_SALE_OF_FIXED_ASSETS, name: 'Loss on Sale of Fixed Assets', nameJa: '固定資産売却損', level: 2 },
  { category: AccountCategory.TAX_EXPENSE, name: 'Tax Expense', nameJa: '法人税等', level: 2 },

  // Lv3
  { category: AccountCategory.LOSS_ON_SALE_OF_SECURITIES, name: 'Loss on Sale of Securities', nameJa: '有価証券売却損', level: 3 },
  { category: AccountCategory.GOODWILL_AMORTIZATION, name: 'Goodwill Amortization', nameJa: 'のれん償却', level: 3 },
  { category: AccountCategory.RESEARCH_AND_DEVELOPMENT, name: 'Research & Development', nameJa: '研究開発費', level: 3 },
  { category: AccountCategory.MANUFACTURING_OVERHEAD, name: 'Manufacturing Overhead', nameJa: '製造間接費', level: 3 },
  { category: AccountCategory.DIRECT_MATERIALS, name: 'Direct Materials', nameJa: '直接材料費', level: 3 },
  { category: AccountCategory.DIRECT_LABOR, name: 'Direct Labor', nameJa: '直接労務費', level: 3 },
  { category: AccountCategory.MATERIAL_PRICE_VARIANCE, name: 'Material Price Variance', nameJa: '材料価格差異', level: 3 },
  { category: AccountCategory.LABOR_EFFICIENCY_VARIANCE, name: 'Labor Efficiency Variance', nameJa: '労務能率差異', level: 3 },
];

export function createAccount(
  category: AccountCategory,
  name: string,
  nameJa: string,
  level: 1 | 2 | 3 = 1
): Account {
  const type = getAccountType(category);

  const normalBalanceMap: Record<AccountType, 'DEBIT' | 'CREDIT'> = {
    [AccountType.ASSET]: 'DEBIT',
    [AccountType.LIABILITY]: 'CREDIT',
    [AccountType.EQUITY]: 'CREDIT',
    [AccountType.REVENUE]: 'CREDIT',
    [AccountType.EXPENSE]: 'DEBIT',
  };

  return {
    id: category,
    name,
    nameJa,
    type,
    category,
    balance: 0,
    normalBalance: normalBalanceMap[type],
    level,
  };
}

// Check if debit increases the account
export function isDebitIncrease(type: AccountType): boolean {
  return type === AccountType.ASSET || type === AccountType.EXPENSE;
}

// Get accounts for a specific game level (includes all lower levels)
export function getAccountDefsForLevel(level: 1 | 2 | 3): AccountDef[] {
  return ALL_ACCOUNT_DEFS.filter(def => def.level <= level);
}

// Check if an account is a contra account (reduces its parent type)
export function isContraAccount(category: AccountCategory): boolean {
  return category === AccountCategory.ACCUMULATED_DEPRECIATION
    || category === AccountCategory.ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS;
}
