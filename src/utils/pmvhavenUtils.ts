export type PmvhavenMetadata = {
  title: string
  thumbnailUrl?: string
  contentUrl?: string
  duration?: string
  creator?: string
}

export const extractPmvhavenMetadata = (): PmvhavenMetadata => {
  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]',
  )
  for (const script of Array.from(scripts)) {
    try {
      const data = JSON.parse(script.textContent || '')
      if (data['@type'] === 'VideoObject' && data.contentUrl) {
        return {
          title: data.name || document.title.replace(' - PMVHaven', '').trim(),
          thumbnailUrl: data.thumbnailUrl,
          contentUrl: data.contentUrl,
          duration: data.duration,
          creator: data.creator?.name || data.author?.name,
        }
      }
    } catch {
      // Ignore JSON parsing errors
    }
  }
  return { title: document.title.replace(' - PMVHaven', '').trim() }
}

export const parseIsoDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseFloat(match[3] || '0')
  return (hours * 3600 + minutes * 60 + seconds) * 1000
}

// Some scripts listed on PMVHaven point at files their bucket refuses to serve
// (403 AccessDenied). Probe each one once so only working ones get a button.
const availability = new Map<string, Promise<boolean>>()

export const isScriptAvailable = (url: string): Promise<boolean> => {
  let result = availability.get(url)
  if (!result) {
    result = fetch(url, { method: 'HEAD', cache: 'no-store' })
      .then((res) => res.ok)
      .catch(() => false)
    availability.set(url, result)
  }
  return result
}
