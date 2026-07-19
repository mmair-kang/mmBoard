'use client'
// 수정: Auto — 2026-07-19 14:30 (날씨 삭제·달력 추가)
// 수정: Auto — 2026-07-13 23:43 (자산 탭)
// 수정: Auto — 2026-07-12 23:36 (카드탭 2depth)
// 수정: Auto — 2026-07-12 23:17 (상단 탭 바 높이·폰트 조정)
// 수정: Auto — 2026-06-15 (PC 그리드·반응형)

import { AccountWidget } from '@/components/home/AccountWidget'
import { AssetWidget } from '@/components/home/AssetWidget'
import { InvestmentWidget } from '@/components/home/InvestmentWidget'
import { AnnualPaymentWidget } from '@/components/home/AnnualPaymentWidget'
import { CalendarWidget } from '@/components/home/CalendarWidget'
import { DdayWidget } from '@/components/home/DdayWidget'
import { TodoWidget } from '@/components/home/TodoWidget'
import { DividendWidget } from '@/components/home/DividendWidget'
import { CardTabContent } from '@/components/home/CardTabContent'
import { ManageTabOrderDialog } from '@/components/home/ManageTabOrderDialog'
import { MonthlyExpenseWidget } from '@/components/home/MonthlyExpenseWidget'
import { useManageTabOrder } from '@/hooks/useManageTabOrder'
import { useLongPress } from '@/hooks/useLongPress'
import type { ManageTabId } from '@/lib/manageTabOrder'
// 수정: Auto — 2026-06-15 (메인탭 PC 레이아웃)

import { sxMainTabLayout, sxMainTabTopRow, sxPageScrollBody } from '@/config/responsiveLayout'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useEffect, useState } from 'react'

function renderTabPanel(tab: ManageTabId) {
  switch (tab) {
    case 'investment':
      return <InvestmentWidget />
    case 'asset':
      return <AssetWidget />
    case 'main':
      return (
        <Box sx={sxMainTabLayout}>
          <CalendarWidget />
          <Box sx={sxMainTabTopRow}>
            <TodoWidget />
            <DdayWidget />
          </Box>
        </Box>
      )
    case 'account':
      return <AccountWidget />
    case 'annual':
      return <AnnualPaymentWidget />
    case 'card':
      return <CardTabContent />
    case 'dividend':
      return <DividendWidget />
    case 'monthly':
      return <MonthlyExpenseWidget />
    default:
      return null
  }
}

export function HomePageContent() {
  const { tabs, order, ready, updateOrder } = useManageTabOrder()
  const [tab, setTab] = useState<ManageTabId>('main')
  const [orderOpen, setOrderOpen] = useState(false)

  const {
    pointerHandlers: tabBarLongPress,
    wasTriggered,
    reset: resetLongPress,
  } = useLongPress({
    onLongPress: () => setOrderOpen(true),
  })

  useEffect(() => {
    if (!ready) return
    if (!order.includes(tab)) {
      setTab(order[0] ?? 'main')
    }
  }, [ready, order, tab])

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box
        {...tabBarLongPress}
        sx={{
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          touchAction: 'pan-x',
          userSelect: 'none',
        }}
      >
        <Tabs
          value={order.includes(tab) ? tab : false}
          onChange={(_, value: ManageTabId) => {
            if (wasTriggered()) {
              resetLongPress()
              return
            }
            setTab(value)
          }}
          variant="fullWidth"
          sx={{
            width: '100%',
            minWidth: 0,
            minHeight: { xs: 34, sm: 36, md: 40 },
            '& .MuiTabs-scroller': { overflow: 'hidden !important' },
            '& .MuiTabs-flexContainer': { width: '100%', minHeight: { xs: 34, sm: 36, md: 40 } },
            '& .MuiTab-root': {
              flex: '1 1 0',
              minWidth: 0,
              maxWidth: 'none',
              fontWeight: 800,
              fontSize: { xs: '0.78rem', sm: '0.88rem', md: '1rem', lg: '1.05rem' },
              minHeight: { xs: 34, sm: 36, md: 40 },
              px: { xs: 0.15, sm: 0.5, md: 1 },
              py: { xs: 0.45, md: 0.5 },
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            },
          }}
        >
          {tabs.map((item) => (
            <Tab key={item.id} value={item.id} label={item.label} />
          ))}
        </Tabs>
      </Box>

      <Box sx={sxPageScrollBody}>
        {renderTabPanel(tab)}
      </Box>

      <ManageTabOrderDialog
        open={orderOpen}
        tabs={tabs}
        onClose={() => setOrderOpen(false)}
        onSave={updateOrder}
      />
    </Box>
  )
}
