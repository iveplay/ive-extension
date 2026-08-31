import {
  AppShell,
  Box,
  Burger,
  Button,
  Flex,
  Notification,
  Text,
} from '@mantine/core'
import { useClickOutside, useDisclosure } from '@mantine/hooks'
import {
  IconBrandDiscord,
  IconBrandPatreon,
  IconPlus,
} from '@tabler/icons-react'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { ExportButton } from '@/components/hub/ExportButton'
import { Filters } from '@/components/hub/Filters'
import { ImportButton } from '@/components/hub/ImportButton'
import { Logo } from '@/components/hub/logo/Logo'
import { EditorState, NoticeTone } from '@/components/hub/types'
import { EntryEditor } from '@/components/hub/video/EntryEditor'
import { Videos } from '@/components/hub/videos/Videos'
import { useHubStore } from '@/store/useHubStore'

type Notice = {
  message: string
  tone: NoticeTone
}

export const HubApp = () => {
  const [opened, { toggle, close }] = useDisclosure()
  const [header, setHeader] = useState<HTMLElement | null>(null)
  const [navbar, setNavbar] = useState<HTMLElement | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const loadEntries = useHubStore((state) => state.loadEntries)
  const loadFavorites = useHubStore((state) => state.loadFavorites)

  useClickOutside(
    () => {
      if (opened) close()
    },
    null,
    [header, navbar],
  )

  useEffect(() => {
    const refreshHub = () => {
      void Promise.all([loadEntries(true), loadFavorites()])
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshHub()
    }

    refreshHub()
    window.addEventListener('focus', refreshHub)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', refreshHub)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadEntries, loadFavorites])

  const notify = useCallback((message: string, tone: NoticeTone) => {
    setNotice({ message, tone })
    window.setTimeout(() => setNotice(null), 4000)
  }, [])

  return (
    <AppShell
      className='hub-navbar'
      header={{ height: 96 }}
      navbar={{
        width: 280,
        breakpoint: 'md',
        collapsed: { desktop: true, mobile: !opened },
      }}
      data-navbar-expanded={opened || undefined}
    >
      <AppShell.Header ref={setHeader} withBorder={false}>
        <Flex h={64} m='md' gap='md'>
          <Burger
            opened={opened}
            onClick={toggle}
            size='md'
            className='box h'
            p='lg'
            w={64}
            hiddenFrom='sm'
          />
          <Flex
            className='box menuItem'
            component='a'
            href='#'
            justify='center'
          >
            <Logo />
          </Flex>
          <Flex visibleFrom='sm' h={64} gap='md' flex={1}>
            <SocialLink
              href='https://discord.gg/KsYCE4jRHE'
              label='Discord'
              icon={<IconBrandDiscord />}
            />
            <SocialLink
              href='https://patreon.com/iveplay'
              label='Patreon'
              icon={<IconBrandPatreon />}
            />
            <Box className='box h' flex={1} />
            <Filters />
            <ExportButton notify={notify} />
            <ImportButton notify={notify} />
            <NewEntryButton onClick={() => setEditor({ mode: 'new' })} />
          </Flex>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar ref={setNavbar} withBorder={false}>
        <Flex direction='column' p='md' gap='md' h='100%'>
          <Box onClick={close}>
            <Filters mobile />
          </Box>
          <Box onClick={close}>
            <ExportButton notify={notify} mobile />
          </Box>
          <Box onClick={close}>
            <ImportButton notify={notify} mobile />
          </Box>
          <NewEntryButton
            mobile
            onClick={() => {
              setEditor({ mode: 'new' })
              close()
            }}
          />
          <div className='box h' />
          <SocialLink
            href='https://discord.gg/KsYCE4jRHE'
            label='Discord'
            icon={<IconBrandDiscord />}
            mobile
          />
          <SocialLink
            href='https://patreon.com/iveplay'
            label='Patreon'
            icon={<IconBrandPatreon />}
            mobile
          />
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main
        display='flex'
        mx='md'
        pb='md'
        style={{ flexDirection: 'column', transition: 'all 200ms ease' }}
      >
        <Videos setEditor={setEditor} notify={notify} />
      </AppShell.Main>

      <EntryEditor
        state={editor}
        onClose={() => setEditor(null)}
        notify={notify}
      />

      {notice && (
        <Notification
          className='hubNotification'
          color={notice.tone === 'error' ? 'red' : 'green'}
          onClose={() => setNotice(null)}
        >
          {notice.message}
        </Notification>
      )}
    </AppShell>
  )
}

type SocialLinkProps = {
  href: string
  label: string
  icon: ReactNode
  mobile?: boolean
}

const SocialLink = ({ href, label, icon, mobile }: SocialLinkProps) => (
  <Box
    className='box menuItem'
    component='a'
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    p={0}
    w={mobile ? '100%' : 64}
    h={64}
  >
    <Flex
      direction={mobile ? 'row' : 'column'}
      align='center'
      justify={mobile ? 'flex-start' : 'center'}
      px={mobile ? 'md' : 0}
      h={64}
      gap={mobile ? 'sm' : 2}
    >
      <span className='menuItemIcon'>{icon}</span>
      <Text
        size={mobile ? 'sm' : 'xs'}
        c='var(--mantine-color-text)'
        className={mobile ? undefined : 'hoverText'}
      >
        {label}
      </Text>
    </Flex>
  </Box>
)

const NewEntryButton = ({
  onClick,
  mobile = false,
}: {
  onClick: () => void
  mobile?: boolean
}) => (
  <div>
    <Button
      className='box h menuItem'
      miw={64}
      fullWidth={mobile}
      onClick={onClick}
    >
      <Flex gap='xs' align='center'>
        <IconPlus />
        <Text display={mobile ? 'block' : { base: 'none', sm: 'block' }}>
          New
        </Text>
      </Flex>
    </Button>
  </div>
)
