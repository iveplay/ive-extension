import { Flex, Title } from '@mantine/core'

export const EmptyFavorites = () => (
  <Flex
    flex={1}
    direction='column'
    align='center'
    justify='center'
    className='box'
  >
    <Title order={1} my='md' fw={300} ff='var(--font-frankfurter)'>
      No favorite videos found
    </Title>
  </Flex>
)
