# The Accounting Quest

A visual novel-style educational game that teaches accounting fundamentals through running a lemonade stand. Built with Phaser 3 and TypeScript.

> Inspired by **"The Accounting Game: Basic Accounting Fresh from the Lemonade Stand"** by Darrell Mullis & Judith Orloff.

## Overview

Players learn accounting concepts progressively across three difficulty levels (32 chapters total):
- **Level 1 (Lemonade Stand, Ch.1-10)**: Foundation - accounting equation, double-entry bookkeeping, balance sheet, income statement
- **Level 2 (Lemonade Corporation, Ch.101-112)**: Intermediate - multi-level account structures, corporate accounting, consolidation prep
- **Level 3 (Lemonade Group, Ch.201-210)**: Advanced - manufacturing accounting, consolidation, cash flow, group management

Every transaction is recorded using double-entry bookkeeping, and players can view Balance Sheet, Income Statement, and Cash Flow Statement in real time.

## Chapter Learning Content

### Chapter 1: Balance Sheet Foundations
- The accounting equation: Assets = Liabilities + Equity
- Double-entry bookkeeping (Debit = Credit)
- Initial investment (Cash / Owner's Capital)
- Buying supplies (asset swap: Cash to Inventory)
- First sale and Cost of Goods Sold (COGS)
- Introduction to the Income Statement (P&L)

### Chapter 2: Profit & Cash Flow
- Income Statement structure: Revenue - Expenses = Net Income
- Sales Revenue account and its role on the P&L
- Cost of Goods Sold as an expense
- Gross Profit = Revenue - COGS
- Operating expenses (Rent Expense)
- Net Income = Gross Profit - Operating Expenses
- Profit vs Cash distinction

### Chapter 3: Borrowing & Credit
- Loans Payable (bank borrowing): Cash(+) / Loans Payable(+)
- Accounts Payable (credit purchases): Inventory(+) / AP(+)
- Paying off Accounts Payable: AP(-) / Cash(-)
- Loan repayment with interest: Loans(-) + Interest Expense / Cash(-)
- Interest is an expense; principal repayment is not
- P&L impact of interest expense

### Chapter 4: Advanced Revenue Recognition
- Accrual accounting: revenue recognized at delivery, not cash receipt
- Accounts Receivable (credit sales): AR(+) / Revenue(+)
- Collecting receivables: Cash(+) / AR(-) (asset swap, not new revenue)
- Bad Debt Expense: Bad Debt Exp(+) / AR(-)
- Credit sales carry risk

### Chapter 5: Service Businesses
- Service Revenue vs Sales Revenue
- No COGS for service businesses
- Wages Expense as the primary cost of services
- Unearned Revenue: Cash(+) / Unearned Rev(liability)(+)
- Revenue recognition: transfer from unearned when service is delivered

### Chapter 6: Inventory Valuation Methods
- Same goods can have different purchase costs over time
- FIFO (First-In, First-Out): older costs expensed first, higher profit when prices rise
- LIFO (Last-In, First-Out): newer costs expensed first, lower profit when prices rise
- Inventory valuation affects both P&L (COGS) and BS (Inventory)
- FIFO is standard in Japan; LIFO is permitted in the US

### Chapter 7: Fixed Assets & Depreciation
- Equipment as a long-term asset (capital expenditure)
- Depreciation: allocating equipment cost over useful life
- Depreciation Expense (P&L) and Accumulated Depreciation (BS contra-asset)
- Book Value = Cost - Accumulated Depreciation
- Capital expenditure vs revenue expenditure

### Chapter 8: Profits vs Cash Flow
- Prepaid Expenses: cash paid now, expense recognized later
- Accrual timing: cash movements and profit recognition differ
- Cases where profit exists but cash is low (credit sales, inventory, equipment)
- Cases where cash increases but not profit (borrowing, advance payments, AR collection)
- Three categories of cash flow: Operating, Investing, Financing

### Chapter 9: Taxes & Liquidation
- Tax Expense on the P&L
- Pre-tax Profit - Tax = After-tax Profit (Net Income)
- P&L Net Income flows to BS Retained Earnings
- Liquidation: Assets - Liabilities = Equity (owner's share)
- Connection between P&L and BS through Net Income

### Chapter 10: Final Analysis & Ratios
- Review of all 9 previous chapters
- Profit Margin: Net Income / Revenue x 100
- Current Ratio: Current Assets / Current Liabilities
- Debt Ratio: Total Liabilities / Total Assets
- Return on Assets (ROA): Net Income / Total Assets x 100
- Final quiz (3 questions)
- P&L and BS connection summary

## Level 2: Lemonade Corporation (Ch.101-112)

Moves from sole proprietorship to corporate accounting with more complex accounts and banking operations.

### Key Topics
- **Ch.101**: Multi-account banking (Checking vs Savings accounts)
- **Ch.102-104**: Fixed assets, prepayment, consumption tax accounting
- **Ch.105-107**: Petty cash management, temporary accounts, overdrafts
- **Ch.108-110**: Allowance for doubtful accounts, fixed asset disposal with gains/losses
- **Ch.111**: Share issuance and capital structure
- **Ch.112**: Final BS/P&L review and dividend distribution

### Major Concepts
- Bank account management (multiple accounts)
- Consumption tax (input tax, output tax, net settlement)
- Fixed asset disposal and gain/loss recognition
- Equity structure and shareholder accounts

## Level 3: Lemonade Group (Ch.201-210)

Advances to manufacturing and corporate group accounting with consolidated statements.

### Key Topics
- **Ch.201**: Manufacturing cost structure (materials, labor, overhead)
- **Ch.202-205**: Job order vs process costing, standard costing, variance analysis
- **Ch.206**: Subsidiary acquisition and goodwill recognition
- **Ch.207**: Consolidation entries and intercompany elimination
- **Ch.208**: Shareholder equity, dividend declaration and payment
- **Ch.209-210**: Cash flow statement (operating, investing, financing), group performance

### Major Concepts
- **Manufacturing Accounting**: Work-in-Process, allocation of manufacturing overhead
- **Consolidation**: Goodwill, elimination of intercompany transactions
- **Dividend Policy**: Declaration (Retained Earnings → Dividends Payable), Payment (Cash reduction)
- **Cash Flow Analysis**: Indirect method, three cash flow categories

## Account List

| Account | Japanese | Type | Category | First Appears | Description |
|---------|----------|------|----------|---------------|-------------|
| Cash | 現金 | Asset | Current Asset | Ch.1 | Money on hand |
| Accounts Receivable | 売掛金 | Asset | Current Asset | Ch.4 | Amounts owed by customers |
| Inventory | 棚卸資産 | Asset | Current Asset | Ch.1 | Goods available for sale |
| Prepaid Expenses | 前払費用 | Asset | Current Asset | Ch.8 | Expenses paid in advance |
| Equipment | 備品 | Asset | Fixed Asset | Ch.7 | Long-term tangible assets |
| Accumulated Depreciation | 減価償却累計額 | Contra-Asset | Fixed Asset | Ch.7 | Total depreciation to date |
| Accounts Payable | 買掛金 | Liability | Current | Ch.3 | Amounts owed to suppliers |
| Loans Payable | 借入金 | Liability | Current | Ch.3 | Bank loans to repay |
| Unearned Revenue | 前受収益 | Liability | Current | Ch.5 | Advance payments for undelivered services |
| Owner's Capital | 資本金 | Equity | - | Ch.1 | Owner's initial investment |
| Retained Earnings | 利益剰余金 | Equity | - | Ch.1 | Accumulated profits |
| Sales Revenue | 売上高 | Revenue | - | Ch.1 | Income from selling goods |
| Service Revenue | サービス収益 | Revenue | - | Ch.5 | Income from providing services |
| Cost of Goods Sold | 売上原価 | Expense | COGS | Ch.1 | Cost of inventory sold |
| Wages Expense | 給料 | Expense | Operating | Ch.5 | Employee compensation |
| Rent Expense | 家賃 | Expense | Operating | Ch.2 | Cost of rented space |
| Depreciation Expense | 減価償却費 | Expense | Operating | Ch.7 | Periodic equipment cost allocation |
| Interest Expense | 支払利息 | Expense | Non-operating | Ch.3 | Cost of borrowing |
| Bad Debt Expense | 貸倒損失 | Expense | Non-operating | Ch.4 | Uncollectible receivables |

### Level 2 & 3 Additional Accounts

**Banking & Cash Management**
- Checking Account, Savings Account, Petty Cash, Overdraft

**Corporate Equity**
- Dividends Payable, Legal Reserve, Capital Surplus

**Manufacturing & Inventory** (Lv3 only)
- Work-in-Process, Raw Materials, Finished Goods, Manufacturing Overhead

**Investment & Consolidation** (Lv3 only)
- Subsidiary Securities, Goodwill

**Taxes & Regulatory** (Lv2+)
- Consumption Tax Receivable/Payable, Accrued Consumption Tax
- Income Tax Withholding, Accrued Corporate Tax

**Other** (Lv2+)
- Electronically Recorded Payable/Receivable, Temporary Accounts, Allowance for Doubtful Accounts

## Financial Statements

### Balance Sheet (BS / 貸借対照表)
Shows **financial position at a point in time** using T-account format.

```
+-------------------------------+-------------------------------+
|         Assets                |       Liabilities             |
|  Cash                 10,000G |  Accounts Payable      2,000G |
|  Inventory             5,000G |  Loans Payable         3,000G |
|  Equipment             3,000G |                               |
|  - Accum. Depreciation  -500G |       Equity                  |
|                               |  Owner's Capital       8,000G |
|                               |  Retained Earnings     4,500G |
+===============================+===============================+
|  Total               17,500G  |  Total               17,500G  |
+-------------------------------+-------------------------------+
                    Assets = Liabilities + Equity
```

### Income Statement (P&L / 損益計算書)
Shows **business performance over a period** using T-account format.

```
+-------------------------------+-------------------------------+
|        Expenses               |        Revenues               |
|  Cost of Goods Sold    3,000G |  Sales Revenue         8,000G |
|  Rent Expense          1,000G |  Service Revenue       2,000G |
|  Wages Expense         2,000G |                               |
|  Depreciation Expense    500G |                               |
|                               |                               |
|  Net Income            3,500G |                               |
+===============================+===============================+
|  Total               10,000G  |  Total               10,000G  |
+-------------------------------+-------------------------------+
         Expenses + Net Income = Revenues (both sides balance)
```

### Cash Flow Statement (CF / キャッシュフロー計算書) [Lv3]
Shows **actual cash movements** across three categories over a period.

```
Operating Cash Flow (業務活動)    +5,000G
  (Cash from sales, payments, operations)
Investing Cash Flow (投資活動)    -3,000G
  (Equipment purchases, asset disposals)
Financing Cash Flow (財務活動)    +2,000G
  (Borrowing, dividend payments, capital)
─────────────────────────────────
Net Change in Cash                +4,000G
```

### How BS, P&L, and CF Connect
1. **P&L → BS**: Net Income flows to Retained Earnings
2. **BS → CF**: Beginning cash position
3. **CF**: Explains *why* cash changed despite profit/loss
   - High profit but low cash = tied up in receivables/inventory
   - Low profit but high cash = collecting old receivables or borrowing

The three statements together show the complete financial story: profitability (P&L), financial position (BS), and liquidity (CF).

## Key Accounting Concepts

| Concept | Description | Chapter |
|---------|-------------|---------|
| Accounting Equation | Assets = Liabilities + Equity | Ch.1 |
| Double-Entry Bookkeeping | Every transaction has equal debits and credits | Ch.1 |
| Gross Profit | Revenue minus Cost of Goods Sold | Ch.1-2 |
| Net Income | Total Revenue minus Total Expenses | Ch.2 |
| Accrual Accounting | Revenue/expenses recognized when earned/incurred, not when cash moves | Ch.4 |
| Revenue Recognition | Revenue recognized when goods delivered or services performed | Ch.4-5 |
| Matching Principle | Expenses matched to the revenue they help generate | Ch.2, Ch.7 |
| Depreciation | Allocating fixed asset cost over useful life | Ch.7 |
| Capital vs Revenue Expenditure | Long-term assets vs immediate expenses | Ch.7 |
| Cash vs Profit | Cash flow and accounting profit can differ | Ch.8 |
| Inventory Valuation | FIFO/LIFO affect COGS and profit differently | Ch.6 |

### Level 2 & 3 Concepts

| Concept | Description | Chapter |
|---------|-------------|---------|
| Petty Cash Management | Imprest system for small cash transactions | Ch.106 |
| Fixed Asset Disposal | Gain/loss recognition on asset sales | Ch.110 |
| Consumption Tax | Input/output tax accounting and settlement | Ch.104 |
| Dividend Declaration & Payment | Two-step process: declare (reduce RE) then pay (reduce cash) | Ch.208 |
| Manufacturing Cost Accounting | Allocating materials, labor, overhead to WIP | Ch.202 |
| Job Order vs Process Costing | Cost accumulation methods for different production types | Ch.202-205 |
| Goodwill | Premium paid above fair value in acquisition | Ch.206 |
| Consolidation | Combining parent + subsidiary financials, eliminating intercompany | Ch.207 |
| Cash Flow Statement | Reconciling accrual profit to actual cash movement | Ch.209 |
| Group Management | Managing multiple entities as economic unit | Ch.207-210 |

## Controls

| Key / Action | Function |
|-------------|----------|
| Click / Space / Enter | Advance dialog |
| B | Toggle Balance Sheet panel |
| P | Toggle Income Statement (P&L) panel |
| S | Save game |
| Click on BS/PL buttons | Toggle respective panels |

## Development

```bash
cd accounting-game
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run test      # Run tests
npx tsc --noEmit  # Type check
```
