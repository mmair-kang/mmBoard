# mmBoard

개인 관리 앱 (mmRider 스타일 기반)

## 시작하기

1. `.env.example`을 `.env`로 복사하고 Turso 정보를 입력합니다.
2. `npm install`
3. `npm run dev` (webpack — Windows에서 안정적)

**개발 중 500 / `build-manifest.json` ENOENT 가 나면**
- dev 서버를 **Ctrl+C**로 끄고 `npm run dev:clean` 실행
- **dev 켜진 상태에서 `npm run build` 하지 마세요** — 검증은 `npm run build:check` 사용 (`.next-build`에만 빌드)
- dev 서버는 **한 개만** 실행 (CMD + Cursor 터미널 동시 실행 X)

## 환경 변수

| 변수 | 설명 |
|------|------|
| `TURSO_DATABASE_URL` | Turso DB URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Turso 인증 토큰 |
