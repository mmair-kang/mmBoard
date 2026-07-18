import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const shoppingItems = sqliteTable('shopping_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  brand: text('brand').notNull().default(''),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  amount: real('amount').notNull(),
  amountUnit: text('amount_unit').notNull(),
  /** piece=낱개, box=박스 */
  packType: text('pack_type').notNull().default('piece'),
  packCount: integer('pack_count').notNull().default(1),
  /** 박스 1개에 들어 있는 낱개 수 (packType=box일 때) */
  unitsPerPack: integer('units_per_pack').notNull().default(1),
  storeKey: text('store_key').notNull(),
  storeCustom: text('store_custom'),
  lastPurchaseDate: text('last_purchase_date'),
  /** data:image/jpeg;base64,... */
  imageData: text('image_data'),
  createdAt: text('created_at').notNull(),
})

/** food 상시/수시 — 항목(체다치즈) 단위 */
export const collectionProducts = sqliteTable('collection_products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  mainCategory: text('main_category').notNull(),
  subCategory: text('sub_category').notNull(),
  foodScope: text('food_scope').notNull().default('regular'),
  /** JSON — 목록 칩 표시 on/off */
  listChipFlags: text('list_chip_flags').notNull().default('{"amount":true,"unitsPerPack":true,"unitPrice":true,"perPiece":true}'),
  createdAt: text('created_at').notNull(),
})

export const collectionItems = sqliteTable('collection_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mainCategory: text('main_category').notNull(),
  subCategory: text('sub_category').notNull(),
  brand: text('brand').notNull().default(''),
  name: text('name').notNull(),
  nameSuffix: text('name_suffix').notNull().default(''),
  model: text('model').notNull().default(''),
  size: text('size').notNull().default(''),
  description: text('description').notNull().default(''),
  purchasePrice: integer('purchase_price').notNull(),
  storeKey: text('store_key').notNull(),
  storeCustom: text('store_custom'),
  purchaseDate: text('purchase_date').notNull(),
  /** 푸드 카테고리용 */
  amount: real('amount').notNull().default(0),
  amountUnit: text('amount_unit').notNull().default('g'),
  packType: text('pack_type').notNull().default('piece'),
  packCount: integer('pack_count').notNull().default(1),
  unitsPerPack: integer('units_per_pack').notNull().default(1),
  /** none | top | bottom */
  optionType: text('option_type').notNull().default('none'),
  /** JSON — 상의/하의 치수 */
  optionData: text('option_data').notNull().default('{}'),
  imageData: text('image_data'),
  /** 생활(food) — 재구매 주기(일) */
  repurchaseDays: integer('repurchase_days'),
  /** 생활(food) — 재구매중(한달 생활비 합계 포함) */
  repurchaseActive: integer('repurchase_active').notNull().default(0),
  /** food — 상시(regular) / 수시(occasional) */
  foodScope: text('food_scope').notNull().default('regular'),
  /** 목록에서 숨김 */
  hidden: integer('hidden').notNull().default(0),
  /** food 항목(product) FK — 소장은 null */
  productId: integer('product_id'),
  /** 같은 product 안에서 선택된 변형 1개 */
  isSelected: integer('is_selected').notNull().default(1),
  createdAt: text('created_at').notNull(),
})

export const ddayItems = sqliteTable('dday_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  lastVisitDate: text('last_visit_date').notNull(),
  intervalValue: integer('interval_value').notNull(),
  intervalUnit: text('interval_unit').notNull(),
  createdAt: text('created_at').notNull(),
})

export const todoItems = sqliteTable('todo_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  dueDate: text('due_date'),
  dueTime: text('due_time'),
  createdAt: text('created_at').notNull(),
})

export const monthlyTaskItems = sqliteTable('monthly_task_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  /** 1–31, null = 이번 달 안에 */
  dayOfMonth: integer('day_of_month'),
  /** card_target | card_benefit | switch */
  optionType: text('option_type').notNull(),
  targetAmount: integer('target_amount'),
  currentAmount: integer('current_amount').notNull().default(0),
  currentAmountUpdatedAt: text('current_amount_updated_at'),
  switchOn: integer('switch_on').notNull().default(0),
  /** YYYY-MM — 진행 상태가 속한 달 */
  progressMonth: text('progress_month').notNull(),
  createdAt: text('created_at').notNull(),
})

export const mainAccounts = sqliteTable('main_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  balance: integer('balance').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
  balanceUpdatedAt: text('balance_updated_at'),
  seongnamLoveBalance: integer('seongnam_love_balance').notNull().default(0),
  seongnamLoveBalanceUpdatedAt: text('seongnam_love_balance_updated_at'),
})

export const accountOutflows = sqliteTable('account_outflows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id').notNull(),
  /** 0 = 수시, 1–30·31(말일) */
  dayOfMonth: integer('day_of_month').notNull(),
  title: text('title').notNull(),
  amount: integer('amount').notNull(),
  switchOn: integer('switch_on').notNull().default(0),
  progressMonth: text('progress_month').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
})

