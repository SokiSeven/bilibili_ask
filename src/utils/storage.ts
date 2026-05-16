import { AppSettings, DEFAULT_SETTINGS } from '../types'

const KEY = 'settings'

export function getSettings(): Promise<AppSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([KEY], (result) => {
      resolve(result[KEY] || DEFAULT_SETTINGS)
    })
  })
}

export function saveSettings(partial: Partial<AppSettings>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([KEY], (result) => {
      const current: AppSettings = result[KEY] || DEFAULT_SETTINGS
      const merged = { ...current, ...partial }
      chrome.storage.sync.set({ [KEY]: merged }, resolve)
    })
  })
}
