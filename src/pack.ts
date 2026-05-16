// get aid bvid cid from window.__INITIAL_STATE__
function getBilibiliVideoMeta() {
  const state = (window as any).__INITIAL_STATE__
  if (!state?.videoData) {
    console.error('[BiliAsk:MAIN] __INITIAL_STATE__.videoData not found — not a B站 video page?')
    return null
  }
  return {
    aid: state.videoData.aid,
    bvid: state.videoData.bvid,
    cid: state.videoData.cid,
    title: state.videoData.title,
    desc: state.videoData.desc,
  }
}

async function fetchSubtitleList(aid: number, cid: number) {
  const url = `https://api.bilibili.com/x/player/v2?aid=${aid}&cid=${cid}`
  try {
    const resp = await fetch(url, { credentials: 'include' })
    if (!resp.ok) {
      console.error(`[BiliAsk:MAIN] B站 subtitle list API error: HTTP ${resp.status} ${resp.statusText}`)
      return []
    }
    const data = await resp.json()
    const subtitles = data.data?.subtitle?.subtitles
    if (!subtitles || subtitles.length === 0) {
      console.error('[BiliAsk:MAIN] Subtitle list is empty — this video may have no subtitles')
      return []
    }
    console.log('[BiliAsk:MAIN] Subtitle list count:', subtitles.length,
      subtitles.map((s: any) => ({ lang: s.lan_doc, url: s.subtitle_url })))
    return subtitles
  } catch (err: any) {
    console.error('[BiliAsk:MAIN] fetchSubtitleList failed:', err.message || err)
    return []
  }
}

async function fetchSubtitleJSON(subtitleURL: string) {
  // B站 subtitle_url 可能是协议相对路径 `//...` 或完整 URL `https://...`
  let fullURL: string
  if (subtitleURL.startsWith('http://') || subtitleURL.startsWith('https://')) {
    fullURL = subtitleURL
  } else if (subtitleURL.startsWith('//')) {
    fullURL = `https:${subtitleURL}`
  } else {
    fullURL = subtitleURL
  }

  console.log('[BiliAsk:MAIN] Fetching subtitle JSON, raw url:', subtitleURL)

  try {
    const resp = await fetch(fullURL)
    if (!resp.ok) {
      console.error(`[BiliAsk:MAIN] Subtitle JSON HTTP ${resp.status} — url: ${fullURL}`)
      return null
    }
    const contentType = resp.headers.get('content-type') || ''
    if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
      const preview = await resp.text().then(t => t.slice(0, 100))
      console.error(`[BiliAsk:MAIN] Subtitle JSON unexpected content-type: ${contentType}, body preview: ${preview}`)
      return null
    }
    const data = await resp.json()
    if (!data || !data.body || data.body.length === 0) {
      console.error('[BiliAsk:MAIN] Subtitle JSON body is empty — url:', fullURL)
      return null
    }
    console.log('[BiliAsk:MAIN] Subtitle body items:', data.body.length)
    return data
  } catch (err: any) {
    console.error('[BiliAsk:MAIN] fetchSubtitleJSON failed:', err.message || err)
    return null
  }
}

interface subtitleInfo {
  content: string
  from: number
  to: number
  sid: number
  location: number
  music: number
}

// 返回当前视频的播放时间
async function getCurVideoTime() {
  return document.querySelector('video')?.currentTime || 0
}

// 筛选当前时间范围的 2*n 条字幕
async function filterSubtitle(subtitleList: subtitleInfo[], curTime: number, n: number = 10) {
  if (curTime === 0) {
    curTime = await getCurVideoTime()
  }
  if (!subtitleList || subtitleList.length === 0) {
    console.error('[BiliAsk:MAIN] filterSubtitle: subtitleList is empty, nothing to filter')
    return []
  }

  let center = 0
  for (const [index, info] of subtitleList.entries()) {
    if (info.from <= curTime && info.to >= curTime) {
      center = index
      break
    }
  }
  const start = Math.max(0, center - n)
  const end = Math.min(subtitleList.length, center + n + 1)
  const candidates = subtitleList.slice(start, end)
  console.log(`[BiliAsk:MAIN] Filtered ${candidates.length} subtitles around ${curTime.toFixed(1)}s (indices ${start}-${end})`)
  return candidates
}

export async function pack() {
  const meta = getBilibiliVideoMeta()
  if (!meta) {
    console.error('[BiliAsk:MAIN] pack() aborted: no video metadata available')
    return null
  }
  console.log('[BiliAsk:MAIN] Video meta:', { aid: meta.aid, bvid: meta.bvid, cid: meta.cid, title: meta.title })

  // 通过 cid 和 aid 获取视频字幕列表
  const subtitleList = await fetchSubtitleList(meta.aid, meta.cid)
  if (subtitleList.length === 0) {
    console.error('[BiliAsk:MAIN] No subtitles available for this video (aid=%d, cid=%d)', meta.aid, meta.cid)
  }

  // 遍历每个字幕，获取字幕内容
  const stInfoArr: subtitleInfo[] = []
  for (const tt of subtitleList) {
    const data = await fetchSubtitleJSON(tt.subtitle_url)
    if (data) {
      stInfoArr.push(...data.body)
    }
  }

  if (stInfoArr.length === 0) {
    console.error('[BiliAsk:MAIN] All subtitle fetches returned empty — total subtitles parsed: 0')
  } else {
    console.log('[BiliAsk:MAIN] Total subtitle entries parsed:', stInfoArr.length)
  }

  // 筛选字幕
  const final = await filterSubtitle(stInfoArr, await getCurVideoTime(), 10)

  return {
    subtitle: final,
    title: meta.title,
    desc: meta.desc,
  }
}
