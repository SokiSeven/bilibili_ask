import { VideoContext } from '../types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function buildSystemPrompt(
  settings: { systemPrompt: string },
  ctx: VideoContext
): string {
  const timeStr = formatTime(ctx.currentTime)

  let subtitleText = ''
  if (ctx.subtitle && ctx.subtitle.length > 0) {
    subtitleText = ctx.subtitle
      .map((s) => `[${formatTime(s.from)} - ${formatTime(s.to)}] ${s.content}`)
      .join('\n')
  }

  return `${settings.systemPrompt}

=== 视频信息 ===
标题: ${ctx.title || '无'}
简介: ${ctx.desc || '无'}
当前播放时间: ${timeStr}

=== 相关字幕 ===
${subtitleText || '暂无字幕'}

请根据以上信息回答用户的问题。`
}
