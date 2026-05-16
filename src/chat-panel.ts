import { ChatMessage } from './types'

const STYLE_ID = 'bili-ask-styles'
const PANEL_ID = 'bili-ask-chat-panel'
const BTN_ID = 'bili-ask-float-btn'

// --------------- injected styles ---------------
export function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return

  const css = `
/* === FLOATING BUTTON === */
#${BTN_ID} {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #fff;
  border: none;
  cursor: pointer;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04);
  transition: border-radius .25s, box-shadow .25s, transform .25s;
  padding: 0;
  overflow: hidden;
}
#${BTN_ID}:hover {
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0,0,0,.12), 0 0 0 1px rgba(251,114,153,.2);
  transform: translateY(-2px);
}
#${BTN_ID}:active {
  transform: scale(.94);
}
#${BTN_ID} svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: #fb7299;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* === CHAT PANEL === */
#${PANEL_ID} {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 400px;
  height: 540px;
  background: #fafafa;
  border-radius: 18px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 0 0 1px rgba(0,0,0,.06),
    0 8px 32px rgba(0,0,0,.12),
    0 2px 8px rgba(0,0,0,.06);
  font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
  overflow: hidden;
  transition: opacity .2s, transform .2s cubic-bezier(.34,1.56,.64,1);
  transform-origin: bottom right;
}
#${PANEL_ID}.${PANEL_ID}--hidden {
  opacity: 0;
  transform: translateY(16px) scale(.94);
  pointer-events: none;
}

/* header */
.${PANEL_ID}__header {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background: #fff;
  gap: 10px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0,0,0,.05);
}
.${PANEL_ID}__avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fb7299 0%, #ff8fb3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.${PANEL_ID}__avatar svg {
  width: 16px;
  height: 16px;
  fill: #fff;
}
.${PANEL_ID}__meta {
  flex: 1;
  min-width: 0;
}
.${PANEL_ID}__title {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  letter-spacing: .01em;
}
.${PANEL_ID}__subtitle {
  font-size: 11px;
  color: #999;
  font-weight: 400;
}
.${PANEL_ID}__btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s, color .15s;
  background: transparent;
  color: #bbb;
}
.${PANEL_ID}__btn:hover {
  background: rgba(0,0,0,.04);
  color: #666;
}

/* messages */
.${PANEL_ID}__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(251,114,153,.03) 0%, transparent 60%),
    #fafafa;
}
.${PANEL_ID}__messages::-webkit-scrollbar {
  width: 3px;
}
.${PANEL_ID}__messages::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,.08);
  border-radius: 3px;
}

/* bubbles */
.${PANEL_ID}__msg {
  max-width: 85%;
  padding: 11px 15px;
  border-radius: 14px;
  font-size: 13.5px;
  line-height: 1.65;
  word-break: break-word;
  animation: biliAskIn .25s cubic-bezier(.34,1.56,.64,1);
  letter-spacing: .01em;
}
@keyframes biliAskIn {
  from { opacity: 0; transform: translateY(10px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.${PANEL_ID}__msg--user {
  align-self: flex-end;
  background: #fb7299;
  color: #fff;
  border-bottom-right-radius: 6px;
  box-shadow: 0 2px 8px rgba(251,114,153,.2);
}
.${PANEL_ID}__msg--assistant {
  align-self: flex-start;
  background: #fff;
  color: #333;
  border-bottom-left-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.03);
}
.${PANEL_ID}__msg--error {
  align-self: center;
  background: rgba(255,71,87,.06);
  color: #e74c3c;
  font-size: 12px;
  max-width: 92%;
  border-radius: 10px;
}
.${PANEL_ID}__msg--system {
  align-self: center;
  color: #bbb;
  font-size: 12px;
  background: transparent;
  box-shadow: none;
  padding: 6px 12px;
}

/* markdown inside assistant bubble */
.${PANEL_ID}__msg pre {
  background: #f5f5f7;
  border-radius: 8px;
  padding: 12px 14px;
  overflow-x: auto;
  margin: 8px -4px;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  color: #444;
  border: 1px solid rgba(0,0,0,.04);
}
.${PANEL_ID}__msg code {
  background: rgba(0,0,0,.05);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
}
.${PANEL_ID}__msg pre code {
  background: transparent;
  padding: 0;
  border-radius: 0;
}
.${PANEL_ID}__msg p {
  margin: 3px 0;
}
.${PANEL_ID}__msg a {
  color: #fb7299;
  text-decoration: none;
  border-bottom: 1px solid rgba(251,114,153,.3);
}
.${PANEL_ID}__msg a:hover {
  border-bottom-color: #fb7299;
}

/* input area */
.${PANEL_ID}__input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid rgba(0,0,0,.05);
  flex-shrink: 0;
}
.${PANEL_ID}__input {
  flex: 1;
  resize: none;
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13.5px;
  font-family: inherit;
  background: #f5f5f7;
  color: #333;
  outline: none;
  max-height: 96px;
  min-height: 42px;
  line-height: 1.5;
  transition: background .2s, border-color .2s;
  letter-spacing: .01em;
}
.${PANEL_ID}__input:focus {
  background: #fff;
  border-color: rgba(251,114,153,.3);
}
.${PANEL_ID}__input::placeholder {
  color: #bbb;
}
.${PANEL_ID}__send {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: none;
  background: #fb7299;
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: background .15s, transform .15s, box-shadow .15s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(251,114,153,.25);
}
.${PANEL_ID}__send:hover {
  background: #ff5c85;
  box-shadow: 0 4px 12px rgba(251,114,153,.35);
}
.${PANEL_ID}__send:active {
  transform: scale(.92);
}
.${PANEL_ID}__send:disabled {
  background: #e0e0e0;
  color: #bbb;
  cursor: not-allowed;
  box-shadow: none;
}
.${PANEL_ID}__send svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: #fff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* loading */
.${PANEL_ID}__loading {
  display: flex;
  gap: 5px;
  padding: 4px 0;
}
.${PANEL_ID}__loading span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #d0d0d0;
  animation: biliAskBounce 1.2s infinite;
}
.${PANEL_ID}__loading span:nth-child(2) { animation-delay: .15s; }
.${PANEL_ID}__loading span:nth-child(3) { animation-delay: .3s; }
@keyframes biliAskBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: .4; }
  30% { transform: translateY(-9px); opacity: 1; }
}
`
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

