'use client'
// 수정: Auto — 2026-07-27 01:56

import { AppDialog } from '@/components/common/AppDialog'
import { FormDialogFooter } from '@/components/common/FormDialogFooter'
import { FormDialogHeader } from '@/components/common/FormDialogHeader'
import {
  formDialogCompactTextFieldProps,
  formDialogContentScrollSx,
  formDialogContentSx,
  formDialogFieldStackSpacing,
  formDialogFieldStackSx,
  formDialogFormSx,
  formDialogSlotProps,
} from '@/config/formDialogLayout'
import type { HealthCheckup } from '@/hooks/useHealthCheckups'
import { calcBmi } from '@/lib/healthCheckupFormat'
import type { HealthCheckupPayload } from '@/lib/healthCheckupPayload'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

type Props = {
  open: boolean
  item?: HealthCheckup | null
  onClose: () => void
  onSubmit: (payload: HealthCheckupPayload) => Promise<void>
  onDelete?: () => Promise<void>
}

const compactDateFieldSlotProps = {
  textField: {
    ...formDialogCompactTextFieldProps,
    fullWidth: true,
  },
  field: { clearable: false },
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="caption"
      sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.2, mt: 0.5 }}
    >
      {children}
    </Typography>
  )
}

function parseFieldNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, '')
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : Number.NaN
}

function numToInput(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ''
  return String(value)
}

