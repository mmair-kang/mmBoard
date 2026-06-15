'use client'
// 수정: Auto — 2026-06-15

import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const accountSwrKey = '/api/account' as const

export interface AccountOutflow {
  id: number
  accountId: number
  dayOfMonth: number | null
  title: string
  amount: number
  switchOn: boolean
  progressMonth: string
  sortOrder: number
  createdAt: string
}

export interface MainAccount {
  id: number
  name: string
  balance: number
  updatedAt: string
  balanceUpdatedAt: string | null
  outflows: AccountOutflow[]
}

async function accountFetcher(): Promise<MainAccount> {
  return swrJsonFetch<MainAccount>(accountSwrKey, '계좌 정보를 불러오지 못했습니다.')
}

export function useAccount() {
  const swr = useSWR<MainAccount>(accountSwrKey, accountFetcher)

  return {
    account: swr.data,
    isLoading: swr.isLoading && !swr.data,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
