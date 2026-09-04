import { SITE_URL } from '@/lib/blog'

const INDEXNOW_KEY = 'a7f3d9c2e8b14f6a9d0c5e2b8f1a4d7c'

export async function submitToIndexNow(url: string) {
  try {
    await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}&keyLocation=${encodeURIComponent(`${SITE_URL}/${INDEXNOW_KEY}.txt`)}`
    )
  } catch (err) {
    console.error('IndexNow submission failed:', err)
  }
}