# B站视频助手 - AI Q&A

基于 B 站视频字幕内容的 AI 问答 Chrome 浏览器扩展，支持任意 OpenAI 兼容 API。

## 功能

- 自动提取 B 站视频字幕（通过 Bilibili API）
- 根据当前播放进度，智能选取相关字幕片段作为上下文
- 支持任意 OpenAI 兼容 API（OpenAI、DeepSeek、通义千问等）
- 浮动聊天面板，Markdown 渲染，深色主题
- 可配置模型、Temperature、上下文数量等参数
- Chrome 同步存储，设置跨设备同步

## 工作原理

1. 打开 B 站视频页面时，扩展通过 MAIN world 脚本读取 `window.__INITIAL_STATE__` 获取视频元数据
2. 调用 Bilibili API 获取视频字幕列表及内容
3. 根据当前播放时间，截取前后各 N 条字幕作为 AI 上下文
4. 构建包含视频标题、简介、字幕的系统提示，发送至 OpenAI 兼容 API
5. 流式展示 AI 回复（Markdown 渲染）

## 项目结构

```
├── src/
│   ├── background.ts          # Service Worker，处理 API 请求与消息代理
│   ├── content.ts             # ISOLATED world 内容脚本
│   ├── pack-bridge.ts         # MAIN world 脚本，读取 window.__INITIAL_STATE__
│   ├── pack.ts                # 字幕提取与过滤逻辑
│   ├── chat-panel.ts          # 聊天面板 UI（按钮、面板、样式注入）
│   ├── popup.ts / popup.html   # 扩展弹窗
│   ├── options.ts / options.html # 设置页面
│   ├── types.ts               # 类型定义与默认设置
│   ├── agent/
│   │   ├── index.ts           # AI 问答入口，组装系统提示
│   │   ├── prompt.ts          # 系统提示构建
│   │   └── providers.ts       # OpenAI 兼容 API 请求
│   └── utils/
│       └── storage.ts         # chrome.storage 封装
├── manifest.json              # Chrome 扩展清单 (Manifest V3)
├── webpack.config.js
├── tsconfig.json
└── package.json
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
   - 输入问题，AI 将基于当前视频字幕进行回答

## 配置项

| 配置 | 默认值 | 说明 |
|------|--------|------|
| Base URL | `https://api.openai.com` | API 地址 |
| API Key | - | 你的 API 密钥 |
| Model | `gpt-4o` | 模型名称 |
| Temperature | 0.7 | 生成随机性 (0-2) |
| Max Tokens | 2048 | 最大输出 token 数 |
| 字幕上下文数量 | 20 | 播放时间前后各取 10 条字幕 |
| System Prompt | 内置中文提示 | 自定义系统提示词 |

## 支持的 API

兼容 OpenAI Chat Completions 格式的任意 API：

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
