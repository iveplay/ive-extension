import { IveEntryWithDetails } from '@/types/ivedb'
import { EditorDraft, ScriptDraft } from './types'

export const MAX_LOCAL_SCRIPT_SIZE = 2 * 1024 * 1024

export const blankScript = (): ScriptDraft => ({
  url: '',
  name: '',
  creator: '',
  isLocal: false,
  file: null,
})

export const createBlankDraft = (): EditorDraft => ({
  title: '',
  thumbnail: '',
  durationSeconds: '',
  tags: ['manual'],
  videoSources: [{ url: '', status: 'unknown' }],
  scripts: [blankScript()],
  defaultScriptIndex: 0,
})

export const createDraftFromEntry = (
  details: IveEntryWithDetails,
  addScript: boolean,
): EditorDraft => {
  const scripts: ScriptDraft[] = details.scripts.map((script) => ({
    ...script,
    isLocal: script.url.startsWith('file://'),
    file: null,
  }))
  const defaultScriptIndex = Math.max(
    0,
    details.scripts.findIndex(
      (script) =>
        script.id === details.entry.defaultScriptId ||
        script.url === details.entry.defaultScriptId,
    ),
  )

  if (addScript) scripts.push(blankScript())

  return {
    title: details.entry.title,
    thumbnail: details.entry.thumbnail || '',
    durationSeconds: details.entry.duration
      ? String(Math.round(details.entry.duration / 1000))
      : '',
    tags: details.entry.tags || ['manual'],
    videoSources: details.videoSources.map(({ url, status }) => ({
      url,
      status,
    })),
    scripts,
    defaultScriptIndex,
  }
}

export const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const readFunscript = async (
  file: File,
): Promise<Record<string, unknown>> => {
  if (!file.name.toLowerCase().endsWith('.funscript')) {
    throw new Error('Local scripts must use the .funscript extension')
  }
  if (file.size > MAX_LOCAL_SCRIPT_SIZE) {
    throw new Error('Local scripts cannot be larger than 2MB')
  }

  const parsed: unknown = JSON.parse(await file.text())
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${file.name} is not a valid funscript file`)
  }
  return parsed as Record<string, unknown>
}
