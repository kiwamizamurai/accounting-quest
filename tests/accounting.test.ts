import { describe, it, expect, beforeEach } from 'vitest';
import { AccountingEngine } from '../src/engine/accounting/AccountingEngine';
import { TransactionProcessor } from '../src/engine/accounting/TransactionProcessor';
import { AccountCategory, createAccount, AccountType } from '../src/models/Account';
import { GameDate } from '../src/models/Transaction';

describe('AccountingEngine', () => {
  let accounts: Map<AccountCategory, ReturnType<typeof createAccount>>;
  let journalEntries: ReturnType<typeof import('../src/models/Transaction').createJournalEntry>[];
  let engine: AccountingEngine;
  let processor: TransactionProcessor;
  const testDate: GameDate = { year: 1, month: 1, day: 1 };

  beforeEach(() => {
    accounts = new Map();
    accounts.set(AccountCategory.CASH, createAccount(AccountCategory.CASH, 'Cash', '現金'));
    accounts.set(AccountCategory.INVENTORY, createAccount(AccountCategory.INVENTORY, 'Inventory', '棚卸資産'));
    accounts.set(AccountCategory.ACCOUNTS_RECEIVABLE, createAccount(AccountCategory.ACCOUNTS_RECEIVABLE, 'Accounts Receivable', '売掛金'));
    accounts.set(AccountCategory.EQUIPMENT, createAccount(AccountCategory.EQUIPMENT, 'Equipment', '備品'));
    accounts.set(AccountCategory.ACCOUNTS_PAYABLE, createAccount(AccountCategory.ACCOUNTS_PAYABLE, 'Accounts Payable', '買掛金'));
    accounts.set(AccountCategory.LOANS_PAYABLE, createAccount(AccountCategory.LOANS_PAYABLE, 'Loans Payable', '借入金'));
    accounts.set(AccountCategory.OWNERS_CAPITAL, createAccount(AccountCategory.OWNERS_CAPITAL, "Owner's Capital", '資本金'));
    accounts.set(AccountCategory.SALES_REVENUE, createAccount(AccountCategory.SALES_REVENUE, 'Sales Revenue', '売上高'));
    accounts.set(AccountCategory.COST_OF_GOODS_SOLD, createAccount(AccountCategory.COST_OF_GOODS_SOLD, 'Cost of Goods Sold', '売上原価'));
    accounts.set(AccountCategory.INTEREST_EXPENSE, createAccount(AccountCategory.INTEREST_EXPENSE, 'Interest Expense', '支払利息'));
    accounts.set(AccountCategory.BAD_DEBT_EXPENSE, createAccount(AccountCategory.BAD_DEBT_EXPENSE, 'Bad Debt Expense', '貸倒損失'));

    journalEntries = [];
    engine = new AccountingEngine(accounts, journalEntries);
    processor = new TransactionProcessor(1);
  });

  describe('Double-Entry Bookkeeping', () => {
    it('should validate that debits equal credits', () => {
      const entry = processor.createOwnerInvestment(1000, testDate);
      const validation = engine.validateJournalEntry(entry);

      expect(validation.isValid).toBe(true);
    });

    it('should reject entries where debits do not equal credits', () => {
      const invalidEntry = {
        id: 'test',
        date: testDate,
        description: 'Invalid',
        descriptionJa: '無効',
        lines: [
          { accountCategory: AccountCategory.CASH, debit: 1000, credit: 0 },
          { accountCategory: AccountCategory.OWNERS_CAPITAL, debit: 0, credit: 500 },
        ],
        eventType: 'OWNER_INVESTMENT' as const,
        chapter: 1,
        validated: false,
      };

      const validation = engine.validateJournalEntry(invalidEntry);
      expect(validation.isValid).toBe(false);
    });
  });

  describe('Owner Investment', () => {
    it('should increase Cash and Owner Capital equally', () => {
      const entry = processor.createOwnerInvestment(1000, testDate);
      const result = engine.processJournalEntry(entry);

      expect(result.success).toBe(true);
      expect(engine.getAccountBalance(AccountCategory.CASH)).toBe(1000);
      expect(engine.getAccountBalance(AccountCategory.OWNERS_CAPITAL)).toBe(1000);
    });

    it('should maintain balance sheet equation', () => {
      const entry = processor.createOwnerInvestment(1000, testDate);
      engine.processJournalEntry(entry);

      const bs = engine.getBalanceSheet();
      expect(bs.isBalanced).toBe(true);
      expect(bs.totalAssets).toBe(bs.totalLiabilities + bs.totalEquity);
    });
  });

  describe('Cash Purchase', () => {
    it('should increase Inventory and decrease Cash', () => {
      // First invest capital
      engine.processJournalEntry(processor.createOwnerInvestment(1000, testDate));

      // Then purchase inventory
      const entry = processor.createCashPurchase(200, testDate, 'lemons');
      const result = engine.processJournalEntry(entry);

      expect(result.success).toBe(true);
      expect(engine.getAccountBalance(AccountCategory.CASH)).toBe(800);
      expect(engine.getAccountBalance(AccountCategory.INVENTORY)).toBe(200);
    });
  });

  describe('Cash Sale', () => {
    it('should record revenue and cost of goods sold', () => {
      // Setup: invest and purchase inventory
      engine.processJournalEntry(processor.createOwnerInvestment(1000, testDate));
      engine.processJournalEntry(processor.createCashPurchase(200, testDate, 'lemons'));

      // Make a sale
      const [saleEntry, cogsEntry] = processor.createCashSale(300, 100, testDate);
      engine.processJournalEntry(saleEntry);
      engine.processJournalEntry(cogsEntry);

      expect(engine.getAccountBalance(AccountCategory.CASH)).toBe(1100); // 1000 - 200 + 300
      expect(engine.getAccountBalance(AccountCategory.INVENTORY)).toBe(100); // 200 - 100
      expect(engine.getAccountBalance(AccountCategory.SALES_REVENUE)).toBe(300);
      expect(engine.getAccountBalance(AccountCategory.COST_OF_GOODS_SOLD)).toBe(100);
    });

    it('should calculate gross profit correctly', () => {
      engine.processJournalEntry(processor.createOwnerInvestment(1000, testDate));
      engine.processJournalEntry(processor.createCashPurchase(200, testDate, 'lemons'));

      const [saleEntry, cogsEntry] = processor.createCashSale(300, 100, testDate);
      engine.processJournalEntry(saleEntry);
      engine.processJournalEntry(cogsEntry);

      expect(engine.getGrossProfit()).toBe(200); // 300 - 100
    });
  });

  describe('Borrowing', () => {
    it('should increase Cash and Loans Payable equally', () => {
      const entry = processor.createLoan(500, testDate);
      const result = engine.processJournalEntry(entry);

      expect(result.success).toBe(true);
      expect(engine.getAccountBalance(AccountCategory.CASH)).toBe(500);
      expect(engine.getAccountBalance(AccountCategory.LOANS_PAYABLE)).toBe(500);
    });

    it('should record interest expense on repayment', () => {
      // Take loan
      engine.processJournalEntry(processor.createLoan(500, testDate));

      // Repay with interest
      const repaymentEntry = processor.createLoanRepayment(500, 50, testDate);
      engine.processJournalEntry(repaymentEntry);

      expect(engine.getAccountBalance(AccountCategory.CASH)).toBe(-50); // 500 - 550
      expect(engine.getAccountBalance(AccountCategory.LOANS_PAYABLE)).toBe(0);
      expect(engine.getAccountBalance(AccountCategory.INTEREST_EXPENSE)).toBe(50);
    });
  });

  describe('Credit Transactions', () => {
    it('should handle credit purchase (accounts payable)', () => {
      const entry = processor.createCreditPurchase(300, testDate);
      const result = engine.processJournalEntry(entry);

      expect(result.success).toBe(true);
      expect(engine.getAccountBalance(AccountCategory.INVENTORY)).toBe(300);
      expect(engine.getAccountBalance(AccountCategory.ACCOUNTS_PAYABLE)).toBe(300);
    });

    it('should handle credit sale (accounts receivable)', () => {
      // Setup inventory
      engine.processJournalEntry(processor.createOwnerInvestment(1000, testDate));
      engine.processJournalEntry(processor.createCashPurchase(500, testDate, 'goods'));

      // Credit sale
      const [saleEntry, cogsEntry] = processor.createCreditSale(400, 200, testDate);
      engine.processJournalEntry(saleEntry);
      engine.processJournalEntry(cogsEntry);

      expect(engine.getAccountBalance(AccountCategory.ACCOUNTS_RECEIVABLE)).toBe(400);
      expect(engine.getAccountBalance(AccountCategory.SALES_REVENUE)).toBe(400);
      expect(engine.getAccountBalance(AccountCategory.INVENTORY)).toBe(300); // 500 - 200
    });

    it('should handle bad debt write-off', () => {
      // Setup receivable
      engine.processJournalEntry(processor.createOwnerInvestment(1000, testDate));
      engine.processJournalEntry(processor.createCashPurchase(500, testDate, 'goods'));
      const [saleEntry, cogsEntry] = processor.createCreditSale(400, 200, testDate);
      engine.processJournalEntry(saleEntry);
      engine.processJournalEntry(cogsEntry);

      // Write off bad debt
      const writeOffEntry = processor.createBadDebtWriteOff(100, testDate);
      engine.processJournalEntry(writeOffEntry);

      expect(engine.getAccountBalance(AccountCategory.ACCOUNTS_RECEIVABLE)).toBe(300); // 400 - 100
      expect(engine.getAccountBalance(AccountCategory.BAD_DEBT_EXPENSE)).toBe(100);
    });
  });

  describe('Balance Sheet', () => {
    it('should always maintain Assets = Liabilities + Equity', () => {
      // Multiple transactions
      engine.processJournalEntry(processor.createOwnerInvestment(1000, testDate));
      engine.processJournalEntry(processor.createLoan(500, testDate));
      engine.processJournalEntry(processor.createCashPurchase(300, testDate, 'inventory'));
      engine.processJournalEntry(processor.createCreditPurchase(200, testDate));

      const bs = engine.getBalanceSheet();
      expect(bs.isBalanced).toBe(true);
      expect(bs.totalAssets).toBe(1700); // Cash: 1200 + Inventory: 500
      expect(bs.totalLiabilities).toBe(700); // Loans: 500 + AP: 200
      expect(bs.totalEquity).toBe(1000); // Owner's Capital
    });
  });

  describe('Income Statement', () => {
    it('should calculate net income correctly', () => {
      engine.processJournalEntry(processor.createOwnerInvestment(1000, testDate));
      engine.processJournalEntry(processor.createCashPurchase(400, testDate, 'inventory'));

      // Two sales
      const [sale1, cogs1] = processor.createCashSale(300, 100, testDate);
      engine.processJournalEntry(sale1);
      engine.processJournalEntry(cogs1);

      const [sale2, cogs2] = processor.createCashSale(200, 80, testDate);
      engine.processJournalEntry(sale2);
      engine.processJournalEntry(cogs2);

      const is = engine.getIncomeStatement();
      expect(is.totalRevenue).toBe(500); // 300 + 200
      expect(is.totalExpenses).toBe(180); // 100 + 80
      expect(is.netIncome).toBe(320); // 500 - 180
    });
  });
});
