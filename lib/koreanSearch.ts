// 수정: Auto — 2026-06-05 (초성 검색)

const CHO_SUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

export function getChosung(char: string): string {
  if (char.length === 0) return ''
  const code = char.charCodeAt(0)
  if (code >= 0xac00 && code <= 0xd7a3) {
    const index = Math.floor((code - 0xac00) / 28 / 21)
    return CHO_SUNG[index] || char
  }
  if (code >= 0x3131 && code <= 0x314e) {
    return char
  }
  return char
}

export function toChosung(text: string): string {
  return text.split('').map(getChosung).join('')
}

export function isChosungOnly(text: string): boolean {
  if (text.length === 0) return false
  for (const char of text) {
    if (!CHO_SUNG.includes(char)) return false
  }
  return true
}

/** 초성이면 초성 매칭, 아니면 일반 포함 검색 */
export function matchesSearch(text: string, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery.length === 0) return true

  if (isChosungOnly(normalizedQuery)) {
    const textChosung = toChosung(text.toLowerCase())
    return textChosung.includes(normalizedQuery)
  }

  return text.toLowerCase().includes(normalizedQuery)
}

export function matchesAnySearch(texts: string[], query: string): boolean {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return true
  return texts.some((text) => matchesSearch(text, normalizedQuery))
}
