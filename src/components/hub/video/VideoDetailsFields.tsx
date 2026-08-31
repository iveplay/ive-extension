import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Stack,
  TagsInput,
  Text,
  TextInput,
} from '@mantine/core'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { Dispatch, SetStateAction } from 'react'
import { EditorDraft } from '@/components/hub/types'

type VideoDetailsFieldsProps = {
  draft: EditorDraft
  setDraft: Dispatch<SetStateAction<EditorDraft>>
}

export const VideoDetailsFields = ({
  draft,
  setDraft,
}: VideoDetailsFieldsProps) => {
  const updateVideo = (index: number, url: string) => {
    setDraft((current) => ({
      ...current,
      videoSources: current.videoSources.map((source, sourceIndex) =>
        sourceIndex === index ? { ...source, url } : source,
      ),
    }))
  }

  return (
    <Stack gap='md'>
      <Text fw={600} size='lg'>
        Video Details
      </Text>
      <TextInput
        label='Video Title'
        placeholder='Enter video title'
        required
        radius='md'
        value={draft.title}
        onChange={(event) =>
          setDraft((current) => ({
            ...current,
            title: event.target.value,
          }))
        }
      />
      <TextInput
        label='Thumbnail URL'
        placeholder='https://...'
        radius='md'
        value={draft.thumbnail}
        onChange={(event) =>
          setDraft((current) => ({
            ...current,
            thumbnail: event.target.value,
          }))
        }
      />
      <NumberInput
        label='Duration (seconds)'
        placeholder='Video duration in seconds (optional)'
        min={0}
        radius='md'
        value={
          draft.durationSeconds ? Number(draft.durationSeconds) : undefined
        }
        onChange={(value) =>
          setDraft((current) => ({
            ...current,
            durationSeconds: value === '' ? '' : String(value),
          }))
        }
      />
      <TagsInput
        label='Tags'
        placeholder='Add tags (press Enter)'
        radius='md'
        value={draft.tags}
        onChange={(tags) => setDraft((current) => ({ ...current, tags }))}
      />
      <Stack gap='xs'>
        <Group justify='space-between'>
          <Text size='sm' fw={500}>
            Video Sources
          </Text>
          <Button
            type='button'
            size='xs'
            variant='light'
            leftSection={<IconPlus size={14} />}
            onClick={() =>
              setDraft((current) => ({
                ...current,
                videoSources: [
                  ...current.videoSources,
                  { url: '', status: 'unknown' },
                ],
              }))
            }
            radius='md'
          >
            Add Source
          </Button>
        </Group>
        {draft.videoSources.map((source, index) => (
          <Group key={index} wrap='nowrap'>
            <TextInput
              placeholder='https://...'
              required
              radius='md'
              flex={1}
              value={source.url}
              onChange={(event) => updateVideo(index, event.target.value)}
            />
            {draft.videoSources.length > 1 && (
              <ActionIcon
                type='button'
                color='red'
                variant='subtle'
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    videoSources: current.videoSources.filter(
                      (_, sourceIndex) => sourceIndex !== index,
                    ),
                  }))
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            )}
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}
