import { pack } from './pack'

console.log('[BiliAsk:MAIN] Bridge loaded')

window.addEventListener('message', async (event) => {
  if (event.source !== window) return
  if (event.data?.type === 'BILIASK_GET_VIDEO_DATA') {
    const { requestId } = event.data
    try {
      const currentTime = document.querySelector('video')?.currentTime || 0
      const ctx = await pack()
      const payload = ctx
        ? { ...ctx, currentTime }
        : { title: document.title, desc: '', subtitle: [], currentTime }
      window.postMessage(
        { type: 'BILIASK_VIDEO_DATA', requestId, data: payload },
        '*'
      )
    } catch (err) {
      window.postMessage(
        {
          type: 'BILIASK_VIDEO_DATA',
          requestId,
          data: {
            title: document.title,
            desc: '',
            subtitle: [],
            currentTime: document.querySelector('video')?.currentTime || 0,
          },
          error: (err as Error).message,
        },
        '*'
      )
    }
  }
})
