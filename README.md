# bilibili_ask — B站视频 AI 问答助手

基于 B 站视频字幕内容的 AI 问答 Chrome 浏览器扩展，支持任意 OpenAI 兼容 API。

## 功能

- 自动提取 B 站视频字幕（通过 Bilibili API）
- 根据当前播放进度，智能选取相关字幕片段作为上下文
- 支持任意 OpenAI 兼容 API（OpenAI、DeepSeek、通义千问、Ollama 等）
- 流式输出 AI 回复，Markdown 实时渲染
- 浮动聊天面板，深色主题，B 站粉配色
- 按钮可拖拽，位置自动持久化（localStorage）
- 全屏模式下自动迁移面板至全屏容器，无缝跟随
- 面板智能定位（按钮上方/下方/居中），窗口 resize 自适应
- 可配置模型、Temperature、上下文数量等参数
- Chrome 同步存储，设置跨设备同步

## 工作原理

1. 打开 B 站视频页面时，扩展通过 MAIN world 脚本读取 `window.__INITIAL_STATE__` 获取视频元数据
2. 调用 Bilibili API 获取视频字幕列表及内容
3. 根据当前播放时间，截取前后各 N 条字幕作为 AI 上下文
4. 构建包含视频标题、简介、字幕的系统提示，发送至 OpenAI 兼容 API
5. **通过 Chrome Port 长连接流式接收并渲染 AI 回复**（SSE → `ChatStreamChunk` 逐片推送）

## 项目结构

```
├── src/
│   ├── background.ts          # Service Worker，处理 Port 流式请求与消息代理
│   ├── content.ts             # ISOLATED world 内容脚本（入口，编排全屏/拖拽/流式逻辑）
│   ├── pack-bridge.ts         # MAIN world 脚本，读取 window.__INITIAL_STATE__
│   ├── pack.ts                # 字幕提取与过滤逻辑
│   ├── chat-panel.ts          # 聊天面板 UI（按钮、面板、拖拽、Markdown、样式注入）
│   ├── popup.ts / popup.html   # 扩展弹窗
│   ├── options.ts / options.html # 设置页面
│   ├── types.ts               # 类型定义、默认设置、Port 流式消息类型
│   ├── agent/
│   │   ├── index.ts           # AI 问答入口，组装系统提示，流式/非流式两种方式
│   │   ├── prompt.ts          # 系统提示构建（视频信息 + 字幕时间轴）
│   │   └── providers.ts       # OpenAI 兼容 API 请求（fetch + SSE 流解析）
│   └── utils/
│       └── storage.ts         # chrome.storage 封装
├── manifest.json              # Chrome 扩展清单 (Manifest V3)
├── webpack.config.js
├── tsconfig.json
└── package.json
```

## 通信架构

```
content.ts (ISOLATED)
    │
    │  chrome.runtime.connect({ name: 'chat-stream' })  ← Port 长连接
    │
    ▼
background.ts (Service Worker)
    │
    │  POST /v1/chat/completions  (stream: true)
    │  SSE → TextDecoder → yield chunk
    │
    ▼
content.ts  ← port.onMessage
    │
    │  ChatStreamChunk  →  appendStreamingText()
    │  ChatStreamDone   →  finishStreamingBubble()
    │  ChatStreamError  →  addErrorMessage()
    ▼
chat-panel.ts  (markdown 渲染)
```

## 快速开始

1. **安装依赖**

   ```bash
   npm install
   ```

2. **构建**

   ```bash
   npm run build
   ```

3. **加载扩展**

   - 打开 `chrome://extensions/`
   - 启用「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择 `dist/` 目录

4. **配置**

   - 点击扩展图标 → ⚙ 设置
   - 填入 API 地址、Key、模型等参数
   - 保存

5. **使用**

   - 打开任意 B 站视频页面（`https://*.bilibili.com/video/*`）
   - 点击右下角粉色浮动按钮，打开聊天面板
   - 输入问题，AI 将基于当前视频字幕流式回答
   - 可拖拽按钮到任意位置；双击按钮恢复默认位置
   - 进入全屏播放时，面板和按钮自动跟随

## 配置项

| 配置 | 默认值 | 说明 |
|------|--------|------|
| Base URL | `https://api.openai.com` | API 地址 |
| API Key | - | 你的 API 密钥 |
| Model | `gpt-4o` | 模型名称 |
| Temperature | 0.7 | 生成随机性 (0-2) |
| Max Tokens | 2048 | 最大输出 token 数 |
| 字幕上下文数量 | 20 | 播放时间前后各取 N 条字幕 |
| System Prompt | 内置中文提示 | 自定义系统提示词 |

## 支持的 API

兼容 OpenAI Chat Completions 流式格式的任意 API：

- [OpenAI](https://platform.openai.com/) — `https://api.openai.com`
- [DeepSeek](https://platform.deepseek.com/) — `https://api.deepseek.com`
- [通义千问](https://dashscope.aliyun.com/) — `https://dashscope.aliyuncs.com/compatible-mode`
- 其他兼容接口（Ollama、vLLM 等自部署服务）

## 开发

```bash
npm run dev     # 开发模式，文件变更自动构建
npm run build   # 生产构建
npm run clean   # 清理 dist/
```

## License

MIT
