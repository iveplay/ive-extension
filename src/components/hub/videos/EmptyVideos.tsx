import { Button, Flex, Text, Title } from '@mantine/core'

export const EmptyVideos = () => (
  <Flex
    flex={1}
    direction='column'
    align='center'
    justify='center'
    className='box'
  >
    <Title order={1} my='md' fw={300} ff='var(--font-frankfurter)'>
      No scripts found
    </Title>
    <Text mb='lg' fw={500} ta='center' maw={600}>
      IVE needs scripts to work, the hub is currently just an overview of your
      scripts. Because we use better metadata now you will need to re-play your
      favorite videos before they are added here.
      <br />
      <br />
      Go get your favorite videos and scripts on any of the supported sites.
    </Text>
    <Flex gap='md' wrap='wrap' justify='center'>
      <Button
        component='a'
        href='https://eroscripts.com'
        target='_blank'
        fw={700}
        radius='lg'
        size='lg'
      >
        EroScripts
      </Button>
      <Button
        component='a'
        href='https://ivdb.io'
        target='_blank'
        fw={700}
        radius='lg'
        size='lg'
      >
        IVDB
      </Button>
      <Button
        component='a'
        href='https://faptap.net'
        target='_blank'
        fw={700}
        radius='lg'
        size='lg'
      >
        FapTap
      </Button>
      <Button
        component='a'
        href='https://www.funscripthub.com'
        target='_blank'
        fw={700}
        radius='lg'
        size='lg'
      >
        FunScriptHub
      </Button>
    </Flex>
  </Flex>
)
