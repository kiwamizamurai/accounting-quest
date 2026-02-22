import { Chapter } from '../models/Chapter';

export type GameLevel = 1 | 2 | 3;

export interface LevelConfig {
  id: GameLevel;
  title: string;
  titleJa: string;
  subtitle: string;
  subtitleJa: string;
  description: string;
  descriptionJa: string;
  chapters: Chapter[];
}

// ===== Lv1: Lemonade Stand (existing 10 chapters) =====
export const LV1_CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: '旅立ちの村',
    subtitle: 'Balance Sheet Foundations',
    description: '主人公は商人見習いとして旅立つ。現金、資産、負債、純資産の基本を学ぶ。',
    concepts: ['Cash', 'Assets', 'Liabilities', "Owner's Equity", '会計等式'],
    mapId: 'village',
    requiredLevel: 1,
    unlocked: true,
  },
  {
    id: 2,
    title: '商売の街',
    subtitle: 'Profit & Cash Flow',
    description: '最初の商売を始める。売上総利益と純利益、損益計算書を理解する。',
    concepts: ['Gross Profit', 'Net Profit', 'Income Statement', '売上原価'],
    mapId: 'market_town',
    requiredLevel: 3,
    unlocked: false,
  },
  {
    id: 3,
    title: '銀行の都市',
    subtitle: 'Borrowing & Credit',
    description: '銀行家との出会い。借入金、買掛金、支払手形を学ぶ。',
    concepts: ['Loans', 'Accounts Payable', 'Notes Payable', '利息'],
    mapId: 'bank_city',
    requiredLevel: 5,
    unlocked: false,
  },
  {
    id: 4,
    title: '大商人の館',
    subtitle: 'Advanced Revenue',
    description: '掛け売りと貸倒れ。労務費、売掛金、発生主義会計を学ぶ。',
    concepts: ['Labor Costs', 'Accounts Receivable', 'Bad Debt', 'Accrual vs Cash'],
    mapId: 'merchant_mansion',
    requiredLevel: 8,
    unlocked: false,
  },
  {
    id: 5,
    title: '職人の街',
    subtitle: 'Service Businesses',
    description: 'サービス業への応用。物を売らずに価値を提供する。',
    concepts: ['サービス収益', '前受金', '未払費用'],
    mapId: 'craftsman_town',
    requiredLevel: 10,
    unlocked: false,
  },
  {
    id: 6,
    title: '倉庫の迷宮',
    subtitle: 'Inventory Methods',
    description: '在庫管理の奥義。先入先出法と後入先出法を習得する。',
    concepts: ['FIFO', 'LIFO', '棚卸資産評価', '売上原価計算'],
    mapId: 'warehouse_dungeon',
    requiredLevel: 12,
    unlocked: false,
  },
  {
    id: 7,
    title: '工場の塔',
    subtitle: 'Fixed Assets',
    description: '固定資産と減価償却。設備投資の真の意味を知る。',
    concepts: ['Depreciation', 'Capitalization', '耐用年数', '残存価額'],
    mapId: 'factory_tower',
    requiredLevel: 15,
    unlocked: false,
  },
  {
    id: 8,
    title: '真実の洞窟',
    subtitle: 'Profits vs Cash',
    description: '利益と現金の違い。キャッシュフロー計算書の秘密を解く。',
    concepts: ['Cash Flow Statement', '営業CF', '投資CF', '財務CF'],
    mapId: 'truth_cave',
    requiredLevel: 18,
    unlocked: false,
  },
  {
    id: 9,
    title: '王国の試練',
    subtitle: 'Taxes & Liquidation',
    description: '税金計算と清算。会計の最終試練に挑む。',
    concepts: ['法人税', '税効果会計', '清算手続き'],
    mapId: 'kingdom_trial',
    requiredLevel: 20,
    unlocked: false,
  },
  {
    id: 10,
    title: '伝説の商人',
    subtitle: 'Final Analysis',
    description: '全ての知識を統合。財務分析と利益改善の極意を会得する。',
    concepts: ['財務諸表分析', 'ROE', '利益率改善', '経営判断'],
    mapId: 'legend_hall',
    requiredLevel: 25,
    unlocked: false,
  },
];

