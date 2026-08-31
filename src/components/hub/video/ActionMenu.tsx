import { ActionIcon, Menu } from '@mantine/core'
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import styles from './ActionMenu.module.scss'

type ActionMenuProps = {
  onEdit: () => void
  onAddScript: () => void
  onDelete: () => void
}

export const ActionMenu = ({
  onEdit,
  onAddScript,
  onDelete,
}: ActionMenuProps) => (
  <Menu
    position='bottom-end'
    offset={4}
    classNames={{ dropdown: styles.menuDropdown, item: styles.menuItem }}
  >
    <Menu.Target>
      <ActionIcon
        variant='filled'
        radius='xl'
        color='rgba(41, 11, 29, 0.85)'
        aria-label='Toggle menu'
        size={40}
        className={styles.menuButton}
      >
        <IconDotsVertical />
      </ActionIcon>
    </Menu.Target>
    <Menu.Dropdown>
      <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>
        Edit
      </Menu.Item>
      <Menu.Item leftSection={<IconPlus size={14} />} onClick={onAddScript}>
        Add Script
      </Menu.Item>
      <Menu.Item leftSection={<IconTrash size={14} />} onClick={onDelete}>
        Delete
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
)
