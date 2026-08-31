import { ActionIcon, Anchor, Image, Pill, Title } from '@mantine/core'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import clsx from 'clsx'
import { MouseEvent, useCallback, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { EditorState, Notify } from '@/components/hub/types'
import { useHubStore } from '@/store/useHubStore'
import { IveEntryWithDetails } from '@/types/ivedb'
import { formatTime } from '@/utils/formatTime'
import { openVideoWithScript } from '@/utils/localScriptUtils'
import { ActionMenu } from './ActionMenu'
import { ScriptSelector } from './ScriptSelector'
import styles from './Video.module.scss'
import { VideoSourceSelector } from './VideoSourceSelector'

type VideoProps = {
  details: IveEntryWithDetails
  setEditor: (state: EditorState) => void
  notify: Notify
}

export const Video = ({ details, setEditor, notify }: VideoProps) => {
  const { entry, videoSources, scripts } = details
  const { id, title, thumbnail, duration, tags } = entry
  const defaultScript =
    scripts.find(
      (script) =>
        script.url === entry.defaultScriptId ||
        script.id === entry.defaultScriptId,
    ) || scripts[0]
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(
    videoSources[0]?.url || '',
  )
  const [selectedScriptId, setSelectedScriptId] = useState(
    defaultScript?.id || '',
  )
  const { favoriteIds, toggleFavorite, deleteEntry } = useHubStore(
    useShallow((state) => ({
      favoriteIds: state.favoriteIds,
      toggleFavorite: state.toggleFavorite,
      deleteEntry: state.deleteEntry,
    })),
  )
  const isFavorite = favoriteIds.has(id)
  const selectScript = useCallback((scriptId: string) => {
    setSelectedScriptId(scriptId)
  }, [])

  const handlePlay = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!selectedVideoUrl || !selectedScriptId) {
      notify('This entry needs both a video source and a script', 'error')
      return
    }

    try {
      await openVideoWithScript(selectedVideoUrl, selectedScriptId)
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Could not open the video',
        'error',
      )
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete “${title}” from your hub?`)) return
    try {
      await deleteEntry(id)
      notify('Entry deleted', 'success')
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Could not delete the entry',
        'error',
      )
    }
  }

  return (
    <div className={styles.videoContainer}>
      <div className={styles.imageContainer}>
        <ActionIcon
          variant='filled'
          radius='xl'
          color='dark'
          aria-label='Toggle favorite'
          size={40}
          data-favorite={isFavorite}
          onClick={() => void toggleFavorite(id)}
          className={styles.favoriteButton}
          bg={
            isFavorite
              ? 'var(--mantine-primary-color-6)'
              : 'rgba(41, 11, 29, 0.85)'
          }
        >
          {isFavorite ? <IconHeartFilled /> : <IconHeart />}
        </ActionIcon>
        <ActionMenu
          onEdit={() => setEditor({ mode: 'edit', details })}
          onAddScript={() => setEditor({ mode: 'add-script', details })}
          onDelete={() => void handleDelete()}
        />
        <Image
          src={thumbnail}
          alt={title}
          radius='lg'
          fallbackSrc={`https://placehold.co/400/DDD/333?font=roboto&text=${title.slice(0, 25)}`}
        />
        {duration && (
          <Pill
            size='sm'
            aria-label='Video duration'
            className={styles.duration}
          >
            {formatTime(duration)}
          </Pill>
        )}
        <div className={styles.playButtonContainer}>
          <Anchor
            href={selectedVideoUrl}
            c='white'
            className={styles.playButton}
            underline='never'
            target='_blank'
            onClick={(event) => void handlePlay(event)}
          >
            V
          </Anchor>
        </div>
      </div>
      <VideoSourceSelector
        videoSources={videoSources}
        onSelect={setSelectedVideoUrl}
      />
      <ScriptSelector scripts={scripts} entry={entry} onSelect={selectScript} />
      <div className={clsx('box', styles.videoInfo)}>
        <Title size='lg' lineClamp={2} h={48} title={title}>
          {title}
        </Title>
        {!!tags?.length && (
          <Pill.Group className={styles.tags} h={18}>
            {tags.map((tag) => (
              <Pill size='xs' key={tag}>
                {tag}
              </Pill>
            ))}
          </Pill.Group>
        )}
      </div>
    </div>
  )
}