// ===== Lv2: Lemonade Corporation (12 new chapters) =====
export const LV2_CHAPTERS: Chapter[] = [
  {
    id: 101,
    title: '法人設立',
    subtitle: 'Incorporation',
    description: '株式会社を設立し、銀行口座を開設する。',
    concepts: ['普通預金', '当座預金', '資本金(増資)', '差入保証金'],
    mapId: 'lv2_office',
    requiredLevel: 1,
    unlocked: true,
  },
  {
    id: 102,
    title: '店舗開業',
    subtitle: 'Store Opening',
    description: '店舗の賃貸契約、内装工事、備品購入。',
    concepts: ['建物', '車両運搬具', '前払金', '未払金', '広告宣伝費'],
    mapId: 'lv2_store',
    requiredLevel: 3,
    unlocked: false,
  },
  {
    id: 103,
    title: '仕入と経費',
    subtitle: 'Purchasing & Expenses',
    description: '大量仕入れと各種経費の管理。',
    concepts: ['電子記録債権/債務', '発送費', '通信費', '水道光熱費', '消耗品費'],
    mapId: 'lv2_warehouse',
    requiredLevel: 5,
    unlocked: false,
  },
  {
    id: 104,
    title: '消費税',
    subtitle: 'Consumption Tax',
    description: '税込/税抜経理と消費税の処理。',
    concepts: ['仮払消費税', '仮受消費税', '未払消費税', '租税公課'],
    mapId: 'lv2_tax_office',
    requiredLevel: 7,
    unlocked: false,
  },
  {
    id: 105,
    title: '従業員を雇う',
    subtitle: 'Hiring Employees',
    description: '給与計算、源泉徴収、社会保険。',
    concepts: ['所得税預り金', '社会保険料預り金', '法定福利費', '立替金'],
    mapId: 'lv2_hr_office',
    requiredLevel: 9,
    unlocked: false,
  },
  {
    id: 106,
    title: '日々の現金管理',
    subtitle: 'Cash Management',
    description: '小口現金、現金過不足、当座借越。',
    concepts: ['小口現金', '仮払金', '仮受金', '当座借越', '雑益/雑費'],
    mapId: 'lv2_cash_register',
    requiredLevel: 11,
    unlocked: false,
  },
  {
    id: 107,
    title: '多様な売上',
    subtitle: 'Diverse Sales',
    description: 'クレジット売上、商品券、手数料収入。',
    concepts: ['クレジット売掛金', '受取商品券', '受取手数料', '支払手数料'],
    mapId: 'lv2_sales_floor',
    requiredLevel: 13,
    unlocked: false,
  },
  {
    id: 108,
    title: '貸倒引当金',
    subtitle: 'Allowance for Doubtful Accounts',
    description: '売掛金の回収リスク管理、引当金設定。',
    concepts: ['貸倒引当金', '貸倒引当金繰入', '差額補充法'],
    mapId: 'lv2_risk_room',
    requiredLevel: 15,
    unlocked: false,
  },
  {
    id: 109,
    title: '期末の経過勘定',
    subtitle: 'Accruals & Deferrals',
    description: '見越し・繰延べの4パターン。',
    concepts: ['未払費用', '未収収益', '再振替仕訳', 'くまのみみ'],
    mapId: 'lv2_closing_room',
    requiredLevel: 17,
    unlocked: false,
  },
  {
    id: 110,
    title: '固定資産の売却と保険',
    subtitle: 'Asset Disposal & Insurance',
    description: '固定資産の売却損益と保険料の処理。',
    concepts: ['固定資産売却益/損', '保険料', '貯蔵品', '修繕費'],
    mapId: 'lv2_asset_yard',
    requiredLevel: 19,
    unlocked: false,
  },
  {
    id: 111,
    title: '決算整理(総合)',
    subtitle: 'Closing Adjustments',
    description: '精算表の作成と全決算整理仕訳。',
    concepts: ['精算表', 'しーくりくりしー', '月割減価償却', '法人税等'],
    mapId: 'lv2_closing_hall',
    requiredLevel: 21,
    unlocked: false,
  },
  {
    id: 112,
    title: '月次決算と報告',
    subtitle: 'Monthly Closing & Reporting',
    description: '試算表の作成と月次決算フロー。',
    concepts: ['合計/残高試算表', '未払法人税等', '利益準備金'],
    mapId: 'lv2_board_room',
    requiredLevel: 23,
    unlocked: false,
  },
];

