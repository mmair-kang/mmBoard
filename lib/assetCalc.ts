// 수정: Auto — 2026-07-21 22:00 (관리계좌 합산)

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

export type ManagedAccountBalanceItem = {
  id: number
  name: string
  balanceKrw: number
}

export type AccountBalancesInput = {
  miraeAssetBalanceKrw: number
  miraeAssetName: string
  managedAccounts: ManagedAccountBalanceItem[]
}

export type AssetBreakdown = AssetManualSettings & {
  domesticStocksKrw: number
  overseasDividendKrw: number
  pensionKrw: number
  miraeAssetBalanceKrw: number
  miraeAssetName: string
  managedAccounts: ManagedAccountBalanceItem[]
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
  const managedAccounts = accountBalances.managedAccounts
  const managedTotalKrw = managedAccounts.reduce((sum, row) => sum + row.balanceKrw, 0)
  const accountBalanceKrw = miraeAssetBalanceKrw + managedTotalKrw

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
    miraeAssetName: accountBalances.miraeAssetName,
    managedAccounts,
    accountBalanceKrw,
    grossAssetsKrw,
    netAssetsKrw,
  }
}
