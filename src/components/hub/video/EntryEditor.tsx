import { Button, Divider, Grid, Group, Modal } from '@mantine/core'
import { FormEvent, useEffect, useState } from 'react'
import {
  createBlankDraft,
  createDraftFromEntry,
  isHttpUrl,
  readFunscript,
} from '@/components/hub/entryDraft'
import { EditorDraft, EditorState, Notify } from '@/components/hub/types'
import { useHubStore } from '@/store/useHubStore'
import { CreateIveEntryData } from '@/types/ivedb'
import { saveLocalScript } from '@/utils/localScriptUtils'
import styles from './ModalEntry.module.scss'
import { ScriptFields } from './ScriptFields'
import { VideoDetailsFields } from './VideoDetailsFields'

type EntryEditorProps = {
  state: EditorState | null
  onClose: () => void
  notify: Notify
}

export const EntryEditor = ({ state, onClose, notify }: EntryEditorProps) => {
  const [draft, setDraft] = useState<EditorDraft>(createBlankDraft)
  const [saving, setSaving] = useState(false)
  const createEntry = useHubStore((store) => store.createEntry)
  const updateEntry = useHubStore((store) => store.updateEntry)

  useEffect(() => {
    if (!state) return
    setDraft(
      state.details
        ? createDraftFromEntry(state.details, state.mode === 'add-script')
        : createBlankDraft(),
    )
  }, [state])

  const buildEntryData = async (): Promise<CreateIveEntryData> => {
    const title = draft.title.trim()
    if (!title) throw new Error('A title is required')
    if (draft.thumbnail && !isHttpUrl(draft.thumbnail)) {
      throw new Error('The thumbnail must be an http(s) URL')
    }

    const videoSources = draft.videoSources
      .map((source) => ({ ...source, url: source.url.trim() }))
      .filter((source) => source.url)
    if (
      !videoSources.length ||
      videoSources.some((source) => !isHttpUrl(source.url))
    ) {
      throw new Error('Add at least one valid http(s) video URL')
    }

    const scripts = await Promise.all(
      draft.scripts.map(async (script) => {
        let url = script.url.trim()
        if (script.isLocal && script.file) {
          const content = await readFunscript(script.file)
          const localId = await saveLocalScript(
            script.file.name,
            content,
            script.file.size,
          )
          url = `file://${localId}`
        }

        if (!url || (!url.startsWith('file://') && !isHttpUrl(url))) {
          throw new Error('Every script needs a valid URL or local file')
        }
        if (!script.name.trim()) throw new Error('Every script needs a name')

        return {
          url,
          name: script.name.trim(),
          creator: script.creator.trim() || 'Unknown',
          supportUrl: script.supportUrl,
          avgSpeed: script.avgSpeed,
          maxSpeed: script.maxSpeed,
          actionCount: script.actionCount,
        }
      }),
    )
    if (!scripts.length) throw new Error('Add at least one script')

    const durationSeconds = draft.durationSeconds
      ? Number(draft.durationSeconds)
      : undefined
    if (
      durationSeconds !== undefined &&
      (!Number.isFinite(durationSeconds) || durationSeconds < 0)
    ) {
      throw new Error('Duration must be a positive number of seconds')
    }

    return {
      title,
      thumbnail: draft.thumbnail.trim() || undefined,
      duration:
        durationSeconds === undefined ? undefined : durationSeconds * 1000,
      tags: draft.tags,
      videoSources,
      scripts,
      defaultScriptId: scripts[draft.defaultScriptIndex]?.url || scripts[0].url,
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      const data = await buildEntryData()
      if (state?.details) {
        await updateEntry(state.details.entry.id, data)
        notify(
          state.mode === 'add-script' ? 'Script added' : 'Entry updated',
          'success',
        )
      } else {
        await createEntry(data)
        notify('Entry created', 'success')
      }
      onClose()
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Could not save the entry',
        'error',
      )
    } finally {
      setSaving(false)
    }
  }

  const modalTitle =
    state?.mode === 'new'
      ? 'Add new entry'
      : state?.mode === 'add-script'
        ? 'Add script'
        : 'Edit entry'

  return (
    <Modal
      opened={state !== null}
      onClose={onClose}
      title={modalTitle}
      radius='lg'
      size='xl'
      closeOnClickOutside={!saving}
      classNames={{ title: styles.modalTitle }}
    >
      <form onSubmit={(event) => void submit(event)}>
        <Grid gutter='lg'>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <VideoDetailsFields draft={draft} setDraft={setDraft} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <ScriptFields draft={draft} setDraft={setDraft} />
          </Grid.Col>
        </Grid>
        <Divider my='lg' />
        <Group justify='flex-end'>
          <Button type='button' variant='default' onClick={onClose} radius='md'>
            Cancel
          </Button>
          <Button type='submit' loading={saving} radius='md'>
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  )
}
