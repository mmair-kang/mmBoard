import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  throw new Error('TURSO_DATABASE_URL, TURSO_AUTH_TOKEN 환경변수가 필요합니다.')
}

const client = createClient({ url, authToken })
export const db = drizzle(client)
