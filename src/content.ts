import { ChatPanel, createFloatingButton, injectStyles } from './chat-panel'
import { VideoContext, ChatRequest, ChatResponse, ChatStreamRequest, PortMessage } from './types'

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
      let streaming = false

      const port = chrome.runtime.connect({ name: 'chat-stream' })

      port.onMessage.addListener((msg: PortMessage) => {
        if (msg.type === 'CHAT_STREAM_CHUNK') {
          if (!streaming) {
            chatPanel.hideLoading()
            chatPanel.startStreamingBubble()
            streaming = true
          }
          chatPanel.appendStreamingText(msg.content)
        } else if (msg.type === 'CHAT_STREAM_DONE') {
          if (!streaming) {
            chatPanel.hideLoading()
            chatPanel.startStreamingBubble()
            streaming = true
          }
          chatPanel.finishStreamingBubble()
          streaming = false
          port.disconnect()
        } else if (msg.type === 'CHAT_STREAM_ERROR') {
          chatPanel.hideLoading()
          if (streaming) {
            chatPanel.finishStreamingBubble()
            streaming = false
          }
          chatPanel.addErrorMessage(`错误: ${msg.error}`)
          port.disconnect()
        }
      })

      port.onDisconnect.addListener(() => {
        if (streaming) {
          chatPanel.finishStreamingBubble()
          streaming = false
        }
      })

      const streamRequest: ChatStreamRequest = {
        type: 'CHAT_STREAM_REQUEST',
        messages: chatPanel.getMessages(),
        videoContext,
      }

      port.postMessage(streamRequest)
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

  // --- Fullscreen: migrate button + panel into fullscreenElement ---
  let fsWrapper: HTMLElement | null = null
  let fsVideoNextSibling: Node | null = null

  document.addEventListener('fullscreenchange', () => {
    const fsEl = document.fullscreenElement as HTMLElement | null

    if (fsEl) {
      // ---------- ENTER fullscreen ----------
      console.log('[BiliAsk:CS] Entering fullscreen, target:', fsEl.tagName, fsEl.id || fsEl.className?.slice(0, 40))

      let target: HTMLElement = fsEl

      // If fullscreen is requested on <video> directly, wrap it
      if (fsEl.tagName === 'VIDEO') {
        fsVideoNextSibling = fsEl.nextSibling
        const wrapper = document.createElement('div')
        wrapper.id = 'bili-ask-fs-wrapper'
        wrapper.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;position:relative;'
        fsEl.parentNode!.insertBefore(wrapper, fsEl)
        wrapper.appendChild(fsEl)
        fsWrapper = wrapper
        target = wrapper
        console.log('[BiliAsk:CS] Wrapped <video> for fullscreen')
      }

      target.appendChild(floatBtn.el)
      chatPanel.moveToDOM(target)

      // Re-sync panel position after DOM move (layout may have shifted)
      requestAnimationFrame(() => {
        if (chatPanel.visible) chatPanel.syncToButton(floatBtn.getTop())
      })
    } else {
      // ---------- EXIT fullscreen ----------
      console.log('[BiliAsk:CS] Exiting fullscreen')

      // Restore button & panel to body
      if (floatBtn.el.parentElement !== document.body) {
        document.body.appendChild(floatBtn.el)
      }
      chatPanel.restoreToDOM(document.body)

      // Unwrap <video> if we wrapped it
      if (fsWrapper) {
        const video = fsWrapper.querySelector('video')
        if (video) {
          const parent = fsWrapper.parentNode!
          if (fsVideoNextSibling && fsVideoNextSibling.parentNode === parent) {
            parent.insertBefore(video, fsVideoNextSibling)
          } else {
            parent.appendChild(video)
          }
        }
        fsWrapper.remove()
        fsWrapper = null
        fsVideoNextSibling = null
        console.log('[BiliAsk:CS] Unwrapped <video> from fullscreen wrapper')
      }

      requestAnimationFrame(() => {
        if (chatPanel.visible) chatPanel.syncToButton(floatBtn.getTop())
      })
    }
  })

  console.log('[BiliAsk:CS] Initialized on:', window.location.href)
}
