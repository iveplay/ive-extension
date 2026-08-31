import { LOCAL_STORAGE_KEYS, MESSAGES } from '@background/types'

export const saveLocalScript = async (
  name: string,
  content: Record<string, unknown>,
  size: number,
): Promise<string> => {
  const response = await chrome.runtime.sendMessage({
    type: MESSAGES.LOCAL_SCRIPT_SAVE,
    name,
    content,
    size,
  })

  if (response && typeof response === 'object' && 'error' in response) {
    throw new Error(String(response.error))
  }

  if (typeof response !== 'string') {
    throw new Error('The local script could not be saved')
  }

  return response
}

export const openVideoWithScript = async (
  videoUrl: string,
  scriptId: string,
): Promise<void> => {
  await chrome.storage.local.set({
    [LOCAL_STORAGE_KEYS.IVE_PENDING_SCRIPT]: {
      scriptId,
      timestamp: Date.now(),
    },
  })

  await chrome.tabs.create({ url: videoUrl })
}
