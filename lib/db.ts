// 수정: Auto — 2026-06-05 (lazy init — 빌드 시 env 없어도 import 가능)

import { createClient, type Client } from '@libsql/client'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'

let client: Client | undefined
let dbInstance: LibSQLDatabase | undefined

export function getDbClient(): Client {
  if (client) return client
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL, TURSO_AUTH_TOKEN 환경변수가 필요합니다.')
  }
  client = createClient({ url, authToken })
  return client
}

function getDbInstance(): LibSQLDatabase {
  if (!dbInstance) dbInstance = drizzle(getDbClient())
  return dbInstance
}

/** 첫 DB 접근 시에만 Turso 연결 — Vercel 빌드·로컬 import 안전 */
export const db = new Proxy({} as LibSQLDatabase, {
  get(_target, prop) {
    const instance = getDbInstance()
    const value = Reflect.get(instance as object, prop, instance)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
