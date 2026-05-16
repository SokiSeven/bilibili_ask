import { AppSettings, DEFAULT_SETTINGS } from './types'

document.addEventListener('DOMContentLoaded', async () => {
  const floatToggle = document.getElementById('floatToggle') as HTMLInputElement
  const apiStatus = document.getElementById('apiStatus')!
  const pageStatus = document.getElementById('pageStatus')!
  const optionsLink = document.getElementById('optionsLink') as HTMLAnchorElement
  const openChatBtn = document.getElementById('openChatBtn')!

  // Load settings
  const stored = await chrome.storage.sync.get(['settings'])
  const settings: AppSettings = stored.settings || DEFAULT_SETTINGS

  if (settings.apiKey) {
    apiStatus.textContent = '已配置'
    apiStatus.className = 'card__value card__value--ok'
  } else {
    apiStatus.textContent = '未配置 Key'
    apiStatus.className = 'card__value card__value--error'
  }

  // Check current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.url?.includes('bilibili.com/video/')) {
    pageStatus.textContent = 'B站视频页'
    pageStatus.className = 'card__value card__value--ok'
  } else if (tab?.url?.includes('bilibili.com')) {
    pageStatus.textContent = 'B站页面'
    pageStatus.className = 'card__value card__value--warn'
  } else {
    pageStatus.textContent = '非B站页面'
    pageStatus.className = 'card__value card__value--warn'
  }

  // Float toggle
  const stored2 = await chrome.storage.sync.get(['floatVisible'])
  const visible = stored2.floatVisible !== false
  floatToggle.checked = visible

  floatToggle.addEventListener('change', () => {
    const newVisible = floatToggle.checked
    chrome.storage.sync.set({ floatVisible: newVisible })

    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_UI',
        visible: newVisible,
      }).catch(() => {
        // Content script may not be injected
      })
    }
  })

  // Options link
  optionsLink.addEventListener('click', (e) => {
    e.preventDefault()
    chrome.runtime.openOptionsPage()
  })

  // Open chat button
  openChatBtn.addEventListener('click', () => {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_UI',
        visible: true,
      }).catch(() => {
        pageStatus.textContent = '请刷新页面后重试'
        pageStatus.className = 'card__value card__value--error'
      })
      // Also trigger float button visibility state
      chrome.storage.sync.set({ floatVisible: true })
      floatToggle.checked = true
    }
  })
})