// --------------- ChatPanel class ---------------
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
        <div class="${PANEL_ID}__avatar">
          <svg viewBox="0 0 24 24"><path d="M21.6 10.3L7.5 1.2C6.7.7 5.7.7 4.9 1.2c-.8.5-1.3 1.4-1.3 2.3v16.9c0 .9.5 1.8 1.3 2.3.4.2.8.4 1.3.4.4 0 .9-.1 1.3-.4l14.1-9.1c.7-.5 1.2-1.3 1.2-2.1s-.5-1.6-1.2-2.2z"/></svg>
        </div>
        <div class="${PANEL_ID}__meta">
          <div class="${PANEL_ID}__title">视频助手</div>
          <div class="${PANEL_ID}__subtitle">基于字幕 · AI 问答</div>
        </div>
        <button class="${PANEL_ID}__btn" data-action="clear" title="清空">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
        <button class="${PANEL_ID}__btn" data-action="close" title="关闭">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="${PANEL_ID}__messages">
        <div class="${PANEL_ID}__msg ${PANEL_ID}__msg--system">
          你好，我是视频助手。试试问我当前视频讲了什么吧
        </div>
      </div>
      <div class="${PANEL_ID}__input-wrap">
        <textarea class="${PANEL_ID}__input" placeholder="基于视频内容提问…" rows="1"></textarea>
        <button class="${PANEL_ID}__send" title="发送">
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    `
    return panel
  }

  private bindEvents(): void {
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const btn = target.closest('[data-action]') as HTMLElement | null
      if (!btn) return
      const action = btn.dataset.action
      if (action === 'close') this.hide()
      if (action === 'clear') this.clearMessages()
    })

    this.sendBtn.addEventListener('click', () => this.triggerSend())

    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.triggerSend()
      }
    })

    this.inputEl.addEventListener('input', () => {
      this.inputEl.style.height = 'auto'
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 96) + 'px'
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
    this.container.classList.contains(`${PANEL_ID}--hidden`) ? this.show() : this.hide()
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
    this.addSystemMessage('对话已清空，继续提问吧')
  }

  getMessages(): ChatMessage[] {
    return this.messages
  }

  private appendBubble(role: string, text: string): void {
    const el = document.createElement('div')
    el.className = `${PANEL_ID}__msg ${PANEL_ID}__msg--${role}`
    el[role === 'assistant' ? 'innerHTML' : 'textContent'] =
      role === 'assistant' ? renderMarkdown(text) : text
    this.messageList.appendChild(el)
    this.scrollBottom()
  }

  private scrollBottom(): void {
    requestAnimationFrame(() => {
      this.messageList.scrollTop = this.messageList.scrollHeight
    })
  }
}

// --------------- Floating button ---------------
export function createFloatingButton(): HTMLElement {
  const btn = document.createElement('button')
  btn.id = BTN_ID
  btn.title = '视频助手'
  btn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
  document.body.appendChild(btn)
  return btn
}

// --------------- Tiny markdown renderer ---------------
function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, _lang, code) =>
    `<pre><code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`)

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>')

  return html
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
}
