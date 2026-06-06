// 수정: Auto — 2026-06-05

const MAX_EDGE = 320
const JPEG_QUALITY = 0.82
const MAX_DATA_URL_LENGTH = 420_000
const DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,/

export function isValidShoppingImageDataUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  if (!DATA_URL_RE.test(value)) return false
  if (value.length > MAX_DATA_URL_LENGTH) return false
  return true
}

export function parseShoppingImageData(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (!isValidShoppingImageDataUrl(value)) return null
  return value
}

function isTextInputTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true
  return target.isContentEditable
}

export function getClipboardImageBlob(clipboardData: DataTransfer | null): Blob | null {
  if (!clipboardData) return null
  for (const item of clipboardData.items) {
    if (item.type.startsWith('image/')) return item.getAsFile()
  }
  return null
}

export function shouldHandleImagePaste(event: ClipboardEvent | React.ClipboardEvent) {
  const blob = getClipboardImageBlob(event.clipboardData)
  if (!blob) return false
  const text = event.clipboardData?.getData('text/plain')?.trim()
  if (text && isTextInputTarget(event.target)) return false
  return true
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'))
    img.src = src
  })
}

export async function optimizeImageBlob(blob: Blob): Promise<string> {
  const objectUrl = URL.createObjectURL(blob)
  try {
    const img = await loadImage(objectUrl)
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
    const width = Math.max(1, Math.round(img.width * scale))
    const height = Math.max(1, Math.round(img.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('이미지 처리에 실패했습니다.')
    ctx.drawImage(img, 0, 0, width, height)

    let quality = JPEG_QUALITY
    let dataUrl = canvas.toDataURL('image/jpeg', quality)
    while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.45) {
      quality -= 0.08
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }
    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      throw new Error('이미지가 너무 큽니다. 더 작은 이미지를 사용해 주세요.')
    }
    return dataUrl
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function fileToOptimizedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 등록할 수 있습니다.')
  }
  return optimizeImageBlob(file)
}

export async function clipboardEventToOptimizedDataUrl(
  event: ClipboardEvent | React.ClipboardEvent,
): Promise<string | null> {
  const blob = getClipboardImageBlob(event.clipboardData)
  if (!blob) return null
  return optimizeImageBlob(blob)
}
