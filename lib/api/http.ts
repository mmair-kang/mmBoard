// 수정: Auto — 2026-06-05

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(body.message ?? '요청 실패')
  }
  return res.json() as Promise<T>
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(body.message ?? '요청 실패')
  }
  return res.json() as Promise<T>
}
