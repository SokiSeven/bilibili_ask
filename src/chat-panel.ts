import { ChatMessage, VideoContext } from './types'

const STYLE_ID = 'bili-ask-styles'
const PANEL_ID = 'bili-ask-chat-panel'
const BTN_ID = 'bili-ask-float-btn'

export function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return

  const css = `
#${BTN_ID} {
  position: fixed;
  bottom: 120px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fb7299, #ff6b9d);
  border: none;
  cursor: pointer;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(251, 114, 153, 0.45);
  transition: transform 0.25s, box-shadow 0.25s;
  padding: 0;
}
#${BTN_ID}:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(251, 114, 153, 0.6);
}
#${BTN_ID} svg {
  width: 26px;
  height: 26px;
  fill: #fff;
}

#${PANEL_ID} {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 420px;
  height: 560px;
  background: #1e1e2e;
  border-radius: 16px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  transition: opacity 0.25s, transform 0.25s;
}
#${PANEL_ID}.${PANEL_ID}--hidden {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
}

.${PANEL_ID}__header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #2a2a3c;
  gap: 10px;
  flex-shrink: 0;
}
.${PANEL_ID}__title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #fb7299;
}
.${PANEL_ID}__subtitle {
  font-size: 11px;
  color: #999;
  font-weight: 400;
}
.${PANEL_ID}__btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.${PANEL_ID}__btn--icon {
  background: transparent;
  color: #aaa;
  font-size: 16px;
}
.${PANEL_ID}__btn--icon:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.${PANEL_ID}__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.${PANEL_ID}__messages::-webkit-scrollbar {
  width: 4px;
}
.${PANEL_ID}__messages::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}

.${PANEL_ID}__msg {
  max-width: 88%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
  animation: biliAskFadeIn 0.2s ease;
}
@keyframes biliAskFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.${PANEL_ID}__msg--user {
  align-self: flex-end;
  background: #fb7299;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.${PANEL_ID}__msg--assistant {
  align-self: flex-start;
  background: #2a2a3c;
  color: #e0e0e0;
  border-bottom-left-radius: 4px;
}
.${PANEL_ID}__msg--error {
  align-self: center;
  background: rgba(255,80,80,0.15);
  color: #ff6b6b;
  font-size: 12px;
  max-width: 95%;
}
.${PANEL_ID}__msg--system {
  align-self: center;
  background: transparent;
  color: #666;
  font-size: 12px;
}
.${PANEL_ID}__msg pre {
  background: #111;
  border-radius: 8px;
  padding: 10px;
  overflow-x: auto;
  margin: 6px 0;
  font-size: 12px;
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
}
.${PANEL_ID}__msg code {
  background: rgba(255,255,255,0.1);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}
.${PANEL_ID}__msg pre code {
  background: transparent;
  padding: 0;
}
.${PANEL_ID}__msg p {
  margin: 4px 0;
}

.${PANEL_ID}__input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: #2a2a3c;
  flex-shrink: 0;
}
.${PANEL_ID}__input {
  flex: 1;
  resize: none;
  border: 1px solid #3a3a4c;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
  background: #1e1e2e;
  color: #e0e0e0;
  outline: none;
  max-height: 100px;
  min-height: 40px;
  line-height: 1.4;
  transition: border-color 0.15s;
}
.${PANEL_ID}__input:focus {
  border-color: #fb7299;
}
.${PANEL_ID}__input::placeholder {
  color: #666;
}
.${PANEL_ID}__send {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: #fb7299;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.${PANEL_ID}__send:hover {
  background: #ff5c85;
}
.${PANEL_ID}__send:active {
  transform: scale(0.95);
}
.${PANEL_ID}__send:disabled {
  background: #555;
  cursor: not-allowed;
  transform: none;
}

/* Loading dots */
.${PANEL_ID}__loading {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}
.${PANEL_ID}__loading span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  animation: biliAskBounce 1.2s infinite;
}
.${PANEL_ID}__loading span:nth-child(2) { animation-delay: 0.2s; }
.${PANEL_ID}__loading span:nth-child(3) { animation-delay: 0.4s; }
@keyframes biliAskBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}
`
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

export class ChatPanel {
  private container: HTMLElement
  private messageList: HTMLElement
  private inputEl: HTMLTextAreaElement
  private sendBtn: HTMLButtonElement
  private messages: ChatMessage[] = []
  private isLoading = false
  private onSend: ((msg: string) => void) | null = null

  constructor() {
    this.container = this.buildPanel()
    document.body.appendChild(this.container)
    this.messageList = this.container.querySelector(`.${PANEL_ID}__messages`)!
    this.inputEl = this.container.querySelector(`.${PANEL_ID}__input`)!
    this.sendBtn = this.container.querySelector(`.${PANEL_ID}__send`)!
    this.bindEvents()
  }

  setSendHandler(handler: (msg: string) => void): void {
    this.onSend = handler
  }

