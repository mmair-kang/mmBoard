// 수정: Auto — 2026-07-18 01:35 (성남사랑 순자산 포함)

import type { InvestmentAccountView } from '@/lib/investmentQuery'

export const DEFAULT_BOGEUMJARI_LOAN_RATE = 2.23
export const DEFAULT_BOGEUMJARI_MONTHLY_PAYMENT = 650_000
export const DEFAULT_BOGEUMJARI_PAYMENT_DAY = 28

export type AssetManualSettings = {
  apartmentValue: number
  apartmentValueUpdatedAt: string | null
  bogeumjariLoan: number
  bogeumjariLoanUpdatedAt: string | null
  bogeumjariLoanRate: number
  bogeumjariMonthlyPayment: number
  bogeumjariPaymentDay: number
}

export type AccountBalancesInput = {
  miraeAssetBalanceKrw: number
  seongnamLoveBalanceKrw: number
}

export type AssetBreakdown = AssetManualSettings & {
  domesticStocksKrw: number
  overseasDividendKrw: number
  pensionKrw: number
  miraeAssetBalanceKrw: number
  seongnamLoveBalanceKrw: number
  accountBalanceKrw: number
}

export type AssetSummary = AssetBreakdown & {
  grossAssetsKrw: number
  netAssetsKrw: number
}

function accountTotalKrw(accounts: InvestmentAccountView[], id: string): number {
  return accounts.find((row) => row.id === id)?.summary.totalCurrentKrw ?? 0
}

export function calcAssetBreakdown(
  accounts: InvestmentAccountView[],
  accountBalances: AccountBalancesInput,
  manual: AssetManualSettings,
): AssetSummary {
  const domesticStocksKrw = accountTotalKrw(accounts, 'nh')
  const overseasDividendKrw = accountTotalKrw(accounts, 'ds')
  const pensionKrw = accountTotalKrw(accounts, 'psf') + accountTotalKrw(accounts, 'irp')
  const miraeAssetBalanceKrw = accountBalances.miraeAssetBalanceKrw
  const seongnamLoveBalanceKrw = accountBalances.seongnamLoveBalanceKrw
  const accountBalanceKrw = miraeAssetBalanceKrw + seongnamLoveBalanceKrw

  const grossAssetsKrw =
    manual.apartmentValue +
    domesticStocksKrw +
    overseasDividendKrw +
    pensionKrw +
    accountBalanceKrw

  const netAssetsKrw = grossAssetsKrw - manual.bogeumjariLoan

  return {
    apartmentValue: manual.apartmentValue,
    apartmentValueUpdatedAt: manual.apartmentValueUpdatedAt,
    bogeumjariLoan: manual.bogeumjariLoan,
    bogeumjariLoanUpdatedAt: manual.bogeumjariLoanUpdatedAt,
    bogeumjariLoanRate: manual.bogeumjariLoanRate,
    bogeumjariMonthlyPayment: manual.bogeumjariMonthlyPayment,
    bogeumjariPaymentDay: manual.bogeumjariPaymentDay,
    domesticStocksKrw,
    overseasDividendKrw,
    pensionKrw,
    miraeAssetBalanceKrw,
    seongnamLoveBalanceKrw,
    accountBalanceKrw,
    grossAssetsKrw,
    netAssetsKrw,
  }
}
