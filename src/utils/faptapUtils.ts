import { CreateIveEntryData } from '@/types/ivedb'
import { createEntry } from '@/utils/iveDbUtils'

type FaptapVideoResponse = {
  data: {
    id: string
    name: string
    duration: number
    thumbnail_url: string
    user: {
      username: string
      profile?: {
        support_url?: string
      }
    }
    tags: { id: string; name: string; slug: string }[]
    stream_url?: string
    stream_url_selfhosted?: string
    script?: {
      url?: string
      average_speed?: number
      total_actions?: number
    }
  }
}

// faptap's video CDN (the player's "EXT Server"). Every video lives under its
// id here, with a plain MP4 per resolution.
const FAPTAP_CDN = 'https://vz-3d77bc0a-a87.b-cdn.net'
const FAPTAP_CDN_RESOLUTIONS = ['1080p', '720p', '480p', '360p', '240p']

// Not every resolution exists, so check each
const getCdnSources = async (
  cdnId: string,
): Promise<CreateIveEntryData['videoSources']> => {
  const urls = FAPTAP_CDN_RESOLUTIONS.map(
    (resolution) => `${FAPTAP_CDN}/${cdnId}/play_${resolution}.mp4`,
  )
  const exists = await Promise.all(
    urls.map((url) =>
      fetch(url, { headers: { Range: 'bytes=0-0' } })
        .then((response) => response.ok)
        .catch(() => false),
    ),
  )

  return urls
    .filter((_, index) => exists[index])
    .map((url) => ({ url, status: 'working' }))
}

export const loadFaptapScript = async (videoId: string): Promise<void> => {
  const response = await fetch(`https://faptap.net/api/videos/${videoId}`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  const { data }: FaptapVideoResponse = await response.json()

  if (!data.script?.url) {
    throw new Error('No script available for this video')
  }

  const scriptUrl = `https://faptap.net/api/assets/${data.script.url}`
  const sources: CreateIveEntryData['videoSources'] = []

  // Prefer self-hosted URL if available faptap does this if video isn't available
  const selfhosted = data.stream_url_selfhosted
  if (selfhosted?.startsWith('http')) {
    if (!selfhosted.includes('faptap')) {
      sources.push({ url: selfhosted, status: 'working' })
    }
  } else if (selfhosted) {
    // Now usually a bare id on their video CDN
    sources.push(...(await getCdnSources(selfhosted)))
  }

  if (data.stream_url?.startsWith('http')) {
    sources.push({ url: data.stream_url, status: 'working' })
  }

  if (!sources.length) {
    throw new Error('No video URL available')
  }

  const creator = data.user.username
  const supportUrl =
    data.user.profile?.support_url || `https://faptap.net/u/${creator}`

  const thumbnail = data.thumbnail_url
    ? data.thumbnail_url.startsWith('http')
      ? data.thumbnail_url
      : `https://faptap.net/api/assets/${data.thumbnail_url}`
    : undefined

  const createData: CreateIveEntryData = {
    title: data.name,
    tags: ['faptap', ...(data.tags?.map((tag) => tag.name) || [])],
    thumbnail,
    duration: data.duration * 1000,
    videoSources: sources,
    scripts: [
      {
        url: scriptUrl,
        name: `${data.script.total_actions}actions_${data.name}`,
        creator,
        supportUrl,
        avgSpeed: data.script.average_speed || undefined,
        actionCount: data.script.total_actions || undefined,
      },
    ],
  }

  await createEntry(createData)
  window.open(sources[0]?.url, '_blank')
}
