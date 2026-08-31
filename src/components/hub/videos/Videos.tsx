import {
  Box,
  Button,
  Center,
  Flex,
  Loader,
  SimpleGrid,
  Text,
} from '@mantine/core'
import { useShallow } from 'zustand/shallow'
import { EditorState, Notify } from '@/components/hub/types'
import { Video } from '@/components/hub/video/Video'
import { useHubStore } from '@/store/useHubStore'
import { EmptyFavorites } from './EmptyFavorites'
import { EmptyVideos } from './EmptyVideos'

type VideosProps = {
  setEditor: (state: EditorState) => void
  notify: Notify
}

export const Videos = ({ setEditor, notify }: VideosProps) => {
  const {
    entries,
    loading,
    filters,
    error,
    isLoadingMore,
    entriesHasMore,
    loadMoreEntries,
  } = useHubStore(
    useShallow((state) => ({
      entries: state.entries,
      loading: state.loading,
      filters: state.filters,
      error: state.error,
      isLoadingMore: state.isLoadingMore,
      entriesHasMore: state.entriesHasMore,
      loadMoreEntries: state.loadMoreEntries,
    })),
  )

  if (loading) {
    return (
      <Center flex={1}>
        <Loader size='lg' />
      </Center>
    )
  }

  if (error && entries.length === 0) {
    return (
      <Center flex={1} className='box'>
        <Text>{error}</Text>
      </Center>
    )
  }

  if (entries.length === 0) {
    return filters.favorites ? <EmptyFavorites /> : <EmptyVideos />
  }

  return (
    <>
      <SimpleGrid
        cols={{ base: 1, sm: 3, lg: 4, xl: 5 }}
        spacing='md'
        verticalSpacing='md'
      >
        {entries.map((details) => (
          <Video
            key={details.entry.id}
            details={details}
            setEditor={setEditor}
            notify={notify}
          />
        ))}
      </SimpleGrid>

      {entriesHasMore && (
        <Flex mt='md' gap='md' justify='center' align='center'>
          <Box className='box w' h={50} />
          <Button
            onClick={() => void loadMoreEntries()}
            loading={isLoadingMore}
            size='lg'
            radius='lg'
            flex='0 0 auto'
          >
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </Button>
          <Box className='box w' h={50} />
        </Flex>
      )}
    </>
  )
}
