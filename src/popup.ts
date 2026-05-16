import { AppSettings, DEFAULT_SETTINGS } from './types'

document.addEventListener('DOMContentLoaded', async () => {
  const floatToggle = document.getElementById('floatToggle') as HTMLInputElement
  const apiStatus = document.getElementById('apiStatus')!
  const apiDot = document.getElementById('apiDot')!
  const apiModel = document.getElementById('apiModel')!
  const pageStatus = document.getElementById('pageStatus')!
  const pageDot = document.getElementById('pageDot')!
  const pageUrl = document.getElementById('pageUrl')!
  const optionsLink = document.getElementById('optionsLink') as HTMLAnchorElement
  const openChatBtn = document.getElementById('openChatBtn')!

  // --- settings ---
  const stored = await chrome.storage.sync.get(['settings'])
  const settings: AppSettings = stored.settings || DEFAULT_SETTINGS

  if (settings.apiKey) {
    apiStatus.textContent = '已连接'
    apiDot.className = 'status-pill__dot status-pill__dot--on'
    apiModel.textContent = settings.model
  } else {
    apiStatus.textContent = '未配置'
    apiDot.className = 'status-pill__dot status-pill__dot--off'
    apiModel.textContent = '请先设置'
    apiModel.className = 'main-card__val main-card__val--warn'
  }

  // --- current tab ---
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.url?.includes('bilibili.com/video/')) {
    pageStatus.textContent = '视频页'
    pageDot.className = 'status-pill__dot status-pill__dot--on'
    pageUrl.textContent = tab.title?.slice(0, 30) || 'bilibili'
  } else if (tab?.url?.includes('bilibili.com')) {
    pageStatus.textContent = 'bilibili其他'
    pageDot.className = 'status-pill__dot status-pill__dot--warn'
    pageUrl.textContent = '非视频详情页'
    pageUrl.className = 'main-card__val main-card__val--warn'
  } else {
    pageStatus.textContent = '非bilibili'
    pageDot.className = 'status-pill__dot status-pill__dot--off'
    pageUrl.textContent = '请在bilibili使用'
    pageUrl.className = 'main-card__val main-card__val--warn'
  }

  // --- float toggle ---
  const stored2 = await chrome.storage.sync.get(['floatVisible'])
  const visible = stored2.floatVisible !== false
  floatToggle.checked = visible

  floatToggle.addEventListener('change', () => {
    const newVisible = floatToggle.checked
    chrome.storage.sync.set({ floatVisible: newVisible })
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_UI', visible: newVisible }).catch(() => {})
    }
  })

  // --- options ---
  optionsLink.addEventListener('click', (e) => {
    e.preventDefault()
    chrome.runtime.openOptionsPage()
  })

  // --- open chat ---
  openChatBtn.addEventListener('click', () => {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_UI', visible: true }).catch(() => {
        pageStatus.textContent = '请刷新'
        pageDot.className = 'status-pill__dot status-pill__dot--off'
      })
      chrome.storage.sync.set({ floatVisible: true })
      floatToggle.checked = true
    }
  })
})
