export interface AppSettings {
  baseURL: string
  apiKey: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  subtitleContextCount: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  baseURL: 'https://api.openai.com',
  apiKey: '',
  model: 'gpt-4o',
  systemPrompt: `你是一个B站视频助手，根据提供的视频信息（标题、简介、字幕）回答用户的问题。
规则：
1. 根据提供的字幕内容回答，不要编造信息
2. 如果字幕中没有相关信息，诚实告知用户
3. 回答简洁清晰，使用中文
4. 可以引用字幕中的具体时间点`,
  temperature: 0.7,
  maxTokens: 2048,
  subtitleContextCount: 20,
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SubtitleInfo {
  content: string
  from: number
  to: number
  sid: number
  location: number
  music: number
}

export interface VideoContext {
  title: string
  desc: string
  subtitle: SubtitleInfo[]
  currentTime: number
}

// content script → background
export interface ChatRequest {
  type: 'CHAT_REQUEST'
  messages: ChatMessage[]
  videoContext: VideoContext
}

// background → content script
export interface ChatResponse {
  type: 'CHAT_RESPONSE'
  content: string
  error?: string
}

// popup → content script
export interface ToggleRequest {
  type: 'TOGGLE_UI'
  visible: boolean
}

// content script → popup / background state query
export interface StateQuery {
  type: 'GET_STATE'
}

export type RuntimeMessage = ChatRequest | ToggleRequest | StateQuery

// --- Port-based streaming messages (content script ⇄ background) ---

export interface ChatStreamRequest {
  type: 'CHAT_STREAM_REQUEST'
  messages: ChatMessage[]
  videoContext: VideoContext
}

export interface ChatStreamChunk {
  type: 'CHAT_STREAM_CHUNK'
  content: string
}

export interface ChatStreamDone {
  type: 'CHAT_STREAM_DONE'
}

export interface ChatStreamError {
  type: 'CHAT_STREAM_ERROR'
  error: string
}

export type PortMessage = ChatStreamRequest | ChatStreamChunk | ChatStreamDone | ChatStreamError
