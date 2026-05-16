import { AppSettings, VideoContext, ChatMessage } from '../types'
import { buildSystemPrompt } from './prompt'
import { chatCompletion, chatCompletionStream } from './providers'

export async function askAI(
  settings: AppSettings,
  videoContext: VideoContext,
  messages: ChatMessage[]
): Promise<string> {
  const systemPrompt = buildSystemPrompt(settings, videoContext)
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]
  return chatCompletion(settings, allMessages)
}

export async function* askAIStream(
  settings: AppSettings,
  videoContext: VideoContext,
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const systemPrompt = buildSystemPrompt(settings, videoContext)
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ]
  yield* chatCompletionStream(settings, allMessages)
}
