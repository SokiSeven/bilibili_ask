import { getSettings, saveSettings } from './utils/storage'
import { DEFAULT_SETTINGS } from './types'

// --- DOM refs ---
const $ = (id: string) => document.getElementById(id)! as HTMLElement

const baseURLEl = $('baseURL') as HTMLInputElement
const apiKeyEl = $('apiKey') as HTMLInputElement
const modelEl = $('model') as HTMLInputElement
const temperatureEl = $('temperature') as HTMLInputElement
const temperatureValEl = $('temperatureVal')
const maxTokensEl = $('maxTokens') as HTMLInputElement
const subtitleContextCountEl = $('subtitleContextCount') as HTMLInputElement
const systemPromptEl = $('systemPrompt') as HTMLTextAreaElement
const saveBtn = $('saveBtn')
const resetBtn = $('resetBtn')
const toastEl = $('toast')

// --- Toast ---
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(msg: string, success: boolean): void {
  if (toastTimer) clearTimeout(toastTimer)
  toastEl.textContent = msg
  toastEl.className = `toast toast--show toast--${success ? 'success' : 'error'}`
  toastTimer = setTimeout(() => { toastEl.className = 'toast' }, 2500)
}

// --- Load settings into form ---
async function loadForm(): Promise<void> {
  const s = await getSettings()
  baseURLEl.value = s.baseURL
  apiKeyEl.value = s.apiKey
  modelEl.value = s.model
  temperatureEl.value = String(s.temperature)
  temperatureValEl.textContent = String(s.temperature)
  maxTokensEl.value = String(s.maxTokens)
  subtitleContextCountEl.value = String(s.subtitleContextCount)
  systemPromptEl.value = s.systemPrompt
}

// --- Read form into partial settings ---
function readForm() {
  return {
    baseURL: baseURLEl.value,
    apiKey: apiKeyEl.value,
    model: modelEl.value,
    temperature: parseFloat(temperatureEl.value),
    maxTokens: parseInt(maxTokensEl.value, 10),
    subtitleContextCount: parseInt(subtitleContextCountEl.value, 10),
    systemPrompt: systemPromptEl.value,
  }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  await loadForm()

  // Temperature slider live display
  temperatureEl.addEventListener('input', () => {
    temperatureValEl.textContent = parseFloat(temperatureEl.value).toFixed(1)
  })

  // Save
  saveBtn.addEventListener('click', async () => {
    await saveSettings(readForm())
    showToast('设置已保存', true)
  })

  // Reset
  resetBtn.addEventListener('click', async () => {
    await saveSettings(DEFAULT_SETTINGS)
    await loadForm()
    showToast('已恢复默认设置', true)
  })
})