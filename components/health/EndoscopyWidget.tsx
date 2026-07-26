'use client'
// 수정: Auto — 2026-07-27 02:39 (금액 여러 건 표시)
// 수정: Auto — 2026-07-27 02:19 (라벨 왼쪽·내용 오른쪽)
// 수정: Auto — 2026-07-27 02:17 (검사항목·결과·권고사항 분리 표시)
// 수정: Auto — 2026-07-27 02:09

import { EndoscopyFormDialog } from '@/components/health/EndoscopyFormDialog'
import {
  endoscopyRecordCosts,
  type EndoscopyRecord,
  useEndoscopyRecords,
} from '@/hooks/useEndoscopyRecords'
import { readApiErrorMessage } from '@/lib/apiResponse'
import { formatWon } from '@/lib/annualPaymentCalc'
import type { EndoscopyRecordPayload } from '@/lib/endoscopyPayload'
import { sumEndoscopyCostItems } from '@/lib/endoscopyPayload'
import { ENDOSCOPY_SCOPE_LABELS, type HealthExamScopeId } from '@/lib/endoscopyTypes'
import { formatCheckupDateLabel } from '@/lib/healthCheckupFormat'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'

function RecordCard({ item, onClick }: { item: EndoscopyRecord; onClick: () => void }) {
  const costs = endoscopyRecordCosts(item)
  const total = sumEndoscopyCostItems(costs)

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
          py: 0.6,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: (theme) =>
            alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.16 : 0.07),
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: '0.95rem' }}>
          {formatCheckupDateLabel(item.examDate)}
        </Typography>
        {total > 0 ? (
          <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: 'primary.main' }}>
            {formatWon(total)}
          </Typography>
        ) : null}
      </Stack>
      <Stack spacing={0.65} sx={{ px: 1.1, py: 0.9 }}>
        <RecordField label="검사항목" value={item.examItem} />
        <RecordField label="결과" value={item.result || item.content} />
        {item.recommendation ? (
          <RecordField label="권고사항" value={item.recommendation} />
        ) : null}
        {costs.length > 0 ? (
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <Typography
              color="text.secondary"
              sx={{
                flexShrink: 0,
                width: 56,
                pt: 0.1,
                fontWeight: 800,
                fontSize: '0.78rem',
                lineHeight: 1.45,
              }}
            >
              금액
            </Typography>
            <Stack spacing={0.2} sx={{ flex: 1, minWidth: 0 }}>
              {costs.map((row, index) => (
                <Stack
                  key={`${row.label}-${index}`}
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      lineHeight: 1.55,
                      wordBreak: 'break-word',
                    }}
                  >
                    {row.label}
                  </Typography>
                  <Typography
                    sx={{
                      flexShrink: 0,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      lineHeight: 1.55,
                    }}
                  >
                    {formatWon(row.amount)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  )
}

function RecordField({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1}>
      <Typography
        color="text.secondary"
        sx={{
          flexShrink: 0,
          width: 56,
          pt: 0.1,
          fontWeight: 800,
          fontSize: '0.78rem',
          lineHeight: 1.45,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: '0.85rem',
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {value || '—'}
      </Typography>
    </Stack>
  )
}

export function EndoscopyWidget({ scope }: { scope: HealthExamScopeId }) {
  const { items, isLoading, mutate, sortByDateDesc } = useEndoscopyRecords(scope)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<EndoscopyRecord | null>(null)

  const openAdd = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEdit = (item: EndoscopyRecord) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleAdd = async (payload: EndoscopyRecordPayload) => {
    const res = await fetch('/api/endoscopy-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '추가에 실패했습니다'))
    const created = (await res.json()) as EndoscopyRecord
    await mutate((prev) => sortByDateDesc([created, ...(prev ?? [])]), { revalidate: false })
  }

  const handleUpdate = async (payload: EndoscopyRecordPayload) => {
    if (!editingItem) return
    const res = await fetch(`/api/endoscopy-records/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readApiErrorMessage(res, '수정에 실패했습니다'))
    const updated = (await res.json()) as EndoscopyRecord
    await mutate(
      (prev) => sortByDateDesc((prev ?? []).map((row) => (row.id === updated.id ? updated : row))),
      { revalidate: false },
    )
  }

  const handleDelete = async () => {
    if (!editingItem) return
    const id = editingItem.id
    await mutate((prev) => (prev ?? []).filter((row) => row.id !== id), { revalidate: false })
    await fetch(`/api/endoscopy-records/${id}`, { method: 'DELETE' })
  }

  const scopeLabel = ENDOSCOPY_SCOPE_LABELS[scope]

  return (
    <>
      <Stack spacing={1}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 0.35 }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: '0.92rem' }}>{scopeLabel} 기록</Typography>
          <Tooltip title={`${scopeLabel} 추가`}>
            <IconButton size="small" color="primary" onClick={openAdd} aria-label={`${scopeLabel} 추가`}>
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : items.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, px: 2, py: 3.5, textAlign: 'center', borderColor: 'divider' }}
          >
            <Typography color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
              {scopeLabel} 기록이 없습니다
            </Typography>
            <Typography variant="caption" color="text.secondary">
              오른쪽 위 + 버튼으로 추가해 주세요
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1}>
            {items.map((item) => (
              <RecordCard key={item.id} item={item} onClick={() => openEdit(item)} />
            ))}
          </Stack>
        )}
      </Stack>

      <EndoscopyFormDialog
        open={formOpen}
        scope={scope}
        item={editingItem}
        onClose={closeForm}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        onDelete={editingItem ? handleDelete : undefined}
      />
    </>
  )
}