  private buildPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.id = PANEL_ID
    panel.className = `${PANEL_ID}--hidden`
    panel.innerHTML = `
      <div class="${PANEL_ID}__header">
        <span class="${PANEL_ID}__title">🤖 B站视频助手</span>
        <span class="${PANEL_ID}__subtitle">AI Chat</span>
        <button class="${PANEL_ID}__btn ${PANEL_ID}__btn--icon" data-action="clear" title="清空对话">🗑</button>
        <button class="${PANEL_ID}__btn ${PANEL_ID}__btn--icon" data-action="close" title="关闭">✕</button>
      </div>
      <div class="${PANEL_ID}__messages">
        <div class="${PANEL_ID}__msg ${PANEL_ID}__msg--system">
          你好！我是B站视频助手，可以基于当前视频的字幕内容回答你的问题。试试问我视频讲了什么吧～
        </div>
      </div>
      <div class="${PANEL_ID}__input-wrap">
        <textarea class="${PANEL_ID}__input" placeholder="输入你的问题，按 Enter 发送…" rows="1"></textarea>
        <button class="${PANEL_ID}__send" title="发送">➤</button>
      </div>
    `
    return panel
  }

  private bindEvents(): void {
    // Header buttons
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const action = target.dataset.action
      if (action === 'close') this.hide()
      if (action === 'clear') this.clearMessages()
    })

    // Send button
    this.sendBtn.addEventListener('click', () => this.triggerSend())

    // Enter to send, Shift+Enter for newline
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.triggerSend()
      }
    })

    // Auto-resize textarea
    this.inputEl.addEventListener('input', () => {
      this.inputEl.style.height = 'auto'
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 100) + 'px'
    })
  }

  private triggerSend(): void {
    const text = this.inputEl.value.trim()
    if (!text || this.isLoading) return
    this.inputEl.value = ''
    this.inputEl.style.height = 'auto'
    this.addUserMessage(text)
    if (this.onSend) this.onSend(text)
  }

  show(): void {
    this.container.classList.remove(`${PANEL_ID}--hidden`)
  }

  hide(): void {
    this.container.classList.add(`${PANEL_ID}--hidden`)
  }

  toggle(): void {
    if (this.container.classList.contains(`${PANEL_ID}--hidden`)) {
      this.show()
    } else {
      this.hide()
    }
  }

  get visible(): boolean {
    return !this.container.classList.contains(`${PANEL_ID}--hidden`)
  }

  addUserMessage(text: string): void {
    this.messages.push({ role: 'user', content: text })
    this.appendBubble('user', text)
  }

  addAssistantMessage(text: string): void {
    this.messages.push({ role: 'assistant', content: text })
    this.appendBubble('assistant', text)
  }

  addErrorMessage(text: string): void {
    this.appendBubble('error', text)
  }

  addSystemMessage(text: string): void {
    this.appendBubble('system', text)
  }

  showLoading(): void {
    this.isLoading = true
    this.sendBtn.disabled = true
    const el = document.createElement('div')
    el.className = `${PANEL_ID}__msg ${PANEL_ID}__msg--assistant`
    el.innerHTML = `<div class="${PANEL_ID}__loading"><span></span><span></span><span></span></div>`
    el.dataset.loading = 'true'
    this.messageList.appendChild(el)
    this.scrollBottom()
  }

  hideLoading(): void {
    this.isLoading = false
    this.sendBtn.disabled = false
    const loader = this.messageList.querySelector('[data-loading="true"]')
    if (loader) loader.remove()
  }

  clearMessages(): void {
    this.messages = []
    this.messageList.innerHTML = ''
    this.addSystemMessage('对话已清空，继续提问吧～')
  }

  getMessages(): ChatMessage[] {
    return this.messages
  }

  private appendBubble(role: string, text: string): void {
    const el = document.createElement('div')
    el.className = `${PANEL_ID}__msg ${PANEL_ID}__msg--${role}`
    if (role === 'assistant') {
      el.innerHTML = renderMarkdown(text)
    } else {
      el.textContent = text
    }
    this.messageList.appendChild(el)
    this.scrollBottom()
  }

  private scrollBottom(): void {
    requestAnimationFrame(() => {
      this.messageList.scrollTop = this.messageList.scrollHeight
    })
  }
}

export function createFloatingButton(): HTMLElement {
  const btn = document.createElement('button')
  btn.id = BTN_ID
  btn.title = 'B站视频助手 — 点击提问'
  // B站-style video play icon
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M21.6 10.3L7.5 1.2C6.7.7 5.7.7 4.9 1.2c-.8.5-1.3 1.4-1.3 2.3v16.9c0 .9.5 1.8 1.3 2.3.4.2.8.4 1.3.4.4 0 .9-.1 1.3-.4l14.1-9.1c.7-.5 1.2-1.3 1.2-2.1s-.5-1.6-1.2-2.2zM3.6 3.7c.1-.1.2-.1.3-.1.1 0 .3 0 .4.1L18.4 12c.1.1.2.2.2.3 0 .1-.1.2-.2.3L4.3 21.8c-.1.1-.2.1-.4.1-.1 0-.3 0-.4-.1-.1-.1-.1-.2-.1-.3V4c0-.1 0-.2.1-.3h.1zM10 16.8l6.7-4.5L10 7.8v9z"/></svg>`
  document.body.appendChild(btn)
  return btn
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks: ```code```
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<pre><code>${escaped.trim()}</code></pre>`
  })

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic: *text*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Inline links: [text](url)
  html = html.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#fb7299;">$1</a>')

  // Line breaks → paragraphs
  html = html
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

  return html
}
