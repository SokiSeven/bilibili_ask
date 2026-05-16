export function chatCompletion(
    settings: {baseURL: string; apiKey: string; model: string; temperature: number; maxTokens: number},
    messages: {role: string; content: string}[]
): Promise<string> {
    const url = `${settings.baseURL.replace(/\/$/, '')}/v1/chat/completions`
    console.log('[BiliAsk:BG] Calling:', url, 'model:', settings.model)

    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: settings.model,
            messages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
        }),
    }).then(res => {
        if (!res.ok) {
            return res.text().then(body => {
                throw new Error(`API error ${res.status}: ${body.slice(0, 300)}`)
            })
        }
        return res.json()
    }).then(json => {
        const content = json.choices?.[0]?.message?.content
        if (!content) {
            console.error('[BiliAsk:BG] Unexpected API response:', JSON.stringify(json).slice(0, 300))
            throw new Error('API 返回为空，请检查 model 参数是否正确')
        }
        return content
    })
}

export async function* chatCompletionStream(
    settings: {baseURL: string; apiKey: string; model: string; temperature: number; maxTokens: number},
    messages: {role: string; content: string}[]
): AsyncGenerator<string> {
    const url = `${settings.baseURL.replace(/\/$/, '')}/v1/chat/completions`
    console.log('[BiliAsk:BG] Streaming:', url, 'model:', settings.model)

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: settings.model,
            messages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: true,
        }),
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(`API error ${response.status}: ${body.slice(0, 300)}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data:')) continue

            const data = trimmed.slice(5).trim()
            if (data === '[DONE]') return

            try {
                const json = JSON.parse(data)
                const content = json.choices?.[0]?.delta?.content
                if (content) yield content
            } catch {
                // skip malformed JSON lines
            }
        }
    }
}