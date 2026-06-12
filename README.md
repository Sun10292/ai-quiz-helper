# 📝 AI 智能出题助手

一个基于 **Next.js + DeepSeek AI** 的智能出题与练习应用。选择学科、主题和难度，AI 自动生成题目，支持选择题、填空题和大题，自动批改并提供详细解析。

## ✨ 功能

- 🎯 **智能出题**：自由输入学科和知识点，AI 自动生成高质量题目
- 📝 **多种题型**：支持选择题（单选）、填空题、简答/大题
- ✅ **自动批改**：选择题和填空题自动判断对错，大题由 AI 批改
- 📖 **详细解析**：每道题都附带 AI 生成的详细解析
- 💬 **追问 AI**：批改后可针对题目追问，AI 老师深入解答
- 📋 **历史记录**：做题记录自动保存到浏览器本地，关掉也不丢
- ⚠️ **薄弱分析**：自动统计错题，出题时针对性强化薄弱环节
- 🔄 **自由导航**：上一题/下一题随意切换，已答题目保留结果
- 📊 **成绩统计**：答题结束后展示成绩、正确率、错题回顾
- 🎨 **响应式设计**：手机、平板、电脑都能用

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 DeepSeek API Key

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的 DeepSeek API Key：

```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

> 在 [platform.deepseek.com](https://platform.deepseek.com/api_keys) 获取 API Key。DeepSeek 新用户赠送免费额度，做一套题花费不到 1 分钱。

### 3. 启动

**方式一：一键启动（推荐）**

双击 `start.bat`，自动启动服务并打开浏览器。

**方式二：命令行**

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 📁 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # 追问 API（AI 老师答疑）
│   │   ├── generate/route.ts      # 出题 API（调用 DeepSeek 生成题目）
│   │   └── score/route.ts         # 批改 API（调用 DeepSeek 批改答案）
│   ├── globals.css                # 全局样式
│   ├── layout.tsx                 # 根布局
│   └── page.tsx                   # 首页
├── components/
│   ├── QuizApp.tsx                # 主应用组件（状态管理）
│   ├── SetupForm.tsx              # 出题设置表单 + 薄弱环节展示
│   ├── QuizCard.tsx               # 答题卡片 + 追问 AI
│   ├── ResultSummary.tsx          # 成绩总结
│   └── HistoryPanel.tsx           # 历史记录面板
├── lib/
│   ├── deepseek.ts                # DeepSeek API 客户端
│   └── storage.ts                 # 本地存储 + 薄弱分析
└── types/
    └── index.ts                   # TypeScript 类型定义
```

## 🛠️ 技术栈

- **前端框架**：Next.js 16 + React 19
- **样式**：Tailwind CSS 4
- **AI**：DeepSeek API（通过 OpenAI SDK 兼容调用）
- **语言**：TypeScript

## 📱 响应式支持

应用已适配移动端、平板和桌面端，在手机浏览器中打开即可使用。
