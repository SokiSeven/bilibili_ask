// get aid bvid cid from window_initial_state
function getBilibiliVideoMeta() {
  const state = (window as any).__INITIAL_STATE__ // __INITIAL_STATE__是b站页面自定义注入的全局变量
  if (!state?.videoData) {
    return null
  }
  return {
    "aid": state.videoData.aid,
    "bvid": state.videoData.bvid,
    "cid": state.videoData.cid,
    "title": state.videoData.title,
    "desc": state.videoData.desc,
     }
}

async function fetchSubtitleList(aid: number, cid: number) {
  const burl = `https://api.bilibili.com/x/player/v2?aid=${aid}&cid=${cid}`
  const resp = await fetch(burl, {
    credentials: 'include',
  })
  const data = await resp.json()
  console.log(data)
  return data.data?.subtitle?.subtitles || []
}

async function fetchSubtitleJSON(subtitleURL: string) {
  const fullURL = `https:${subtitleURL}`
  const resp = await fetch(fullURL)
  const data = await resp.json()
  console.log(data)
  return data
}

interface subtitleInfo {
  content: string
  from: number // 字幕出现时间
  to: number //字幕消失时间
  sid: number // 字幕id
  location: number // 字幕显示的位置
  music: number // 1=是歌词/音乐 0=普通字幕
}

// 返回当前视频的播放时间
async function getCurVideoTime() {
  return document.querySelector('video')?.currentTime || 0
}

async function filterSubtitle(subtitleList: subtitleInfo[], curTime: number, n: number = 10) {
  if (curTime == 0) {
    curTime = await getCurVideoTime()
  } 
  if (!subtitleList || subtitleList.length == 0) {
    console.error("subtitleList is empty, check if subtitle is enabled")
    return []
  }
  // 筛选在当前时间范围内的2*n条字幕, 在当前时间之前的n条字幕, 在当前时间之后的n条字幕
  let candidates = []
  let center = 0
  for (const [index, info] of subtitleList.entries()) {
    if (info.from <= curTime && info.to >= curTime) {
      center = index
      break
    }
  }
  candidates = subtitleList.slice(center - n, center + n + 1)
  return candidates
}

export async function pack() {
  // 获取当前视频元数据
  const meta = getBilibiliVideoMeta()
  if (!meta) {
    console.error('Failed to get video meta')
    return
  }
  console.log(meta)
  // 通过cid和aid获取视频字幕列表
  const subtitleList = await fetchSubtitleList(meta.aid, meta.cid)
  // 遍历每个字幕, 并获取字幕内容
  const stInfoArr: subtitleInfo[] = []
  for (const tt of subtitleList) {
    const url = tt.subtitle_url
    const data = await fetchSubtitleJSON(url)
    stInfoArr.push(...data.body)
  }
  // 筛选字幕 
  const final = await filterSubtitle(stInfoArr, await getCurVideoTime(), 10)
  return {
    "subtitle": final,
    "title": meta.title,
    "desc": meta.desc,
  }
}

