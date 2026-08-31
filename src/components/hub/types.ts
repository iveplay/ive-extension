import { IveEntryWithDetails, ScriptMetadata, VideoSource } from '@/types/ivedb'

export type NoticeTone = 'success' | 'error'

export type Notify = (message: string, tone: NoticeTone) => void

export type EditorState = {
  mode: 'new' | 'edit' | 'add-script'
  details?: IveEntryWithDetails
}

export type ScriptDraft = {
  id?: string
  url: string
  name: string
  creator: string
  isLocal: boolean
  file: File | null
  supportUrl?: string
  avgSpeed?: number
  maxSpeed?: number
  actionCount?: number
}

export type EditorDraft = {
  title: string
  thumbnail: string
  durationSeconds: string
  tags: string[]
  videoSources: Array<Pick<VideoSource, 'url' | 'status'>>
  scripts: ScriptDraft[]
  defaultScriptIndex: number
}

export type ImportData = {
  favorites?: string[]
  entries: Array<{
    entry: {
      id: string
      title: string
      duration?: number
      thumbnail?: string
      tags?: string[]
      defaultScriptId?: string
    }
    videoSources: Array<Pick<VideoSource, 'url' | 'status'>>
    scripts: Array<
      Pick<
        ScriptMetadata,
        | 'url'
        | 'name'
        | 'creator'
        | 'supportUrl'
        | 'avgSpeed'
        | 'maxSpeed'
        | 'actionCount'
      >
    >
  }>
}
