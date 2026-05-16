import { AppSettings, DEFAULT_SETTINGS, ChatRequest, ChatResponse } from './types'
import { askAI } from './agent'

console.log('[BiliAsk:BG] Service worker starting')

chrome.runtime.onInstalled.addListener(() => {
  console.log('[BiliAsk:BG] Extension installed/updated')
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      console.log('[BiliAsk:BG] No settings found, writing defaults')
      chrome.storage.sync.set({ settings: DEFAULT_SETTINGS })
    }
  })
  chrome.storage.local.set({ chatHistory: [] })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHAT_REQUEST') {
    handleChatRequest(message as ChatRequest).then(sendResponse).catch((err) => {
      console.error('[BiliAsk:BG] handleChatRequest failed:', err)
      sendResponse({ type: 'CHAT_RESPONSE', content: '', error: err.message })
    })
    return true
  }
  if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['settings'], (result) => {
      sendResponse({ settings: result.settings || DEFAULT_SETTINGS })
    })
    return true
  }
  return false
})

async function handleChatRequest(req: ChatRequest): Promise<ChatResponse> {
  try {
    const stored = await chrome.storage.sync.get(['settings'])
    const settings: AppSettings = stored.settings || DEFAULT_SETTINGS

    console.log('[BiliAsk:BG] Chat request received, hasApiKey:', !!settings.apiKey)

    if (!settings.apiKey) {
      console.warn('[BiliAsk:BG] No API key configured')
      return {
        type: 'CHAT_RESPONSE',
        content: '',
        error: '请先在插件设置中配置 API Key',
      }
    }

    console.log('[BiliAsk:BG] Calling AI with model:', settings.model)
    const content = await askAI(settings, req.videoContext, req.messages)
    console.log('[BiliAsk:BG] AI response length:', content?.length)

    // Save to local history
    const hist = await chrome.storage.local.get(['chatHistory'])
    const history = hist.chatHistory || []
    history.push(
      { role: 'user', content: req.messages[req.messages.length - 1].content, time: Date.now() },
      { role: 'assistant', content, time: Date.now() }
    )
    const trimmed = history.slice(-200)
    await chrome.storage.local.set({ chatHistory: trimmed })

    return { type: 'CHAT_RESPONSE', content }
  } catch (err: any) {
    console.error('[BiliAsk:BG] API call failed:', err.message)
    return {
      type: 'CHAT_RESPONSE',
      content: '',
      error: err.message || 'Unknown error',
    }
  }
}
