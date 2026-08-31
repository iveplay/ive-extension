import { Combobox, Flex, InputBase, Text, useCombobox } from '@mantine/core'
import { IconUser } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { IveEntry, ScriptMetadata } from '@/types/ivedb'
import styles from './ScriptSelector.module.scss'

type ScriptSelectorProps = {
  scripts: ScriptMetadata[]
  entry: IveEntry
  onSelect: (scriptId: string) => void
}

export const ScriptSelector = ({
  scripts,
  entry,
  onSelect,
}: ScriptSelectorProps) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const defaultScriptId =
    scripts.find(
      (script) =>
        script.url === entry.defaultScriptId ||
        script.id === entry.defaultScriptId,
    )?.id || scripts[0]?.id
  const [scriptId, setScriptId] = useState(defaultScriptId)

  useEffect(() => {
    if (defaultScriptId) onSelect(defaultScriptId)
  }, [defaultScriptId, onSelect])

  if (!scripts.length) return <InputBase disabled value='No scripts' />

  if (scripts.length === 1) {
    return (
      <InputBase
        classNames={{ input: styles.optionSelector }}
        component='div'
        radius='lg'
        multiline
        title={scripts[0].name}
      >
        <ScriptOption
          {...scripts[0]}
          isDefault={defaultScriptId === scripts[0].id}
        />
      </InputBase>
    )
  }

  const selectedOption =
    scripts.find((script) => script.id === scriptId) || scripts[0]

  return (
    <Combobox
      radius='md'
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(value) => {
        setScriptId(value)
        onSelect(value)
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
          title={selectedOption.name}
        >
          <ScriptOption
            {...selectedOption}
            isDefault={defaultScriptId === selectedOption.id}
          />
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown className={styles.optionDropdown}>
        <Combobox.Options>
          {scripts.map((script) => (
            <Combobox.Option
              value={script.id}
              key={script.id}
              className={styles.optionItem}
            >
              <ScriptOption
                {...script}
                isDefault={defaultScriptId === script.id}
              />
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

const ScriptOption = ({
  name,
  creator,
  isDefault,
}: ScriptMetadata & { isDefault?: boolean }) => (
  <Flex justify='space-between' gap={4}>
    <Text size='sm' fw={500} truncate='end'>
      {isDefault && '★ '}
      {name}
    </Text>
    <Flex gap={4} align='center' c='gray' flex='0 0 auto'>
      <IconUser size={12} />
      <Text size='xs'>{creator}</Text>
    </Flex>
  </Flex>
)
