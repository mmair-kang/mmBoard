'use client'
// 수정: Auto — 2026-06-08

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
  outflows: AccountOutflow[]
}

async function accountFetcher(): Promise<MainAccount> {
  const res = await fetch(accountSwrKey)
  if (!res.ok) throw new Error('계좌 정보를 불러오지 못했습니다.')
  return res.json() as Promise<MainAccount>
}

export function useAccount() {
  const swr = useSWR<MainAccount>(accountSwrKey, accountFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 3000,
    keepPreviousData: true,
  })

  return {
    account: swr.data,
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  }
}
