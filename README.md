# 📝 AI 智能出题助手

一个基于 **Next.js + DeepSeek AI** 的智能出题与练习应用。选择学科、主题和难度，AI 自动生成题目，支持选择题、填空题和大题，自动批改并提供详细解析。

## ✨ 功能

- 🎯 **智能出题**：选择学科、主题、难度和题型，AI 自动生成高质量题目
- 📝 **多种题型**：支持选择题（单选）、填空题、简答/大题
- ✅ **自动批改**：选择题和填空题自动判断对错，大题由 AI 批改
- 📖 **详细解析**：每道题都附带 AI 生成的详细解析
- 📊 **成绩统计**：答题结束后展示成绩、正确率、错题回顾
- 🎨 **现代 UI**：响应式设计，手机和平板都能用

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

> 在 [platform.deepseek.com](https://platform.deepseek.com/api_keys) 获取 API Key。

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 📁 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # 出题 API（调用 DeepSeek 生成题目）
│   │   └── score/route.ts      # 批改 API（调用 DeepSeek 批改答案）
│   ├── globals.css             # 全局样式
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 首页
├── components/
│   ├── QuizApp.tsx             # 主应用组件（状态管理）
│   ├── SetupForm.tsx           # 出题设置表单
│   ├── QuizCard.tsx            # 答题卡片
│   └── ResultSummary.tsx       # 成绩总结
├── lib/
│   └── deepseek.ts             # DeepSeek API 客户端
└── types/
    └── index.ts                # TypeScript 类型定义
```

## 🛠️ 技术栈

- **前端框架**：Next.js 16 + React 19
- **样式**：Tailwind CSS 4
- **AI**：DeepSeek API（通过 OpenAI SDK 兼容调用）
- **语言**：TypeScript

## 📱 响应式支持

应用已适配移动端、平板和桌面端，在手机浏览器中打开即可使用。
