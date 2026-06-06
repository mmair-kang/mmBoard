// 수정: Auto — 2026-06-05

const API_MESSAGE: Record<number, string> = {
  400: '입력값을 확인해 주세요.',
  404: '항목을 찾을 수 없습니다.',
  500: '서버 오류입니다. dev 서버를 재시작해 보세요.',
}

export async function readApiErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { message?: unknown }
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message === 'invalid request' ? API_MESSAGE[400] ?? fallback : data.message
    }
  } catch {
    /* HTML 응답 등 */
  }
  return API_MESSAGE[res.status] ?? `${fallback} (${res.status})`
}
