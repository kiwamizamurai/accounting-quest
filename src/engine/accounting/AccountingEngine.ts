import { Account, AccountCategory, AccountType, isDebitIncrease } from '../../models/Account';
import { JournalEntry } from '../../models/Transaction';

export interface BalanceSheet {
  assets: AccountBalance[];
  liabilities: AccountBalance[];
  equity: AccountBalance[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netIncome: number;
  isBalanced: boolean;
}

export interface IncomeStatement {
  revenues: AccountBalance[];
  expenses: AccountBalance[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface AccountBalance {
  category: AccountCategory;
  name: string;
  nameJa: string;
  balance: number;
}

export class AccountingEngine {
  private accounts: Map<AccountCategory, Account>;
  private journalEntries: JournalEntry[];

  constructor(
    accounts: Map<AccountCategory, Account>,
    journalEntries: JournalEntry[]
  ) {
    this.accounts = accounts;
    this.journalEntries = journalEntries;
  }

  /**
   * Process a journal entry with double-entry validation
   */
  processJournalEntry(entry: JournalEntry): ProcessResult {
    // Validate double-entry: total debits must equal total credits
    const validation = this.validateJournalEntry(entry);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        entry: null,
      };
    }

    // Validate all accounts exist before applying any changes
    for (const line of entry.lines) {
      if (!this.accounts.get(line.accountCategory)) {
        return {
          success: false,
          error: `Account not found: ${line.accountCategory}`,
          entry: null,
        };
      }
    }

    // Apply the entry to accounts (all accounts verified above)
    for (const line of entry.lines) {
      const account = this.accounts.get(line.accountCategory)!;

      // Update balance based on debit/credit and normal balance
      if (isDebitIncrease(account.type)) {
        account.balance += line.debit - line.credit;
      } else {
        account.balance += line.credit - line.debit;
      }
    }

    entry.validated = true;
    this.journalEntries.push(entry);

    return {
      success: true,
      entry,
    };
  }

  /**
   * Validate that debits equal credits
   */
  validateJournalEntry(entry: JournalEntry): ValidationResult {
    let totalDebits = 0;
    let totalCredits = 0;

    for (const line of entry.lines) {
      totalDebits += line.debit;
      totalCredits += line.credit;
    }

    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      return {
        isValid: false,
        error: `Debits (${totalDebits}) do not equal Credits (${totalCredits})`,
      };
    }

    return { isValid: true };
  }

  /**
   * Generate Balance Sheet
   * Assets = Liabilities + Owner's Equity
   */
  getBalanceSheet(): BalanceSheet {
    const assets: AccountBalance[] = [];
    const liabilities: AccountBalance[] = [];
    const equity: AccountBalance[] = [];

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    for (const [, account] of this.accounts) {
      const balance: AccountBalance = {
        category: account.category,
        name: account.name,
        nameJa: account.nameJa,
        balance: account.balance,
      };

      switch (account.type) {
        case AccountType.ASSET:
          assets.push(balance);
          // Contra-asset accounts (e.g. Accumulated Depreciation, Allowance for Doubtful Accounts)
          // already have negative balances via the debit-increase rule, so += works correctly
          totalAssets += account.balance;
          break;
        case AccountType.LIABILITY:
          liabilities.push(balance);
          totalLiabilities += account.balance;
          break;
        case AccountType.EQUITY:
          equity.push(balance);
          totalEquity += account.balance;
          break;
      }
    }

    // Add net income to equity
    const incomeStatement = this.getIncomeStatement();
    totalEquity += incomeStatement.netIncome;
    equity.push({
      category: AccountCategory.RETAINED_EARNINGS,
      name: 'Net Income (Current Period)',
      nameJa: '当期純利益',
      balance: incomeStatement.netIncome,
    });

    return {
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
      netIncome: incomeStatement.netIncome,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.001,
    };
  }

  /**
   * Generate Income Statement
   * Net Income = Revenue - Expenses
   */
  getIncomeStatement(): IncomeStatement {
    const revenues: AccountBalance[] = [];
    const expenses: AccountBalance[] = [];

    let totalRevenue = 0;
    let totalExpenses = 0;

    for (const [, account] of this.accounts) {
      const balance: AccountBalance = {
        category: account.category,
        name: account.name,
        nameJa: account.nameJa,
        balance: account.balance,
      };

      switch (account.type) {
        case AccountType.REVENUE:
          revenues.push(balance);
          totalRevenue += account.balance;
          break;
        case AccountType.EXPENSE:
          expenses.push(balance);
          totalExpenses += account.balance;
          break;
      }
    }

    return {
      revenues,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
    };
  }

  /**
   * Get account balance by category
   */
  getAccountBalance(category: AccountCategory): number {
    const account = this.accounts.get(category);
    return account ? account.balance : 0;
  }

  /**
   * Get total cash
   */
  getCash(): number {
    return this.getAccountBalance(AccountCategory.CASH);
  }

  /**
   * Get all journal entries
   */
  getJournalEntries(): JournalEntry[] {
    return [...this.journalEntries];
  }

  /**
   * Check if the accounting equation is balanced
   * Assets = Liabilities + Owner's Equity
   */
  isBalanced(): boolean {
    const bs = this.getBalanceSheet();
    return bs.isBalanced;
  }

  /**
   * Get net income
   */
  getNetIncome(): number {
    const is = this.getIncomeStatement();
    return is.netIncome;
  }

  /**
   * Get gross profit (Sales Revenue - Cost of Goods Sold)
   */
  getGrossProfit(): number {
    const salesRevenue = this.getAccountBalance(AccountCategory.SALES_REVENUE);
    const cogs = this.getAccountBalance(AccountCategory.COST_OF_GOODS_SOLD);
    return salesRevenue - cogs;
  }
}

interface ProcessResult {
  success: boolean;
  error?: string;
  entry: JournalEntry | null;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}
