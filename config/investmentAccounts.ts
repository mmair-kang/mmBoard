// 수정: Auto — 2026-07-15 01:34 (연금 칩 제거)

export const INVESTMENT_ACCOUNT_IDS = ['nh', 'ds', 'psf', 'irp'] as const
export type InvestmentAccountId = (typeof INVESTMENT_ACCOUNT_IDS)[number]

export type InvestmentMarket = 'domestic' | 'overseas' | 'fund'

export type InvestmentAccountMeta = {
  id: InvestmentAccountId
  label: string
  title: string
  subtitle: string
  market: InvestmentMarket
  cashLabel: string
}

export const INVESTMENT_ACCOUNTS: InvestmentAccountMeta[] = [
  {
    id: 'nh',
    label: 'NH',
    title: '국내주식',
    subtitle: '국내 상장',
    market: 'domestic',
    cashLabel: '국내 예수금',
  },
  {
    id: 'ds',
    label: 'DS',
    title: '해외 배당주',
    subtitle: '미국 ETF·주식',
    market: 'overseas',
    cashLabel: '해외 예수금',
  },
  {
    id: 'psf',
    label: 'PSF',
    title: '연금저축펀드',
    subtitle: '연금 수령 예정',
    market: 'fund',
    cashLabel: '펀드 예수금',
  },
  {
    id: 'irp',
    label: 'IRP',
    title: '개인IRP',
    subtitle: '연금 수령 예정',
    market: 'fund',
    cashLabel: 'IRP 예수금',
  },
]

export const INVESTMENT_ACCOUNT_MAP = Object.fromEntries(
  INVESTMENT_ACCOUNTS.map((row) => [row.id, row]),
) as Record<InvestmentAccountId, InvestmentAccountMeta>

export function isInvestmentAccountId(value: string): value is InvestmentAccountId {
  return (INVESTMENT_ACCOUNT_IDS as readonly string[]).includes(value)
}

export function defaultMarketForAccount(accountId: InvestmentAccountId): InvestmentMarket {
  return INVESTMENT_ACCOUNT_MAP[accountId].market
}
