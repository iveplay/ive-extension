import {
  ActionIcon,
  Box,
  Button,
  Group,
  Radio,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { Dispatch, SetStateAction } from 'react'
import { blankScript } from '@/components/hub/entryDraft'
import { EditorDraft, ScriptDraft } from '@/components/hub/types'

type ScriptFieldsProps = {
  draft: EditorDraft
  setDraft: Dispatch<SetStateAction<EditorDraft>>
}

export const ScriptFields = ({ draft, setDraft }: ScriptFieldsProps) => {
  const updateScript = (index: number, patch: Partial<ScriptDraft>) => {
    setDraft((current) => ({
      ...current,
      scripts: current.scripts.map((script, scriptIndex) =>
        scriptIndex === index ? { ...script, ...patch } : script,
      ),
    }))
  }

  const removeScript = (index: number) => {
    setDraft((current) => ({
      ...current,
      scripts: current.scripts.filter(
        (_, scriptIndex) => scriptIndex !== index,
      ),
      defaultScriptIndex:
        current.defaultScriptIndex === index
          ? 0
          : Math.max(
              0,
              current.defaultScriptIndex -
                (current.defaultScriptIndex > index ? 1 : 0),
            ),
    }))
  }

  return (
    <Stack gap='md' h='100%'>
      <Group justify='space-between'>
        <Text fw={600} size='lg'>
          Scripts
        </Text>
        <Button
          type='button'
          size='xs'
          variant='light'
          leftSection={<IconPlus size={16} />}
          onClick={() =>
            setDraft((current) => ({
              ...current,
              scripts: [...current.scripts, blankScript()],
            }))
          }
          radius='md'
        >
          Add Script
        </Button>
      </Group>

      <ScrollArea h={500} type='auto' offsetScrollbars>
        <Stack gap='md' pr='xs'>
          {draft.scripts.map((script, index) => {
            const existingLocal =
              script.url.startsWith('file://') && !script.file
            const newScript = !script.url

            return (
              <Box
                key={`${script.id || 'new'}-${index}`}
                p='md'
                style={{ border: '1px solid #dee2e6', borderRadius: '8px' }}
              >
                <Group justify='space-between' mb='xs'>
                  <Text size='sm' fw={500}>
                    Script {index + 1}
                  </Text>
                  {draft.scripts.length > 1 && (
                    <ActionIcon
                      type='button'
                      color='red'
                      variant='subtle'
                      onClick={() => removeScript(index)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>
                <Stack gap='xs'>
                  {newScript && (
                    <Group>
                      <Button
                        type='button'
                        size='xs'
                        variant={!script.isLocal ? 'filled' : 'default'}
                        onClick={() =>
                          updateScript(index, { isLocal: false, file: null })
                        }
                        radius='md'
                      >
                        URL
                      </Button>
                      <Button
                        type='button'
                        size='xs'
                        variant={script.isLocal ? 'filled' : 'default'}
                        onClick={() =>
                          updateScript(index, { isLocal: true, file: null })
                        }
                        radius='md'
                      >
                        Local File
                      </Button>
                    </Group>
                  )}

                  {existingLocal ? (
                    <Text size='sm' c='dimmed'>
                      Local script: {script.name}
                    </Text>
                  ) : script.isLocal ? (
                    <TextInput
                      type='file'
                      label='Script File'
                      accept='.funscript'
                      required
                      radius='md'
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null
                        updateScript(index, {
                          file,
                          name:
                            script.name ||
                            file?.name.replace(/\.funscript$/i, '') ||
                            '',
                        })
                      }}
                    />
                  ) : (
                    <TextInput
                      label='Script URL'
                      placeholder='https://...'
                      required
                      radius='md'
                      value={script.url}
                      onChange={(event) =>
                        updateScript(index, { url: event.target.value })
                      }
                    />
                  )}
                  <TextInput
                    label='Script Name'
                    placeholder='Enter script name'
                    required
                    radius='md'
                    value={script.name}
                    onChange={(event) =>
                      updateScript(index, { name: event.target.value })
                    }
                  />
                  <TextInput
                    label='Creator'
                    placeholder='Script creator (optional)'
                    radius='md'
                    value={script.creator}
                    onChange={(event) =>
                      updateScript(index, { creator: event.target.value })
                    }
                  />
                  <Radio
                    label='Set as default'
                    checked={draft.defaultScriptIndex === index}
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        defaultScriptIndex: index,
                      }))
                    }
                  />
                </Stack>
              </Box>
            )
          })}
        </Stack>
      </ScrollArea>
    </Stack>
  )
}