export const annualPayments = sqliteTable('annual_payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  /** 1–12 */
  month: integer('month').notNull(),
  /** null = 해당 월만, 1–30·31(말일) */
  dayOfMonth: integer('day_of_month'),
  amount: integer('amount').notNull(),
  switchOn: integer('switch_on').notNull().default(0),
  /** YYYY */
  progressYear: text('progress_year').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
})

export const dividendHoldings = sqliteTable('dividend_holdings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticker: text('ticker').notNull(),
  /** overseas | domestic */
  market: text('market').notNull().default('overseas'),
  /** Yahoo/KRX 시세 조회용 (예: JEPQ, 498400) */
  quoteSymbol: text('quote_symbol').notNull().default(''),
  defaultShares: integer('default_shares').notNull().default(0),
  perShareDividendUsd: real('per_share_dividend_usd').notNull().default(0),
  perShareDividendKrw: real('per_share_dividend_krw').notNull().default(0),
  /** 국내 ETF 주당 과세표준액 (원) — KODEX 등 */
  perShareTaxBaseKrw: real('per_share_tax_base_krw').notNull().default(0),
  referencePriceUsd: real('reference_price_usd').notNull().default(0),
  referencePriceKrw: real('reference_price_krw').notNull().default(0),
  referenceExchangeRate: real('reference_exchange_rate').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const dividendMonths = sqliteTable('dividend_months', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  yearMonth: text('year_month').notNull(),
  createdAt: text('created_at').notNull(),
})

export const dividendEntries = sqliteTable('dividend_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  monthId: integer('month_id').notNull(),
  dayOfMonth: integer('day_of_month').notNull(),
  ticker: text('ticker').notNull(),
  shares: integer('shares').notNull().default(0),
  exchangeRate: real('exchange_rate').notNull(),
  foreignSettlement: real('foreign_settlement').notNull(),
  foreignTax: real('foreign_tax').notNull(),
  /** 국내 ETF 주당 과세표준액 (원) */
  perShareTaxBaseKrw: real('per_share_tax_base_krw').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const monthlyFixedExpenses = sqliteTable('monthly_fixed_expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  /** 0 = 수시, 1–30·31(말일) */
  dayOfMonth: integer('day_of_month').notNull(),
  amount: integer('amount').notNull(),
  /** card | cash */
  payType: text('pay_type').notNull(),
  /** none | telecom | nationalPension | healthInsurance | insurance */
  expenseType: text('expense_type').notNull().default('none'),
  /** JSON — 타입별 상세 내역 (통신비·국민연금·건강보험) */
  telecomDetail: text('telecom_detail'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
})

export const investmentAccountCash = sqliteTable('investment_account_cash', {
  category: text('category').primaryKey(),
  cashBalance: integer('cash_balance').notNull().default(0),
  cashBalanceUpdatedAt: text('cash_balance_updated_at'),
})

export const investmentHoldings = sqliteTable('investment_holdings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  market: text('market').notNull(),
  purchasePrice: integer('purchase_price').notNull(),
  shares: integer('shares').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
})

export const monthlyTaskCardExtras = sqliteTable('monthly_task_card_extras', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').notNull(),
  /** scheduled = 결제예정(체크박스), payment_switch = 결제 스위치 */
  extraType: text('extra_type').notNull(),
  title: text('title'),
  /** 0 = 수시, 1–30·31(말일) */
  dayOfMonth: integer('day_of_month').notNull(),
  amount: integer('amount').notNull(),
  checked: integer('checked').notNull().default(0),
  switchOn: integer('switch_on').notNull().default(0),
  progressMonth: text('progress_month').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
})

export const cardApplications = sqliteTable('card_applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** naverpay | toss */
  platform: text('platform').notNull(),
  cardCompany: text('card_company').notNull().default(''),
  cardName: text('card_name').notNull().default(''),
  applicationBlocked: integer('application_blocked').notNull().default(0),
  /** benefit_received | in_use — 신청불가 사유 */
  blockedReason: text('blocked_reason'),
  blockedConfirmedDate: text('blocked_confirmed_date'),
  annualFee: integer('annual_fee').notNull().default(0),
  spendAmount: integer('spend_amount').notNull().default(0),
  benefitAmount: integer('benefit_amount').notNull().default(0),
  usageStartDate: text('usage_start_date'),
  usageEndDate: text('usage_end_date'),
  benefitDate: text('benefit_date'),
  /** 혜택 수령 후 탈회 금지기간 — ISO 또는 자유 텍스트 */
  withdrawalRestrictPeriod: text('withdrawal_restrict_period'),
  cancelDate: text('cancel_date'),
  createdAt: text('created_at').notNull(),
})
