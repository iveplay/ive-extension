import { Button, Flex, Text } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useHubStore } from '@/store/useHubStore'
import { IveEntryWithDetails } from '@/types/ivedb'
import { getAllEntries, getEntryWithDetails } from '@/utils/iveDbUtils'
import { Notify } from './types'

export const ExportButton = ({
  notify,
  mobile = false,
}: {
  notify: Notify
  mobile?: boolean
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const { entries, favoriteIds } = useHubStore(
    useShallow((state) => ({
      entries: state.entries,
      favoriteIds: state.favoriteIds,
    })),
  )

  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)

    try {
      const allEntries = await getAllEntries()
      const details = (
        await Promise.all(
          allEntries.map((entry) => getEntryWithDetails(entry.id)),
        )
      ).filter((entry): entry is IveEntryWithDetails => entry !== null)
      const validEntries = details
        .map((entry) => ({
          ...entry,
          scripts: entry.scripts.filter(
            (script) => !script.url.startsWith('file://'),
          ),
        }))
        .filter((entry) => entry.scripts.length > 0)
      const exportData = {
        version: chrome.runtime.getManifest().version,
        exportDate: new Date().toISOString(),
        totalEntries: validEntries.length,
        favorites: Array.from(favoriteIds),
        entries: validEntries,
      }
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(exportData)], { type: 'application/json' }),
      )
      const link = document.createElement('a')
      link.href = url
      link.download = `ive-backup-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      notify(`Exported ${validEntries.length} entries`, 'success')
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Failed to export data',
        'error',
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      className='box h menuItem'
      miw={64}
      fullWidth={mobile}
      onClick={() => void handleExport()}
      loading={isExporting}
      disabled={entries.length === 0}
    >
      <Flex gap='xs' align='center'>
        <IconDownload />
        <Text display={mobile ? 'block' : { base: 'none', sm: 'block' }}>
          Export
        </Text>
      </Flex>
    </Button>
  )
}
