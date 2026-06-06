// 수정: Auto — 2026-06-05

import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const nextDir = path.join(root, '.next')

try {
  fs.rmSync(nextDir, { recursive: true, force: true })
  console.log('.next 전체를 삭제했습니다.')
} catch {
  /* 없으면 무시 */
}

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
