'use client'
// 수정: Auto — 2026-07-14 01:26

import { DEFAULT_BOGEUMJARI_LOAN_RATE, DEFAULT_BOGEUMJARI_MONTHLY_PAYMENT, DEFAULT_BOGEUMJARI_PAYMENT_DAY } from '@/lib/assetCalc'
import type { AssetSettingsData } from '@/lib/assetQuery'
import { swrJsonFetch } from '@/lib/swrFetch'
import useSWR from 'swr'

export const assetSettingsSwrKey = '/api/assets' as const

async function assetSettingsFetcher(): Promise<AssetSettingsData> {
  return swrJsonFetch<AssetSettingsData>(assetSettingsSwrKey, '자산 설정을 불러오지 못했습니다.')
}

export function useAssetSettings() {
  const swr = useSWR<AssetSettingsData>(assetSettingsSwrKey, assetSettingsFetcher)

  return {
    settings: swr.data,
    apartmentValue: swr.data?.apartmentValue ?? 0,
    apartmentValueUpdatedAt: swr.data?.apartmentValueUpdatedAt ?? null,
    bogeumjariLoan: swr.data?.bogeumjariLoan ?? 0,
    bogeumjariLoanUpdatedAt: swr.data?.bogeumjariLoanUpdatedAt ?? null,
    bogeumjariLoanRate: swr.data?.bogeumjariLoanRate ?? DEFAULT_BOGEUMJARI_LOAN_RATE,
    bogeumjariMonthlyPayment: swr.data?.bogeumjariMonthlyPayment ?? DEFAULT_BOGEUMJARI_MONTHLY_PAYMENT,
    bogeumjariPaymentDay: swr.data?.bogeumjariPaymentDay ?? DEFAULT_BOGEUMJARI_PAYMENT_DAY,
    isLoading: swr.isLoading && !swr.data,
    error: swr.error,
    mutate: swr.mutate,
  }
}