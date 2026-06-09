'use client'
// 수정: Auto — 2026-06-08

import { AccountWidget } from '@/components/home/AccountWidget'
import { AnnualPaymentWidget } from '@/components/home/AnnualPaymentWidget'
import { DdayWidget } from '@/components/home/DdayWidget'
import { DividendWidget } from '@/components/home/DividendWidget'
import { ManageTabOrderDialog } from '@/components/home/ManageTabOrderDialog'
import { MonthlyExpenseWidget } from '@/components/home/MonthlyExpenseWidget'
import { MonthlyTaskWidget } from '@/components/home/MonthlyTaskWidget'
import { useManageTabOrder } from '@/hooks/useManageTabOrder'
import { useLongPress } from '@/hooks/useLongPress'
import type { ManageTabId } from '@/lib/manageTabOrder'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useEffect, useState } from 'react'

function renderTabPanel(tab: ManageTabId) {
  switch (tab) {
    case 'main':
      return <DdayWidget />
    case 'account':
      return <AccountWidget />
    case 'annual':
      return <AnnualPaymentWidget />
    case 'card':
      return <MonthlyTaskWidget />
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
          variant="scrollable"
          scrollButtons={false}
          allowScrollButtonsMobile
          sx={{
            minWidth: 0,
            '& .MuiTabs-scroller': { overflow: 'auto !important' },
            '& .MuiTab-root': {
              fontWeight: 800,
              fontSize: { xs: '0.78rem', sm: '0.85rem' },
              minHeight: 44,
              minWidth: { xs: 56, sm: 72 },
              px: { xs: 1, sm: 1.25 },
              flexShrink: 0,
            },
          }}
        >
          {tabs.map((item) => (
            <Tab key={item.id} value={item.id} label={item.label} />
          ))}
        </Tabs>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          px: { xs: 1, sm: 1.5 },
          py: 1.25,
          pb: 2.5,
        }}
      >
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
