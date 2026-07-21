'use client'
// 수정: Auto — 2026-07-21 21:57 (관리계좌)

import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const accountSwrKey = '/api/account' as const

export type ManagedAccountType = 'general' | 'subscription'

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

export interface ManagedAccount {
  id: number
  name: string
  accountType: ManagedAccountType
  balance: number
  balanceUpdatedAt: string | null
  sortOrder: number
  createdAt: string
}

export interface MainAccount {
  id: number
  name: string
  balance: number
  updatedAt: string
  balanceUpdatedAt: string | null
  managedGroupName: string
  managedAccounts: ManagedAccount[]
  outflows: AccountOutflow[]
}

async function accountFetcher(): Promise<MainAccount> {
  const account = await swrJsonFetch<MainAccount>(accountSwrKey, '계좌 정보를 불러오지 못했습니다.')
  return {
    ...account,
    balance: account.balance ?? 0,
    managedGroupName: account.managedGroupName || '관리계좌',
    managedAccounts: (account.managedAccounts ?? []).map((row) => ({
      ...row,
      balance: row.balance ?? 0,
      accountType: row.accountType === 'subscription' ? 'subscription' : 'general',
    })),
    outflows: account.outflows ?? [],
  }
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
