import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'mmBoard',
    short_name: 'mmBoard',
    description: '개인 관리',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f7fb',
    theme_color: '#1e293b',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}
