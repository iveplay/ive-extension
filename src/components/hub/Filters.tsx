import { Button, Flex, Text } from '@mantine/core'
import { IconHeart, IconHeartFilled } from '@tabler/icons-react'
import { useShallow } from 'zustand/shallow'
import { useHubStore } from '@/store/useHubStore'

export const Filters = ({ mobile = false }: { mobile?: boolean }) => {
  const { filters, setFilters } = useHubStore(
    useShallow((state) => ({
      filters: state.filters,
      setFilters: state.setFilters,
    })),
  )

  return (
    <Button
      className='box h menuItem'
      miw={64}
      fullWidth={mobile}
      onClick={() => setFilters({ ...filters, favorites: !filters.favorites })}
    >
      <Flex gap='xs' align='center'>
        {filters.favorites ? <IconHeartFilled /> : <IconHeart />}
        <Text display={mobile ? 'block' : { base: 'none', sm: 'block' }}>
          Favorites
        </Text>
      </Flex>
    </Button>
  )
}
