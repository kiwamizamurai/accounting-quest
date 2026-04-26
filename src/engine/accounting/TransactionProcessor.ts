import { AccountCategory } from '../../models/Account';
import {
  JournalEntry,
  TransactionLine,
  BusinessEventType,
  GameDate,
  createJournalEntry,
} from '../../models/Transaction';

let entryCounter = 0;

function generateEntryId(): string {
  return `JE-${++entryCounter}-${Date.now()}`;
}

function validateAmount(amount: number, label: string): void {
  if (amount <= 0) {
    throw new Error(`TransactionProcessor: ${label} must be positive (got ${amount})`);
  }
}

/**
 * Create transaction templates for common business events
 */
export class TransactionProcessor {
  private currentChapter: number;

  constructor(currentChapter: number = 1) {
    this.currentChapter = currentChapter;
  }

  setChapter(chapter: number): void {
    this.currentChapter = chapter;
  }

  /**
   * Chapter 1: Owner Investment
   * Debit: Cash | Credit: Owner's Capital
   */
  createOwnerInvestment(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.CASH, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.OWNERS_CAPITAL, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Owner invested cash into the business',
      'オーナーが事業に現金を出資した',
      lines,
      BusinessEventType.OWNER_INVESTMENT,
      this.currentChapter
    );
  }

  /**
   * Chapter 1: Cash Purchase of Inventory
   * Debit: Inventory | Credit: Cash
   */
  createCashPurchase(amount: number, date: GameDate, description: string = 'lemons'): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.INVENTORY, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CASH, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      `Purchased ${description} for cash`,
      `${description}を現金で購入した`,
      lines,
      BusinessEventType.CASH_PURCHASE,
      this.currentChapter
    );
  }

  /**
   * Chapter 1: Cash Sale
   * Debit: Cash | Credit: Sales Revenue
   * And record COGS:
   * Debit: COGS | Credit: Inventory
   */
  createCashSale(
    saleAmount: number,
    costAmount: number,
    date: GameDate
  ): JournalEntry[] {
    validateAmount(saleAmount, 'saleAmount');
    validateAmount(costAmount, 'costAmount');
    const saleEntry = createJournalEntry(
      generateEntryId(),
      date,
      'Cash sale to customer',
      '顧客への現金販売',
      [
        { accountCategory: AccountCategory.CASH, debit: saleAmount, credit: 0 },
        { accountCategory: AccountCategory.SALES_REVENUE, debit: 0, credit: saleAmount },
      ],
      BusinessEventType.CASH_SALE,
      this.currentChapter
    );

    const cogsEntry = createJournalEntry(
      generateEntryId(),
      date,
      'Record cost of goods sold',
      '売上原価の計上',
      [
        { accountCategory: AccountCategory.COST_OF_GOODS_SOLD, debit: costAmount, credit: 0 },
        { accountCategory: AccountCategory.INVENTORY, debit: 0, credit: costAmount },
      ],
      BusinessEventType.CASH_SALE,
      this.currentChapter
    );

    return [saleEntry, cogsEntry];
  }

  /**
   * Chapter 2: Record Expense (Cash Payment)
   * Debit: Expense Account | Credit: Cash
   */
  createExpensePayment(
    expenseCategory: AccountCategory,
    amount: number,
    date: GameDate,
    description: string
  ): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: expenseCategory, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CASH, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      `Paid ${description}`,
      `${description}を支払った`,
      lines,
      BusinessEventType.RECORD_EXPENSE,
      this.currentChapter
    );
  }

  /**
   * Chapter 3: Take a Loan
   * Debit: Cash | Credit: Loans Payable
   */
  createLoan(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.CASH, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.LOANS_PAYABLE, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Borrowed money from bank',
      '銀行から借入を行った',
      lines,
      BusinessEventType.TAKE_LOAN,
      this.currentChapter
    );
  }

  /**
   * Chapter 3: Repay Loan (Principal + Interest)
   * Debit: Loans Payable (principal) | Debit: Interest Expense | Credit: Cash
   */
  createLoanRepayment(
    principal: number,
    interest: number,
    date: GameDate
  ): JournalEntry {
    validateAmount(principal, 'principal');
    validateAmount(interest, 'interest');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.LOANS_PAYABLE, debit: principal, credit: 0 },
      { accountCategory: AccountCategory.INTEREST_EXPENSE, debit: interest, credit: 0 },
      { accountCategory: AccountCategory.CASH, debit: 0, credit: principal + interest },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Repaid loan with interest',
      '借入金と利息を返済した',
      lines,
      BusinessEventType.REPAY_LOAN,
      this.currentChapter
    );
  }

  /**
   * Chapter 3: Credit Purchase (Accounts Payable)
   * Debit: Inventory | Credit: Accounts Payable
   */
  createCreditPurchase(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.INVENTORY, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.ACCOUNTS_PAYABLE, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Purchased inventory on credit',
      '掛けで仕入れを行った',
      lines,
      BusinessEventType.CREDIT_PURCHASE,
      this.currentChapter
    );
  }

  /**
   * Chapter 3: Pay Accounts Payable
   * Debit: Accounts Payable | Credit: Cash
   */
  createPayAccountsPayable(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.ACCOUNTS_PAYABLE, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CASH, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Paid accounts payable',
      '買掛金を支払った',
      lines,
      BusinessEventType.PAY_ACCOUNTS_PAYABLE,
      this.currentChapter
    );
  }

  /**
   * Chapter 4: Credit Sale (Accounts Receivable)
   * Debit: Accounts Receivable | Credit: Sales Revenue
   */
  createCreditSale(
    saleAmount: number,
    costAmount: number,
    date: GameDate
  ): JournalEntry[] {
    validateAmount(saleAmount, 'saleAmount');
    validateAmount(costAmount, 'costAmount');
    const saleEntry = createJournalEntry(
      generateEntryId(),
      date,
      'Sold on credit to customer',
      '顧客への掛け売り',
      [
        { accountCategory: AccountCategory.ACCOUNTS_RECEIVABLE, debit: saleAmount, credit: 0 },
        { accountCategory: AccountCategory.SALES_REVENUE, debit: 0, credit: saleAmount },
      ],
      BusinessEventType.CREDIT_SALE,
      this.currentChapter
    );

    const cogsEntry = createJournalEntry(
      generateEntryId(),
      date,
      'Record cost of goods sold',
      '売上原価の計上',
      [
        { accountCategory: AccountCategory.COST_OF_GOODS_SOLD, debit: costAmount, credit: 0 },
        { accountCategory: AccountCategory.INVENTORY, debit: 0, credit: costAmount },
      ],
      BusinessEventType.CREDIT_SALE,
      this.currentChapter
    );

    return [saleEntry, cogsEntry];
  }

  /**
   * Chapter 4: Collect Receivable
   * Debit: Cash | Credit: Accounts Receivable
   */
  createCollectReceivable(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.CASH, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.ACCOUNTS_RECEIVABLE, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Collected accounts receivable',
      '売掛金を回収した',
      lines,
      BusinessEventType.COLLECT_RECEIVABLE,
      this.currentChapter
    );
  }

  /**
   * Chapter 4: Write Off Bad Debt
   * Debit: Bad Debt Expense | Credit: Accounts Receivable
   */
  createBadDebtWriteOff(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.BAD_DEBT_EXPENSE, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.ACCOUNTS_RECEIVABLE, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Wrote off uncollectible account',
      '貸倒れを計上した',
      lines,
      BusinessEventType.WRITE_OFF_BAD_DEBT,
      this.currentChapter
    );
  }

  /**
   * Chapter 7: Purchase Equipment
   * Debit: Equipment | Credit: Cash
   */
  createEquipmentPurchase(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.EQUIPMENT, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CASH, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Purchased equipment',
      '設備を購入した',
      lines,
      BusinessEventType.PURCHASE_EQUIPMENT,
      this.currentChapter
    );
  }

  /**
   * Chapter 7: Record Depreciation
   * Debit: Depreciation Expense | Credit: Accumulated Depreciation
   */
  createDepreciation(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.DEPRECIATION_EXPENSE, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.ACCUMULATED_DEPRECIATION, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Record depreciation expense',
      '減価償却費を計上した',
      lines,
      BusinessEventType.RECORD_DEPRECIATION,
      this.currentChapter
    );
  }

  // ========== Lv2 Methods ==========

  /**
   * Lv2: Incorporate Company
   * Debit: Savings Account | Credit: Owner's Capital
   */
  createIncorporation(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.SAVINGS_ACCOUNT, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.OWNERS_CAPITAL, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Incorporated company with capital contribution',
      '会社を設立し資本金を払い込んだ',
      lines,
      BusinessEventType.INCORPORATE_COMPANY,
      this.currentChapter
    );
  }

  /**
   * Lv2: Open Bank Account
   * Debit: Checking Account | Credit: Savings Account
   */
  createOpenBankAccount(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.SAVINGS_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Opened checking account and transferred funds',
      '当座預金口座を開設し資金を振り替えた',
      lines,
      BusinessEventType.OPEN_BANK_ACCOUNT,
      this.currentChapter
    );
  }

  /**
   * Lv2: Pay Security Deposit
   * Debit: Security Deposits | Credit: Checking Account
   */
  createPaySecurityDeposit(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.SECURITY_DEPOSITS, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Paid security deposit',
      '差入保証金を支払った',
      lines,
      BusinessEventType.PAY_SECURITY_DEPOSIT,
      this.currentChapter
    );
  }

  /**
   * Lv2: Purchase Building
   * Debit: Buildings | Credit: Checking Account
   */
  createPurchaseBuilding(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.BUILDINGS, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Purchased building',
      '建物を購入した',
      lines,
      BusinessEventType.PURCHASE_BUILDING,
      this.currentChapter
    );
  }

  /**
   * Lv2: Purchase Vehicle
   * Debit: Vehicles | Credit: Checking Account
   */
  createPurchaseVehicle(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.VEHICLES, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Purchased vehicle',
      '車両を購入した',
      lines,
      BusinessEventType.PURCHASE_VEHICLE,
      this.currentChapter
    );
  }

  /**
   * Lv2: Electronic Purchase (Electronically Recorded Payable)
   * Debit: Inventory | Credit: Electronically Recorded Payable
   */
  createElectronicPurchase(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.INVENTORY, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.ELECTRONICALLY_RECORDED_PAYABLE, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Purchased inventory with electronically recorded payable',
      '電子記録債務で仕入れを行った',
      lines,
      BusinessEventType.ELECTRONIC_PAYABLE,
      this.currentChapter
    );
  }

  /**
   * Lv2: Record Consumption Tax on Purchase
   * Debit: Inventory (purchaseAmount) | Debit: Consumption Tax Receivable (taxAmount)
   * Credit: Checking Account (total)
   */
  createRecordConsumptionTaxOnPurchase(
    purchaseAmount: number,
    taxAmount: number,
    date: GameDate
  ): JournalEntry {
    validateAmount(purchaseAmount, 'purchaseAmount');
    validateAmount(taxAmount, 'taxAmount');
    const total = purchaseAmount + taxAmount;
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.INVENTORY, debit: purchaseAmount, credit: 0 },
      { accountCategory: AccountCategory.CONSUMPTION_TAX_RECEIVABLE, debit: taxAmount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: total },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Purchased inventory and recorded consumption tax receivable',
      '仕入れを行い仮払消費税を計上した',
      lines,
      BusinessEventType.RECORD_CONSUMPTION_TAX_RECEIVABLE,
      this.currentChapter
    );
  }

  /**
   * Lv2: Record Consumption Tax on Sale
   * Debit: Checking Account (total) | Credit: Sales Revenue (saleAmount)
   * Credit: Consumption Tax Payable (taxAmount)
   */
  createRecordConsumptionTaxOnSale(
    saleAmount: number,
    taxAmount: number,
    date: GameDate
  ): JournalEntry {
    validateAmount(saleAmount, 'saleAmount');
    validateAmount(taxAmount, 'taxAmount');
    const total = saleAmount + taxAmount;
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: total, credit: 0 },
      { accountCategory: AccountCategory.SALES_REVENUE, debit: 0, credit: saleAmount },
      { accountCategory: AccountCategory.CONSUMPTION_TAX_PAYABLE, debit: 0, credit: taxAmount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Recorded sale and consumption tax payable',
      '売上を計上し仮受消費税を計上した',
      lines,
      BusinessEventType.RECORD_CONSUMPTION_TAX_PAYABLE,
      this.currentChapter
    );
  }

  /**
   * Lv2: Settle Consumption Tax
   * Debit: Consumption Tax Payable (payable)
   * Credit: Consumption Tax Receivable (receivable)
   * Credit/Debit: Accrued Consumption Tax (difference)
   */
  createSettleConsumptionTax(
    receivable: number,
    payable: number,
    date: GameDate
  ): JournalEntry {
    validateAmount(receivable, 'receivable');
    validateAmount(payable, 'payable');
    const difference = payable - receivable;
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.CONSUMPTION_TAX_PAYABLE, debit: payable, credit: 0 },
      { accountCategory: AccountCategory.CONSUMPTION_TAX_RECEIVABLE, debit: 0, credit: receivable },
    ];

    if (difference >= 0) {
      lines.push({ accountCategory: AccountCategory.ACCRUED_CONSUMPTION_TAX, debit: 0, credit: difference });
    } else {
      lines.push({ accountCategory: AccountCategory.ACCRUED_CONSUMPTION_TAX, debit: -difference, credit: 0 });
    }

    return createJournalEntry(
      generateEntryId(),
      date,
      'Settled consumption tax',
      '消費税を精算した',
      lines,
      BusinessEventType.SETTLE_CONSUMPTION_TAX,
      this.currentChapter
    );
  }

  /**
   * Lv2: Pay Wages with Withholding
   * Debit: Wages Expense (gross)
   * Credit: Income Tax Withholding (incomeTax)
   * Credit: Social Insurance Withholding (socialInsurance)
   * Credit: Checking Account (net)
   */
  createPayWagesWithWithholding(
    grossWages: number,
    incomeTax: number,
    socialInsurance: number,
    date: GameDate
  ): JournalEntry {
    validateAmount(grossWages, 'grossWages');
    validateAmount(incomeTax, 'incomeTax');
    validateAmount(socialInsurance, 'socialInsurance');
    const netPay = grossWages - incomeTax - socialInsurance;
    validateAmount(netPay, 'netPay (grossWages - incomeTax - socialInsurance)');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.WAGES_EXPENSE, debit: grossWages, credit: 0 },
      { accountCategory: AccountCategory.INCOME_TAX_WITHHOLDING, debit: 0, credit: incomeTax },
      { accountCategory: AccountCategory.SOCIAL_INSURANCE_WITHHOLDING, debit: 0, credit: socialInsurance },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: netPay },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Paid wages with income tax and social insurance withheld',
      '給料を支給し源泉所得税と社会保険料を控除した',
      lines,
      BusinessEventType.PAY_WAGES_WITH_WITHHOLDING,
      this.currentChapter
    );
  }

  /**
   * Lv2: Pay Statutory Welfare Expense
   * Debit: Statutory Welfare Expense | Credit: Checking Account
   */
  createPayStatutoryWelfare(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.STATUTORY_WELFARE_EXPENSE, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Paid statutory welfare expense',
      '法定福利費を支払った',
      lines,
      BusinessEventType.PAY_STATUTORY_WELFARE,
      this.currentChapter
    );
  }

  /**
   * Lv2: Establish Petty Cash Fund
   * Debit: Petty Cash | Credit: Checking Account
   */
  createPettyCashFund(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.PETTY_CASH, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Established petty cash fund',
      '小口現金を設定した',
      lines,
      BusinessEventType.PETTY_CASH_FUND,
      this.currentChapter
    );
  }

  /**
   * Lv2: Replenish Petty Cash
   * Entry 1: Debit: each expense category | Credit: Petty Cash (total)
   * Entry 2: Debit: Petty Cash | Credit: Checking Account (total)
   */
  createPettyCashReplenish(
    expenses: { category: AccountCategory; amount: number }[],
    date: GameDate
  ): JournalEntry[] {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const expenseLines: TransactionLine[] = expenses.map(e => ({
      accountCategory: e.category,
      debit: e.amount,
      credit: 0,
    }));
    expenseLines.push({ accountCategory: AccountCategory.PETTY_CASH, debit: 0, credit: total });

    const expenseEntry = createJournalEntry(
      generateEntryId(),
      date,
      'Recorded petty cash expenses',
      '小口現金の支出を報告した',
      expenseLines,
      BusinessEventType.PETTY_CASH_REPLENISH,
      this.currentChapter
    );

    const replenishEntry = createJournalEntry(
      generateEntryId(),
      date,
      'Replenished petty cash fund',
      '小口現金を補給した',
      [
        { accountCategory: AccountCategory.PETTY_CASH, debit: total, credit: 0 },
        { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: total },
      ],
      BusinessEventType.PETTY_CASH_REPLENISH,
      this.currentChapter
    );

    return [expenseEntry, replenishEntry];
  }

  /**
   * Lv2: Credit Card Sale
   * Entry 1: Debit: Credit Card Receivable (saleAmount - feeAmount) |
   *           Debit: Commission Expense (feeAmount) | Credit: Sales Revenue (saleAmount)
   * Entry 2: Debit: COGS (costAmount) | Credit: Inventory (costAmount)
   */
  createCreditCardSale(
    saleAmount: number,
    feeAmount: number,
    costAmount: number,
    date: GameDate
  ): JournalEntry[] {
    validateAmount(saleAmount, 'saleAmount');
    validateAmount(feeAmount, 'feeAmount');
    validateAmount(costAmount, 'costAmount');
    validateAmount(saleAmount - feeAmount, 'saleAmount - feeAmount (credit card receivable)');
    const saleEntry = createJournalEntry(
      generateEntryId(),
      date,
      'Sold via credit card with commission fee',
      'クレジットカードで売上を計上し手数料を差し引いた',
      [
        { accountCategory: AccountCategory.CREDIT_CARD_RECEIVABLE, debit: saleAmount - feeAmount, credit: 0 },
        { accountCategory: AccountCategory.COMMISSION_EXPENSE, debit: feeAmount, credit: 0 },
        { accountCategory: AccountCategory.SALES_REVENUE, debit: 0, credit: saleAmount },
      ],
      BusinessEventType.CREDIT_CARD_SALE,
      this.currentChapter
    );

    const cogsEntry = createJournalEntry(
      generateEntryId(),
      date,
      'Record cost of goods sold',
      '売上原価の計上',
      [
        { accountCategory: AccountCategory.COST_OF_GOODS_SOLD, debit: costAmount, credit: 0 },
        { accountCategory: AccountCategory.INVENTORY, debit: 0, credit: costAmount },
      ],
      BusinessEventType.CREDIT_CARD_SALE,
      this.currentChapter
    );

    return [saleEntry, cogsEntry];
  }

  /**
   * Lv2: Record Allowance for Doubtful Accounts
   * Debit: Allowance for Doubtful Accounts Expense | Credit: Allowance for Doubtful Accounts
   */
  createRecordAllowanceForDA(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS_EXPENSE, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Recorded allowance for doubtful accounts',
      '貸倒引当金を計上した',
      lines,
      BusinessEventType.RECORD_ALLOWANCE_FOR_DA,
      this.currentChapter
    );
  }

  /**
   * Lv2: Record Accrued Expense
   * Debit: Expense Category | Credit: Accrued Expenses
   */
  createRecordAccruedExpense(
    expenseCategory: AccountCategory,
    amount: number,
    date: GameDate,
    description: string
  ): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: expenseCategory, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.ACCRUED_EXPENSES, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      `Recorded accrued expense: ${description}`,
      `未払費用を計上した: ${description}`,
      lines,
      BusinessEventType.RECORD_ACCRUED_EXPENSE,
      this.currentChapter
    );
  }

  /**
   * Lv2: Record Accrued Revenue
   * Debit: Accrued Revenue | Credit: Revenue Category
   */
  createRecordAccruedRevenue(
    revenueCategory: AccountCategory,
    amount: number,
    date: GameDate,
    description: string
  ): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.ACCRUED_REVENUE, debit: amount, credit: 0 },
      { accountCategory: revenueCategory, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      `Recorded accrued revenue: ${description}`,
      `未収収益を計上した: ${description}`,
      lines,
      BusinessEventType.RECORD_ACCRUED_REVENUE,
      this.currentChapter
    );
  }

  /**
   * Lv2: Sell Fixed Asset at a Gain
   * Debit: Checking Account (salePrice) | Debit: Accumulated Depreciation (accDepreciation)
   * Credit: Asset Category (bookValue + accDepreciation) | Credit: Gain on Sale (gain)
   */
  createSellFixedAssetGain(
    assetCategory: AccountCategory,
    bookValue: number,
    salePrice: number,
    accDepreciation: number,
    date: GameDate
  ): JournalEntry {
    const acquisitionCost = bookValue + accDepreciation;
    const gain = salePrice - bookValue;
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: salePrice, credit: 0 },
      { accountCategory: AccountCategory.ACCUMULATED_DEPRECIATION, debit: accDepreciation, credit: 0 },
      { accountCategory: assetCategory, debit: 0, credit: acquisitionCost },
      { accountCategory: AccountCategory.GAIN_ON_SALE_OF_FIXED_ASSETS, debit: 0, credit: gain },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Sold fixed asset at a gain',
      '固定資産を売却益で売却した',
      lines,
      BusinessEventType.SELL_FIXED_ASSET_GAIN,
      this.currentChapter
    );
  }

  /**
   * Lv2: Sell Fixed Asset at a Loss
   * Debit: Checking Account (salePrice) | Debit: Accumulated Depreciation (accDepreciation)
   * Debit: Loss on Sale (loss) | Credit: Asset Category (bookValue + accDepreciation)
   */
  createSellFixedAssetLoss(
    assetCategory: AccountCategory,
    bookValue: number,
    salePrice: number,
    accDepreciation: number,
    date: GameDate
  ): JournalEntry {
    const acquisitionCost = bookValue + accDepreciation;
    const loss = bookValue - salePrice;
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: salePrice, credit: 0 },
      { accountCategory: AccountCategory.ACCUMULATED_DEPRECIATION, debit: accDepreciation, credit: 0 },
      { accountCategory: AccountCategory.LOSS_ON_SALE_OF_FIXED_ASSETS, debit: loss, credit: 0 },
      { accountCategory: assetCategory, debit: 0, credit: acquisitionCost },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Sold fixed asset at a loss',
      '固定資産を売却損で売却した',
      lines,
      BusinessEventType.SELL_FIXED_ASSET_LOSS,
      this.currentChapter
    );
  }

  /**
   * Lv2: Record Corporate Tax
   * Debit: Tax Expense | Credit: Accrued Corporate Tax
   */
  createRecordCorporateTax(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.TAX_EXPENSE, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.ACCRUED_CORPORATE_TAX, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Recorded corporate tax expense',
      '法人税等を計上した',
      lines,
      BusinessEventType.RECORD_CORPORATE_TAX,
      this.currentChapter
    );
  }

  // ========== Lv3 Methods ==========

  /**
   * Lv3: Purchase Raw Materials
   * Debit: Raw Materials | Credit: Checking Account
   */
  createPurchaseRawMaterials(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.RAW_MATERIALS, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Purchased raw materials',
      '材料を購入した',
      lines,
      BusinessEventType.PURCHASE_RAW_MATERIALS,
      this.currentChapter
    );
  }

  /**
   * Lv3: Issue Materials to Production
   * Debit: Work in Process | Credit: Raw Materials
   */
  createIssueMaterialsToProduction(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.WORK_IN_PROCESS, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.RAW_MATERIALS, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Issued materials to production',
      '材料を製造工程に投入した',
      lines,
      BusinessEventType.ISSUE_MATERIALS_TO_PRODUCTION,
      this.currentChapter
    );
  }

  /**
   * Lv3: Record Direct Labor
   * Debit: Work in Process | Credit: Checking Account
   */
  createRecordDirectLabor(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.WORK_IN_PROCESS, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Recorded direct labor costs',
      '直接労務費を計上した',
      lines,
      BusinessEventType.RECORD_DIRECT_LABOR,
      this.currentChapter
    );
  }

  /**
   * Lv3: Record Manufacturing Overhead
   * Debit: Manufacturing Overhead | Credit: Checking Account
   */
  createRecordManufacturingOverhead(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.MANUFACTURING_OVERHEAD, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Recorded manufacturing overhead',
      '製造間接費を計上した',
      lines,
      BusinessEventType.RECORD_MANUFACTURING_OVERHEAD,
      this.currentChapter
    );
  }

  /**
   * Lv3: Allocate Overhead to Work in Process
   * Debit: Work in Process | Credit: Manufacturing Overhead
   */
  createAllocateOverhead(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.WORK_IN_PROCESS, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.MANUFACTURING_OVERHEAD, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Allocated manufacturing overhead to production',
      '製造間接費を仕掛品に配賦した',
      lines,
      BusinessEventType.ALLOCATE_OVERHEAD,
      this.currentChapter
    );
  }

  /**
   * Lv3: Complete Production
   * Debit: Finished Goods | Credit: Work in Process
   */
  createCompleteProduction(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.FINISHED_GOODS, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.WORK_IN_PROCESS, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Completed production and transferred to finished goods',
      '製品が完成し仕掛品から製品へ振り替えた',
      lines,
      BusinessEventType.COMPLETE_PRODUCTION,
      this.currentChapter
    );
  }

  /**
   * Lv3: Purchase Trading Securities
   * Debit: Trading Securities | Credit: Checking Account
   */
  createPurchaseTradingSecurities(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.TRADING_SECURITIES, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Purchased trading securities',
      '売買目的有価証券を購入した',
      lines,
      BusinessEventType.PURCHASE_TRADING_SECURITIES,
      this.currentChapter
    );
  }

  /**
   * Lv3: Sell Trading Securities
   * If gain: Debit: Checking Account | Credit: Trading Securities | Credit: Gain on Sale
   * If loss: Debit: Checking Account | Debit: Loss on Sale | Credit: Trading Securities
   */
  createSellTradingSecurities(
    bookValue: number,
    salePrice: number,
    date: GameDate
  ): JournalEntry {
    validateAmount(bookValue, 'bookValue');
    validateAmount(salePrice, 'salePrice');
    const lines: TransactionLine[] = [];

    if (salePrice >= bookValue) {
      const gain = salePrice - bookValue;
      lines.push({ accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: salePrice, credit: 0 });
      lines.push({ accountCategory: AccountCategory.TRADING_SECURITIES, debit: 0, credit: bookValue });
      if (gain > 0) {
        lines.push({ accountCategory: AccountCategory.GAIN_ON_SALE_OF_SECURITIES, debit: 0, credit: gain });
      }
    } else {
      const loss = bookValue - salePrice;
      lines.push({ accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: salePrice, credit: 0 });
      lines.push({ accountCategory: AccountCategory.LOSS_ON_SALE_OF_SECURITIES, debit: loss, credit: 0 });
      lines.push({ accountCategory: AccountCategory.TRADING_SECURITIES, debit: 0, credit: bookValue });
    }

    return createJournalEntry(
      generateEntryId(),
      date,
      'Sold trading securities',
      '売買目的有価証券を売却した',
      lines,
      BusinessEventType.SELL_TRADING_SECURITIES,
      this.currentChapter
    );
  }

  /**
   * Lv3: Revalue Trading Securities to Fair Value
   * If gain: Debit: Trading Securities | Credit: Valuation Gain on Securities
   * If loss: Debit: Loss on Sale of Securities | Credit: Trading Securities
   */
  createRevalueSecurities(
    bookValue: number,
    fairValue: number,
    date: GameDate
  ): JournalEntry {
    validateAmount(bookValue, 'bookValue');
    validateAmount(fairValue, 'fairValue');
    const lines: TransactionLine[] = [];

    if (fairValue >= bookValue) {
      const gain = fairValue - bookValue;
      lines.push({ accountCategory: AccountCategory.TRADING_SECURITIES, debit: gain, credit: 0 });
      lines.push({ accountCategory: AccountCategory.VALUATION_GAIN_ON_SECURITIES, debit: 0, credit: gain });
    } else {
      const loss = bookValue - fairValue;
      lines.push({ accountCategory: AccountCategory.VALUATION_LOSS_ON_SECURITIES, debit: loss, credit: 0 });
      lines.push({ accountCategory: AccountCategory.TRADING_SECURITIES, debit: 0, credit: loss });
    }

    return createJournalEntry(
      generateEntryId(),
      date,
      'Revalued trading securities to fair value',
      '売買目的有価証券を時価評価した',
      lines,
      BusinessEventType.REVALUE_SECURITIES,
      this.currentChapter
    );
  }

  /**
   * Lv3: Acquire Subsidiary
   * Debit: Subsidiary Securities | Credit: Checking Account
   */
  createAcquireSubsidiary(amount: number, _netAssets: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.SUBSIDIARY_SECURITIES, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Acquired subsidiary company shares',
      '子会社株式を取得した',
      lines,
      BusinessEventType.ACQUIRE_SUBSIDIARY,
      this.currentChapter
    );
  }

  /**
   * Lv3: Amortize Goodwill
   * Debit: Goodwill Amortization | Credit: Goodwill
   */
  createAmortizeGoodwill(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.GOODWILL_AMORTIZATION, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.GOODWILL, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Amortized goodwill',
      'のれんを償却した',
      lines,
      BusinessEventType.AMORTIZE_GOODWILL,
      this.currentChapter
    );
  }

  /**
   * Lv3: Declare Dividend
   * Debit: Retained Earnings | Credit: Dividends Payable
   */
  createDeclareDividend(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.RETAINED_EARNINGS, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.DIVIDENDS_PAYABLE, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Declared dividends to shareholders',
      '株主への配当を宣言した',
      lines,
      BusinessEventType.DECLARE_DIVIDEND,
      this.currentChapter
    );
  }

  /**
   * Lv3: Pay Dividend
   * Debit: Dividends Payable | Credit: Checking Account
   */
  createPayDividend(amount: number, date: GameDate): JournalEntry {
    validateAmount(amount, 'amount');
    const lines: TransactionLine[] = [
      { accountCategory: AccountCategory.DIVIDENDS_PAYABLE, debit: amount, credit: 0 },
      { accountCategory: AccountCategory.CHECKING_ACCOUNT, debit: 0, credit: amount },
    ];

    return createJournalEntry(
      generateEntryId(),
      date,
      'Paid dividends to shareholders',
      '株主へ配当金を支払った',
      lines,
      BusinessEventType.PAY_DIVIDEND,
      this.currentChapter
    );
  }
}
