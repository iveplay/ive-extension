import { Combobox, Flex, InputBase, Text, useCombobox } from '@mantine/core'
import { IconVideo } from '@tabler/icons-react'
import { useState } from 'react'
import { VideoSource } from '@/types/ivedb'
import styles from './ScriptSelector.module.scss'

type VideoSourceSelectorProps = {
  videoSources: VideoSource[]
  onSelect: (url: string) => void
}

export const VideoSourceSelector = ({
  videoSources,
  onSelect,
}: VideoSourceSelectorProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [sourceId, setSourceId] = useState(videoSources[0]?.id)

  if (!videoSources.length)
    return <InputBase disabled value='No video sources' />

  if (videoSources.length === 1) {
    return (
      <InputBase
        classNames={{ input: styles.optionSelector }}
        component='a'
        href={videoSources[0].url}
        target='_blank'
        radius='lg'
        multiline
        title={videoSources[0].url}
      >
        <VideoSourceOption {...videoSources[0]} />
      </InputBase>
    )
  }

  const selectedOption =
    videoSources.find((source) => source.id === sourceId) || videoSources[0]

  return (
    <Combobox
      radius='md'
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(value) => {
        setSourceId(value)
        const source = videoSources.find((item) => item.id === value)
        if (source) onSelect(source.url)
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          classNames={{ input: styles.optionSelector }}
          component='button'
          type='button'
          pointer
          radius='lg'
          rightSection={<Combobox.Chevron color='lightgray' />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents='none'
          multiline
          title={selectedOption.url}
        >
          <VideoSourceOption {...selectedOption} />
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown className={styles.optionDropdown}>
        <Combobox.Options>
          {videoSources.map((source) => (
            <Combobox.Option
              value={source.id}
              key={source.id}
              className={styles.optionItem}
            >
              <VideoSourceOption {...source} />
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

const VideoSourceOption = ({ url }: VideoSource) => {
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '')
  const domain = displayUrl.split('/')[0]
  const domainWithoutTld = domain.replace(/\.[^.]+$/, '')
  const path = displayUrl.substring(domain.length)

  return (
    <Flex justify='space-between' gap={8}>
      <Text
        size='sm'
        fw={500}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          direction: 'rtl',
          textAlign: 'left',
        }}
      >
        {path || '/'}
      </Text>
      <Flex gap={4} align='center' c='gray' flex='0 0 auto'>
        <IconVideo size={12} />
        <Text size='xs' truncate='end' maw={150}>
          {domainWithoutTld}
        </Text>
      </Flex>
    </Flex>
  )
}
