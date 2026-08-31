import { Button, Flex, Text } from '@mantine/core'
import { IconUpload } from '@tabler/icons-react'
import { ChangeEvent, useRef, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useHubStore } from '@/store/useHubStore'
import { addToFavorites, createEntry } from '@/utils/iveDbUtils'
import { ImportData, Notify } from './types'

export const ImportButton = ({
  notify,
  mobile = false,
}: {
  notify: Notify
  mobile?: boolean
}) => {
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { loadEntries, loadFavorites } = useHubStore(
    useShallow((state) => ({
      loadEntries: state.loadEntries,
      loadFavorites: state.loadFavorites,
    })),
  )

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsImporting(true)

    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!parsed || typeof parsed !== 'object' || !('entries' in parsed)) {
        throw new Error('Invalid backup file format')
      }
      const data = parsed as ImportData
      if (!Array.isArray(data.entries)) {
        throw new Error('Invalid backup file format')
      }

      const entryIdMapping = new Map<string, string>()
      let imported = 0
      let failed = 0

      for (const item of data.entries) {
        try {
          if (
            !item.entry?.title ||
            !Array.isArray(item.videoSources) ||
            !Array.isArray(item.scripts)
          ) {
            throw new Error('Invalid entry')
          }
          const newId = await createEntry({
            title: item.entry.title,
            duration: item.entry.duration,
            thumbnail: item.entry.thumbnail,
            tags: item.entry.tags,
            videoSources: item.videoSources,
            scripts: item.scripts,
            defaultScriptId: item.entry.defaultScriptId,
          })
          entryIdMapping.set(item.entry.id, newId)
          imported++
        } catch {
          failed++
        }
      }

      for (const oldId of data.favorites || []) {
        const newId = entryIdMapping.get(oldId)
        if (newId) await addToFavorites(newId)
      }

      await Promise.all([loadEntries(true), loadFavorites()])
      notify(
        `Imported ${imported} entries${failed ? `, ${failed} failed` : ''}`,
        failed ? 'error' : 'success',
      )
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Failed to import data',
        'error',
      )
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        onChange={(event) => void handleImport(event)}
        style={{ display: 'none' }}
      />
      <Button
        className='box h menuItem'
        miw={64}
        fullWidth={mobile}
        onClick={() => fileInputRef.current?.click()}
        loading={isImporting}
      >
        <Flex gap='xs' align='center'>
          <IconUpload />
          <Text display={mobile ? 'block' : { base: 'none', sm: 'block' }}>
            Import
          </Text>
        </Flex>
      </Button>
    </>
  )
}
