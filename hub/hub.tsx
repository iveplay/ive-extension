import { createTheme, MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HubApp } from '@/pages/hub/HubApp'
import '@mantine/core/styles.css'
import './hub.scss'

const theme = createTheme({
  colors: {
    brand: [
      '#f9e5f2',
      '#f0cbe5',
      '#e5a6d3',
      '#d77abd',
      '#c74ea5',
      '#b22a8c',
      '#7b024d',
      '#68023f',
      '#540232',
      '#410126',
    ],
  },
  primaryColor: 'brand',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme='dark'>
      <HubApp />
    </MantineProvider>
  </StrictMode>,
)
