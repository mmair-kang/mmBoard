// 수정: Auto — 2026-06-05
/** dev 서버 .next 를 건드리지 않고 타입·빌드만 검증 */
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const buildDir = path.join(root, '.next-build')

try {
  fs.rmSync(buildDir, { recursive: true, force: true })
} catch {
  /* 없으면 무시 */
}

const child = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: root,
  env: { ...process.env, NEXT_DIST_DIR: '.next-build' },
})

child.on('exit', (code) => process.exit(code ?? 0))
