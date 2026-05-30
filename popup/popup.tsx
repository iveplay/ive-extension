import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PopupApp } from '@/pages/popup/PopupApp'
import '@mantine/core/styles.css'
import './global.scss'

if (/Android/i.test(navigator.userAgent)) {
  document.documentElement.setAttribute('data-ive-mobile', '')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider forceColorScheme='dark'>
      <PopupApp />
    </MantineProvider>
  </StrictMode>,
)
