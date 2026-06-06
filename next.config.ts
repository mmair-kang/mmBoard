// 수정: Auto — 2026-06-05 (dev 안정화 — webpack 기본, build 분리)

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /** build:check 는 .next-build 사용 — dev 서버 .next 와 충돌 방지 */
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' }
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 800,
        followSymlinks: true,
        ignored: ['**/.git/**', '**/node_modules/**', '**/.next-build/**'],
      }
    }
    return config
  },
}

export default nextConfig
