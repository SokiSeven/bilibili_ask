import { ChatPanel, createFloatingButton, injectStyles } from './chat-panel'
import type { VideoContext, ChatRequest, ChatResponse } from './types'

const VIDEO_PATH_RE = /^\/video\//

function isBilibiliVideoPage(): boolean {
  return (
    window.location.hostname.includes('bilibili.com') &&
    VIDEO_PATH_RE.test(window.location.pathname)
  )
}

if (!isBilibiliVideoPage()) {
  console.log('[BiliAsk:CS] Not a B站 video page, skipping')
} else {
  initExtension()
}

// --- Request video data from MAIN world bridge ---
function requestVideoData(): Promise<VideoContext> {
  return new Promise((resolve) => {
    const requestId = `${Date.now()}_${Math.random().toString(36).slice(2)}`

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return
      if (event.data?.type === 'BILIASK_VIDEO_DATA' && event.data?.requestId === requestId) {
        window.removeEventListener('message', onMessage)
        const { data } = event.data
        resolve({
          title: data.title || document.title,
          desc: data.desc || '',
          subtitle: data.subtitle || [],
          currentTime: data.currentTime || 0,
        })
      }
    }

    window.addEventListener('message', onMessage)
    window.postMessage({ type: 'BILIASK_GET_VIDEO_DATA', requestId }, '*')

    setTimeout(() => {
      window.removeEventListener('message', onMessage)
      resolve({
        title: document.title,
        desc: '',
        subtitle: [],
        currentTime: document.querySelector('video')?.currentTime || 0,
      })
    }, 8000)
  })
}

// --- Safe sendMessage with retry ---
async function sendChatRequest(req: ChatRequest): Promise<ChatResponse> {
  const MAX_RETRIES = 3
  let lastError: Error | null = null

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await chrome.runtime.sendMessage(req)
    } catch (err: any) {
      lastError = err
      console.warn(`[BiliAsk:CS] sendMessage attempt ${i + 1} failed:`, err.message)

      if (err.message?.includes('Extension context invalidated')) {
        // Extension was reloaded — no point retrying
        throw new Error('插件已更新或重载，请刷新页面后重试')
      }

      if (i < MAX_RETRIES - 1) {
        // Wait before retry (exponential backoff)
        await new Promise((r) => setTimeout(r, 500 * (i + 1)))
      }
    }
  }

  throw lastError || new Error('Unknown sendMessage error')
}

async function initExtension(): Promise<void> {
  injectStyles()

  const floatBtn = createFloatingButton()
  const chatPanel = new ChatPanel()

  // Click: toggle panel, sync position first
  floatBtn.el.addEventListener('click', () => {
    chatPanel.syncToButton(floatBtn.getTop())
    chatPanel.toggle()
  })

  // Keep panel pinned to button while dragging
  floatBtn.onDrag((top: number) => {
    if (!chatPanel.visible) return
    chatPanel.syncToButton(top)
  })

  // Re-sync on window resize
  window.addEventListener('resize', () => {
    if (chatPanel.visible) {
      chatPanel.syncToButton(floatBtn.getTop())
    }
  })

  chatPanel.setSendHandler(async (userMessage: string) => {
    chatPanel.showLoading()

    try {
      const videoContext = await requestVideoData()

      const chatRequest: ChatRequest = {
        type: 'CHAT_REQUEST',
        messages: chatPanel.getMessages(),
        videoContext,
      }

      const response = await sendChatRequest(chatRequest)

      chatPanel.hideLoading()

      if (response.error) {
        chatPanel.addErrorMessage(`错误: ${response.error}`)
      } else if (response.content) {
        chatPanel.addAssistantMessage(response.content)
      } else {
        chatPanel.addErrorMessage('AI 返回了空内容，请检查 API 配置')
      }
    } catch (err: any) {
      chatPanel.hideLoading()
      const msg = err.message || 'Unknown error'
      if (msg.includes('插件已更新') || msg.includes('context invalidated')) {
        chatPanel.addErrorMessage('插件上下文已失效，请刷新页面后重试')
      } else if (msg.includes('Failed to fetch') || msg.includes('Failed to connect')) {
        chatPanel.addErrorMessage('无法连接到 API，请检查 Base URL 和网络')
      } else {
        chatPanel.addErrorMessage(`请求失败: ${msg}`)
      }
    }
  })

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_UI') {
      floatBtn.el.style.display = message.visible ? '' : 'none'
      if (!message.visible) {
        chatPanel.hide()
      }
    }
  })

  console.log('[BiliAsk:CS] Initialized on:', window.location.href)
}
