'use client'
// 수정: Auto — 2026-06-30 (패션 목록 2줄 — 사이즈·치수 아이콘)

import {
  sxCollectionFashionMetricItem,
  sxCollectionFashionSizeBadge,
} from '@/components/collection/collectionStyles'
import { COLLECTION_OPTION_FIELDS } from '@/config/collectionOptions'
import type { CollectionFashionListMetric } from '@/lib/collectionDetail'
import AlignHorizontalCenterRoundedIcon from '@mui/icons-material/AlignHorizontalCenterRounded'
import HeightRoundedIcon from '@mui/icons-material/HeightRounded'
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded'
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { SvgIconComponent } from '@mui/icons-material'
import type { CollectionOptionFieldKey } from '@/config/collectionOptions'

const FASHION_METRIC_ICONS: Record<CollectionOptionFieldKey, SvgIconComponent> = {
  shoulderWidth: AlignHorizontalCenterRoundedIcon,
  chestWidth: SwapHorizRoundedIcon,
  totalLength: HeightRoundedIcon,
  sleeveLength: StraightenRoundedIcon,
}

function metricLabel(key: CollectionOptionFieldKey, optionType: 'top' | 'bottom'): string {
  return COLLECTION_OPTION_FIELDS[optionType].find((field) => field.key === key)?.label ?? key
}

type Props = {
  size: string
  model: string
  optionType: 'top' | 'bottom'
  metrics: CollectionFashionListMetric[]
}

export function CollectionFashionListMetrics({ size, model, optionType, metrics }: Props) {
  const sizeLabel = size.trim()
  const modelLabel = model.trim()

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
      sx={{ mt: 0.35, columnGap: 0.45, rowGap: 0.3, minWidth: 0 }}
    >
      {modelLabel ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.74rem',
            fontWeight: 600,
            lineHeight: 1.25,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {modelLabel}
        </Typography>
      ) : null}
      {sizeLabel ? (
        <Box component="span" sx={sxCollectionFashionSizeBadge()}>
          {sizeLabel}
        </Box>
      ) : null}
      {metrics.map((metric) => {
        const Icon = FASHION_METRIC_ICONS[metric.key]
        const label = metricLabel(metric.key, optionType)
        const rotateSleeve = metric.key === 'sleeveLength'

        return (
          <Tooltip key={metric.key} title={label} arrow placement="top">
            <Box component="span" sx={sxCollectionFashionMetricItem()}>
              <Icon
                sx={{
                  fontSize: 13,
                  opacity: 0.72,
                  transform: rotateSleeve ? 'rotate(90deg)' : 'none',
                }}
                aria-hidden
              />
              <Typography
                component="span"
                sx={{ fontSize: '0.7rem', fontWeight: 700, lineHeight: 1, color: 'text.secondary' }}
              >
                {metric.value}
              </Typography>
            </Box>
          </Tooltip>
        )
      })}
    </Stack>
  )
}
