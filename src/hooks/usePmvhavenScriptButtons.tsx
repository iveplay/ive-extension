import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import logo from '@/assets/logo.png'
import { VideoPage } from '@/pages/videoPage/VideoPage'
import { createEntry, getEntry } from '@/utils/iveDbUtils'
import {
  extractPmvhavenMetadata,
  parseIsoDuration,
} from '@/utils/pmvhavenUtils'

const showVideoPage = async (entryId: string) => {
  const entry = await getEntry(entryId)
  document.getElementById('ive')?.remove()

  const root = document.createElement('div')
  root.id = 'ive'
  root.style.cssText =
    'z-index:2147483640;position:fixed;inset:0;pointer-events:none;'
  document.body.appendChild(root)

  ReactDOM.createRoot(root).render(
    <StrictMode>
      <VideoPage entry={entry ?? undefined} />
    </StrictMode>,
  )
}

export const usePmvhavenScriptButtons = () => {
  useEffect(() => {
    if (!window.location.hostname.includes('pmvhaven.com')) return

    const processedLinks = new Set<Element>()

    const addButtonsToScripts = () => {
      const downloadLinks = document.querySelectorAll<HTMLAnchorElement>(
        'a[href*="funscripts"][title="Download FunScript"]',
      )

      downloadLinks.forEach((link) => {
        const container = link.parentElement
        if (!container) return

        if (
          processedLinks.has(link) ||
          container.querySelector('[data-ive-pmvhaven-button]')
        )
          return

        const scriptUrl = link.href
        const downloadAttr = link.getAttribute('download') || ''
        const scriptName =
          downloadAttr.replace(/\.funscript$/i, '') || 'pmvhaven_script'

        const scriptRow = container.parentElement
        const infoBlock =
          scriptRow?.querySelector<HTMLElement>('.flex-1.min-w-0')
        const creatorSpan = infoBlock?.querySelector<HTMLElement>(
          '.text-xs.text-gray-400',
        )
        const creator =
          creatorSpan?.textContent?.trim().replace(/^\s*by\s+/i, '') ||
          undefined

        const button = document.createElement('button')
        button.dataset.ivePmvhavenButton = 'true'
        button.title = 'Play with IVE'
        button.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px 6px;
          background: rgba(41, 11, 29, 0.95);
          border: 1px solid rgba(123, 2, 77, 0.5);
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease;
        `

        const logoImg = document.createElement('img')
        logoImg.src = chrome.runtime.getURL(logo)
        logoImg.style.cssText =
          'width: 24px; height: 24px; object-fit: contain;'
        button.appendChild(logoImg)

        let isLoading = false

        button.addEventListener('mouseenter', () => {
          if (!isLoading) button.style.background = 'rgba(61, 16, 43, 0.95)'
        })
        button.addEventListener('mouseleave', () => {
          if (!isLoading) button.style.background = 'rgba(41, 11, 29, 0.95)'
        })

        button.addEventListener('click', async (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (isLoading) return

          isLoading = true
          logoImg.style.display = 'none'
          button.textContent = '...'
          button.style.opacity = '0.7'
          button.style.cursor = 'wait'

          try {
            const metadata = extractPmvhavenMetadata()
            if (!metadata.contentUrl)
              throw new Error('Could not find video URL on this page')

            const duration = metadata.duration
              ? parseIsoDuration(metadata.duration)
              : undefined

            const entryId = await createEntry({
              title: metadata.title,
              tags: ['pmvhaven'],
              thumbnail: metadata.thumbnailUrl,
              duration,
              videoSources: [{ url: metadata.contentUrl, status: 'working' }],
              scripts: [
                {
                  url: scriptUrl,
                  name: scriptName,
                  creator: creator || metadata.creator || 'Unknown',
                  supportUrl: window.location.href,
                },
              ],
            })

            await showVideoPage(entryId)
          } catch (err) {
            console.error('IVE: Error loading PMVHaven script:', err)
            button.textContent = '✗'
            button.style.color = '#ff8a80'
            button.style.opacity = '1'
            button.style.cursor = 'pointer'
            setTimeout(() => {
              button.style.color = 'white'
              button.textContent = ''
              button.appendChild(logoImg)
              logoImg.style.display = 'block'
              isLoading = false
            }, 2000)
            return
          }

          // put back the button to normal state after successful load
          button.textContent = ''
          button.appendChild(logoImg)
          logoImg.style.display = 'block'
          button.style.opacity = '1'
          button.style.cursor = 'pointer'
          button.style.background = 'rgba(41, 11, 29, 0.95)'

          // scroll to top of the page after successful load
          window.scrollTo({ top: 0, behavior: 'smooth' })

          isLoading = false
        })

        container.appendChild(button)
        processedLinks.add(link)
      })
    }

    setTimeout(addButtonsToScripts, 500)
    setTimeout(addButtonsToScripts, 1500)
    setTimeout(addButtonsToScripts, 3000)

    const observer = new MutationObserver((mutations) => {
      const hasNewContent = mutations.some((m) =>
        Array.from(m.addedNodes).some(
          (n) =>
            n instanceof Element &&
            (n.matches('a[href*="funscripts"]') ||
              n.querySelector('a[href*="funscripts"]')),
        ),
      )
      if (hasNewContent) setTimeout(addButtonsToScripts, 100)
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])
}
