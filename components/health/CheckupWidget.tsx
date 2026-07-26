'use client'
// 수정: Auto — 2026-07-27 01:56

import { CheckupFormDialog } from '@/components/health/CheckupFormDialog'
import { type HealthCheckup, useHealthCheckups } from '@/hooks/useHealthCheckups'
import { readApiErrorMessage } from '@/lib/apiResponse'
import {
  checkupRefStatus,
  formatCheckupDateLabel,
  formatCheckupNumber,
  HEALTH_CHECKUP_REFS,
  sortHealthCheckupsByDateDesc,
  type RefStatus,
} from '@/lib/healthCheckupFormat'
import type { HealthCheckupPayload } from '@/lib/healthCheckupPayload'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'
import { useMemo, useState } from 'react'

function valueColor(theme: Theme, status: RefStatus): string | undefined {
  if (status === 'warn') return theme.palette.error.main
  if (status === 'ok') return theme.palette.success.main
  return undefined
}

function MetricCell({
  label,
  value,
  status = 'unknown',
  unit,
}: {
  label: string
  value: string
  status?: RefStatus
  unit?: string
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 0.75,
        py: 0.55,
        borderRadius: 1.25,
        bgcolor: (theme) =>
          alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.14 : 0.06),
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', lineHeight: 1.2 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '0.92rem',
          lineHeight: 1.25,
          color: (theme) => valueColor(theme, status) ?? 'text.primary',
        }}
      >
        {value}
        {unit && value !== '—' ? (
          <Typography component="span" sx={{ ml: 0.25, fontSize: '0.68rem', fontWeight: 600, color: 'text.secondary' }}>
            {unit}
          </Typography>
        ) : null}
      </Typography>
    </Box>
  )
}

function CheckupCard({ item, onClick }: { item: HealthCheckup; onClick: () => void }) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'divider',
        cursor: 'pointer',
        bgcolor: (theme) =>
          alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.1 : 0.03),
        '&:active': {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.1,
          py: 0.65,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) =>
            alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.16 : 0.07),
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>
          {formatCheckupDateLabel(item.checkupDate)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          {item.age != null ? `${item.age}세` : '나이 —'}
        </Typography>
      </Stack>

      <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.55 }}>
        <MetricCell label="키" value={formatCheckupNumber(item.heightCm)} unit="cm" />
        <MetricCell label="체중" value={formatCheckupNumber(item.weightKg)} unit="kg" />
        <MetricCell label="BMI" value={formatCheckupNumber(item.bmi)} />
        <MetricCell label="허리" value={formatCheckupNumber(item.waistCm)} unit="cm" />
        <MetricCell label="시력 좌" value={formatCheckupNumber(item.visionLeft)} />
        <MetricCell label="시력 우" value={formatCheckupNumber(item.visionRight)} />
        <MetricCell
          label="혈압"
          value={
            item.bpSystolic != null || item.bpDiastolic != null
              ? `${formatCheckupNumber(item.bpSystolic)}/${formatCheckupNumber(item.bpDiastolic)}`
              : '—'
          }
        />
        <MetricCell
          label="공복혈당"
          value={formatCheckupNumber(item.fastingGlucose, 0)}
          status={checkupRefStatus('fastingGlucose', item.fastingGlucose)}
        />
        <MetricCell
          label="총콜"
          value={formatCheckupNumber(item.totalCholesterol, 0)}
          status={checkupRefStatus('totalCholesterol', item.totalCholesterol)}
        />
        <MetricCell
          label="HDL"
          value={formatCheckupNumber(item.hdl, 0)}
          status={checkupRefStatus('hdl', item.hdl)}
        />
        <MetricCell
          label="중성지방"
          value={formatCheckupNumber(item.triglycerides, 0)}
          status={checkupRefStatus('triglycerides', item.triglycerides)}
        />
        <MetricCell
          label="LDL"
          value={formatCheckupNumber(item.ldl, 0)}
          status={checkupRefStatus('ldl', item.ldl)}
        />
      </Box>
    </Paper>
  )
}

export function CheckupWidget() {
  const { items, isLoading, mutate } = useHealthCheckups()
  const sortedItems = useMemo(() => sortHealthCheckupsByDateDesc(items), [items])
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<HealthCheckup | null>(null)

  const openAdd = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: HealthCheckup) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: HealthCheckupPayload) => {
    const res = await fetch('/api/health-checkups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const created = (await res.json()) as HealthCheckup
    await mutate((prev) => sortHealthCheckupsByDateDesc([created, ...(prev ?? [])]), {
      revalidate: false,
    })
  }

  const handleUpdate = async (payload: HealthCheckupPayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/health-checkups/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as HealthCheckup
    await mutate(
      (prev) =>
        sortHealthCheckupsByDateDesc(
          (prev ?? []).map((row) => (row.id === updated.id ? updated : row)),
        ),
      { revalidate: false },
    )
  }

  const handleDelete = async () => {
    if (!editingItem) return
    const id = editingItem.id
    await mutate((prev) => (prev ?? []).filter((row) => row.id !== id), { revalidate: false })
    await fetch(`/api/health-checkups/${id}`, { method: 'DELETE' })
  }

  return (
    <>
      <Stack spacing={1} sx={{ maxWidth: { md: 720 }, mx: { md: 'auto' }, width: '100%' }}>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            borderColor: 'divider',
            bgcolor: (theme) =>
              alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.1 : 0.03),
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 1.1,
              py: 0.55,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: (theme) =>
                alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.16 : 0.07),
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>검진 기록</Typography>
            <Tooltip title="검진 추가">
              <IconButton size="small" color="primary" onClick={openAdd} aria-label="검진 추가">
                <AddRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Box sx={{ px: 1.1, py: 0.85 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              정상 라인 · 공복혈당 {HEALTH_CHECKUP_REFS.fastingGlucose.label} · 총콜{' '}
              {HEALTH_CHECKUP_REFS.totalCholesterol.label} · HDL {HEALTH_CHECKUP_REFS.hdl.label} ·
              중성지방 {HEALTH_CHECKUP_REFS.triglycerides.label} · LDL {HEALTH_CHECKUP_REFS.ldl.label}
            </Typography>
          </Box>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : sortedItems.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 2,
              py: 3.5,
              textAlign: 'center',
              borderColor: 'divider',
            }}
          >
            <Typography color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
              검진 기록이 없습니다
            </Typography>
            <Typography variant="caption" color="text.secondary">
              오른쪽 위 + 버튼으로 추가해 주세요
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1}>
            {sortedItems.map((item) => (
              <CheckupCard key={item.id} item={item} onClick={() => openEdit(item)} />
            ))}
          </Stack>
        )}
      </Stack>

      <CheckupFormDialog
        open={formOpen}
        item={editingItem}
        onClose={closeForm}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        onDelete={editingItem ? handleDelete : undefined}
      />
    </>
  )
}
