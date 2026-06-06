// 수정: Auto — 2026-06-05 (손상된 .next 자동 정리 후 dev)
/**
 * Windows에서 안정적인 webpack dev.
 * routes-manifest 없으면 .next 가 깨진 상태 → 삭제 후 시작.
 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const nextDir = path.join(root, '.next')
const routesManifest = path.join(nextDir, 'routes-manifest.json')

function cleanBrokenNextCache() {
  if (!fs.existsSync(nextDir)) return
  if (fs.existsSync(routesManifest)) return
  try {
    fs.rmSync(nextDir, { recursive: true, force: true })
    console.log('손상된 .next 캐시를 삭제했습니다. (routes-manifest.json 없음)')
  } catch {
    /* 무시 */
  }
}

cleanBrokenNextCache()

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
