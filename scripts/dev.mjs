// 수정: Auto — 2026-06-05 (webpack dev — Turbopack manifest 오류 회피)
/**
 * Windows에서 안정적인 webpack dev.
 * 시작 시 .next 를 지우지 않음 → 재시작 없이 HMR 유지.
 */
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const env = {
  ...process.env,
  WATCHPACK_POLLING: 'true',
  CHOKIDAR_USEPOLLING: 'true',
  WATCHPACK_POLLING_INTERVAL: '1000',
}

const child = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: root,
  env,
})

child.on('exit', (code) => process.exit(code ?? 0))
