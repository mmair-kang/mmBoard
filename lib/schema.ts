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

export const collectionItems = sqliteTable('collection_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mainCategory: text('main_category').notNull(),
  subCategory: text('sub_category').notNull(),
  brand: text('brand').notNull().default(''),
  name: text('name').notNull(),
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