export function CheckupFormDialog({ open, item, onClose, onSubmit, onDelete }: Props) {
  const isEdit = item != null
  const [checkupDate, setCheckupDate] = useState<Dayjs | null>(dayjs())
  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [bmi, setBmi] = useState('')
  const [bmiManual, setBmiManual] = useState(false)
  const [waistCm, setWaistCm] = useState('')
  const [visionLeft, setVisionLeft] = useState('')
  const [visionRight, setVisionRight] = useState('')
  const [bpSystolic, setBpSystolic] = useState('')
  const [bpDiastolic, setBpDiastolic] = useState('')
  const [fastingGlucose, setFastingGlucose] = useState('')
  const [totalCholesterol, setTotalCholesterol] = useState('')
  const [hdl, setHdl] = useState('')
  const [triglycerides, setTriglycerides] = useState('')
  const [ldl, setLdl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setCheckupDate(dayjs())
      setAge('')
      setHeightCm('')
      setWeightKg('')
      setBmi('')
      setBmiManual(false)
      setWaistCm('')
      setVisionLeft('')
      setVisionRight('')
      setBpSystolic('')
      setBpDiastolic('')
      setFastingGlucose('')
      setTotalCholesterol('')
      setHdl('')
      setTriglycerides('')
      setLdl('')
      setSubmitting(false)
      setDeleting(false)
      setFormError(null)
      return
    }
    if (item) {
      setCheckupDate(item.checkupDate ? dayjs(item.checkupDate) : dayjs())
      setAge(numToInput(item.age))
      setHeightCm(numToInput(item.heightCm))
      setWeightKg(numToInput(item.weightKg))
      setBmi(numToInput(item.bmi))
      setBmiManual(item.bmi != null)
      setWaistCm(numToInput(item.waistCm))
      setVisionLeft(numToInput(item.visionLeft))
      setVisionRight(numToInput(item.visionRight))
      setBpSystolic(numToInput(item.bpSystolic))
      setBpDiastolic(numToInput(item.bpDiastolic))
      setFastingGlucose(numToInput(item.fastingGlucose))
      setTotalCholesterol(numToInput(item.totalCholesterol))
      setHdl(numToInput(item.hdl))
      setTriglycerides(numToInput(item.triglycerides))
      setLdl(numToInput(item.ldl))
    } else {
      setCheckupDate(dayjs())
      setAge('')
      setHeightCm('')
      setWeightKg('')
      setBmi('')
      setBmiManual(false)
      setWaistCm('')
      setVisionLeft('')
      setVisionRight('')
      setBpSystolic('')
      setBpDiastolic('')
      setFastingGlucose('')
      setTotalCholesterol('')
      setHdl('')
      setTriglycerides('')
      setLdl('')
    }
  }, [open, item])

  const autoBmi = useMemo(() => {
    const h = parseFieldNumber(heightCm)
    const w = parseFieldNumber(weightKg)
    if (h == null || w == null || Number.isNaN(h) || Number.isNaN(w)) return null
    return calcBmi(h, w)
  }, [heightCm, weightKg])

  useEffect(() => {
    if (!open || bmiManual) return
    if (autoBmi != null) setBmi(String(autoBmi))
    else setBmi('')
  }, [open, bmiManual, autoBmi])

  const canSubmit = checkupDate != null && checkupDate.isValid()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting || !checkupDate) return

    const fields: Array<[string, number | null]> = [
      ['나이', parseFieldNumber(age)],
      ['키', parseFieldNumber(heightCm)],
      ['체중', parseFieldNumber(weightKg)],
      ['체질량', parseFieldNumber(bmi)],
      ['허리둘레', parseFieldNumber(waistCm)],
      ['시력(좌)', parseFieldNumber(visionLeft)],
      ['시력(우)', parseFieldNumber(visionRight)],
      ['최고혈압', parseFieldNumber(bpSystolic)],
      ['최저혈압', parseFieldNumber(bpDiastolic)],
      ['공복혈당', parseFieldNumber(fastingGlucose)],
      ['총 콜레스테롤', parseFieldNumber(totalCholesterol)],
      ['HDL', parseFieldNumber(hdl)],
      ['중성지방', parseFieldNumber(triglycerides)],
      ['LDL', parseFieldNumber(ldl)],
    ]
    for (const [label, value] of fields) {
      if (Number.isNaN(value as number)) {
        setFormError(`${label} 숫자를 확인해 주세요.`)
        return
      }
    }

    const ageN = parseFieldNumber(age)
    const bpSys = parseFieldNumber(bpSystolic)
    const bpDia = parseFieldNumber(bpDiastolic)

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        checkupDate: checkupDate.format('YYYY-MM-DD'),
        age: ageN == null ? null : Math.round(ageN),
        heightCm: parseFieldNumber(heightCm),
        weightKg: parseFieldNumber(weightKg),
        bmi: parseFieldNumber(bmi),
        waistCm: parseFieldNumber(waistCm),
        visionLeft: parseFieldNumber(visionLeft),
        visionRight: parseFieldNumber(visionRight),
        bpSystolic: bpSys == null ? null : Math.round(bpSys),
        bpDiastolic: bpDia == null ? null : Math.round(bpDia),
        fastingGlucose: parseFieldNumber(fastingGlucose),
        totalCholesterol: parseFieldNumber(totalCholesterol),
        hdl: parseFieldNumber(hdl),
        triglycerides: parseFieldNumber(triglycerides),
        ldl: parseFieldNumber(ldl),
      })
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || deleting) return
    setDeleting(true)
    setFormError(null)
    try {
      await onDelete()
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  const field = (label: string, value: string, onChange: (v: string) => void, helper?: string) => (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      inputMode="decimal"
      helperText={helper}
      {...formDialogCompactTextFieldProps}
    />
  )

  return (
    <AppDialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={formDialogSlotProps}>
      <Box component="form" onSubmit={handleSubmit} sx={formDialogFormSx}>
        <FormDialogHeader onClose={onClose}>{isEdit ? '검진 수정' : '검진 추가'}</FormDialogHeader>
        <DialogContent sx={formDialogContentSx}>
          <Box sx={formDialogContentScrollSx}>
            <Stack spacing={formDialogFieldStackSpacing} sx={formDialogFieldStackSx}>
              <DatePicker
                label="검진일"
                value={checkupDate}
                onChange={(v) => setCheckupDate(v)}
                format="YYYY. M. D"
                slotProps={compactDateFieldSlotProps}
              />

              <SectionLabel>신체</SectionLabel>
              <Stack direction="row" spacing={1}>
                {field('나이', age, setAge)}
                {field('키 (cm)', heightCm, (v) => {
                  setHeightCm(v)
                  setBmiManual(false)
                })}
              </Stack>
              <Stack direction="row" spacing={1}>
                {field('체중 (kg)', weightKg, (v) => {
                  setWeightKg(v)
                  setBmiManual(false)
                })}
                {field('체질량 (BMI)', bmi, (v) => {
                  setBmi(v)
                  setBmiManual(true)
                }, autoBmi != null && !bmiManual ? '키·체중 자동 계산' : undefined)}
              </Stack>
              {field('허리둘레 (cm)', waistCm, setWaistCm)}

              <SectionLabel>시력</SectionLabel>
              <Stack direction="row" spacing={1}>
                {field('좌', visionLeft, setVisionLeft)}
                {field('우', visionRight, setVisionRight)}
              </Stack>

              <SectionLabel>혈압</SectionLabel>
              <Stack direction="row" spacing={1}>
                {field('최고', bpSystolic, setBpSystolic)}
                {field('최저', bpDiastolic, setBpDiastolic)}
              </Stack>

              <SectionLabel>당뇨</SectionLabel>
              {field('공복혈당', fastingGlucose, setFastingGlucose, '정상: 100 미만')}

              <SectionLabel>콜레스테롤</SectionLabel>
              {field('총 콜레스테롤', totalCholesterol, setTotalCholesterol, '정상: 200 미만')}
              <Stack direction="row" spacing={1}>
                {field('HDL', hdl, setHdl, '60 이상')}
                {field('중성지방', triglycerides, setTriglycerides, '150 미만')}
              </Stack>
              {field('LDL', ldl, setLdl, '정상: 130 미만')}

              {formError ? (
                <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
                  {formError}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <FormDialogFooter
          onDelete={isEdit && onDelete ? handleDelete : undefined}
          deleteLoading={deleting}
          submitLoading={submitting}
          submitDisabled={!canSubmit}
          submitLabel={isEdit ? '저장' : '추가'}
        />
      </Box>
    </AppDialog>
  )
}