// ===== Lv3: Lemonade Group (10 new chapters) =====
export const LV3_CHAPTERS: Chapter[] = [
  {
    id: 201,
    title: 'レモネード工場',
    subtitle: 'Lemonade Factory',
    description: '製造業への進出。原価計算の基礎。',
    concepts: ['材料', '仕掛品', '製品', '製造原価の3要素'],
    mapId: 'lv3_factory',
    requiredLevel: 1,
    unlocked: true,
  },
  {
    id: 202,
    title: '原価を計算する',
    subtitle: 'Cost Accounting',
    description: '個別原価計算と総合原価計算。',
    concepts: ['製造間接費', '配賦', '製造指図書', '製造原価報告書'],
    mapId: 'lv3_cost_center',
    requiredLevel: 4,
    unlocked: false,
  },
  {
    id: 203,
    title: '目標と実績',
    subtitle: 'Standard Costing',
    description: '標準原価計算と差異分析。',
    concepts: ['標準原価', '予算差異', '操業度差異', '能率差異'],
    mapId: 'lv3_control_room',
    requiredLevel: 7,
    unlocked: false,
  },
  {
    id: 204,
    title: '損益分岐点',
    subtitle: 'Break-Even Analysis',
    description: 'CVP分析、変動費と固定費。',
    concepts: ['直接原価計算', '損益分岐点売上高', '安全余裕率'],
    mapId: 'lv3_strategy_room',
    requiredLevel: 10,
    unlocked: false,
  },
  {
    id: 205,
    title: '投資と資金運用',
    subtitle: 'Securities & Investment',
    description: '有価証券の購入・評価・売却。',
    concepts: ['売買目的有価証券', '満期保有目的債券', '時価評価', '評価損益'],
    mapId: 'lv3_trading_floor',
    requiredLevel: 13,
    unlocked: false,
  },
  {
    id: 206,
    title: '子会社を作る',
    subtitle: 'Creating a Subsidiary',
    description: '連結会計の基礎とのれん。',
    concepts: ['子会社株式', 'のれん', 'のれん償却', '資本連結'],
    mapId: 'lv3_subsidiary_office',
    requiredLevel: 16,
    unlocked: false,
  },
  {
    id: 207,
    title: 'グループ経営',
    subtitle: 'Group Management',
    description: '連結財務諸表と内部取引消去。',
    concepts: ['内部取引消去', '連結精算表', '非支配株主持分'],
    mapId: 'lv3_headquarters',
    requiredLevel: 19,
    unlocked: false,
  },
  {
    id: 208,
    title: '株主への報告',
    subtitle: 'Shareholder Reporting',
    description: '株主資本等変動計算書と配当。',
    concepts: ['利益準備金', '資本剰余金', '未払配当金', '株主資本等変動計算書'],
    mapId: 'lv3_shareholder_hall',
    requiredLevel: 22,
    unlocked: false,
  },
  {
    id: 209,
    title: 'お金の流れを追う',
    subtitle: 'Cash Flow Statement',
    description: 'キャッシュフロー計算書の作成(間接法)。',
    concepts: ['営業CF', '投資CF', '財務CF', 'CF計算書の作成'],
    mapId: 'lv3_treasury',
    requiredLevel: 24,
    unlocked: false,
  },
  {
    id: 210,
    title: '総合経営分析',
    subtitle: 'Comprehensive Analysis',
    description: '全レベルの総復習と高度な財務分析。',
    concepts: ['ROE', '自己資本比率', '総資産回転率', 'インタレストカバレッジ'],
    mapId: 'lv3_executive_suite',
    requiredLevel: 27,
    unlocked: false,
  },
];

// ===== Level Configurations =====
export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    id: 1,
    title: 'Lemonade Stand',
    titleJa: 'レモネード屋台',
    subtitle: 'Bookkeeping Basics',
    subtitleJa: '簿記の基礎',
    description: 'Start a lemonade stand and learn the fundamentals of accounting.',
    descriptionJa: '個人でレモネード屋台を始めて、会計の基本を学ぶ。',
    chapters: LV1_CHAPTERS,
  },
  {
    id: 2,
    title: 'Lemonade Corp.',
    titleJa: 'レモネード株式会社',
    subtitle: 'Full Bookkeeping Level 3',
    subtitleJa: '簿記3級完全対応',
    description: 'Incorporate your business, hire employees, and handle taxes.',
    descriptionJa: '法人化して従業員を雇い、消費税や給与計算に挑戦。',
    chapters: LV2_CHAPTERS,
  },
  {
    id: 3,
    title: 'Lemonade Group',
    titleJa: 'レモネードグループ',
    subtitle: 'Bookkeeping Level 2 + Practice',
    subtitleJa: '簿記2級+経理実務',
    description: 'Build a factory, acquire subsidiaries, and manage a group.',
    descriptionJa: '工場を建て、子会社を作り、グループ経営に挑戦。',
    chapters: LV3_CHAPTERS,
  },
];

// Legacy compatibility: all chapters from all levels
export const CHAPTERS: Chapter[] = [...LV1_CHAPTERS, ...LV2_CHAPTERS, ...LV3_CHAPTERS];

export function getChapterById(id: number): Chapter | undefined {
  return CHAPTERS.find((chapter) => chapter.id === id);
}

export function getUnlockedChapters(): Chapter[] {
  return CHAPTERS.filter((chapter) => chapter.unlocked);
}

export function getChaptersForLevel(level: GameLevel): Chapter[] {
  const config = LEVEL_CONFIGS.find(c => c.id === level);
  return config ? config.chapters : [];
}

export function getLevelConfig(level: GameLevel): LevelConfig | undefined {
  return LEVEL_CONFIGS.find(c => c.id === level);
}
