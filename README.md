<div align="center">

# AO3 Workskin Sandbox

> AO3 风格本地编辑与预览沙盒，专门用于快速测试 workskin 与章节排版效果。

[![Status](https://img.shields.io/badge/status-local%20demo-blue)]()
[![Stack](https://img.shields.io/badge/stack-HTML%2FCSS%2FJS-orange)]()
[![Storage](https://img.shields.io/badge/storage-localStorage-green)]()
[![Responsive](https://img.shields.io/badge/responsive-62em%20%2F%2042em-purple)]()

<br>

这是一个面向 AO3 作者的本地工具。  
当 AO3 崩了、暂时无法登录，或你不想反复在线改文时，可以先在本地完成编辑并验证 workskin 效果，再决定是否发布。
本项目基于 AO3 官方在 GitHub 发布的开源代码体系进行本地化整理与扩展实现，用于个人创作测试场景。

[功能概览](#功能概览) · [快速开始](#快速开始) · [使用流程](#使用流程) · [与 AO3 的差异](#与-ao3-的差异) · [项目结构](#项目结构) · [English](README_EN.md)

</div>

---

## 功能概览

- AO3 风格 `Edit Work` 页面（本地静态版）
- AO3 风格独立 `Preview` 页面（作品头信息 + 正文 + 评论区）
- `Save Draft`：保存到 localStorage 并自动跳转 preview
- `Preview`：保存到 localStorage 并跳转 preview
- `Edit`（preview 内）：返回编辑页并自动回填草稿
- `Tags and Language` 已绑定到 preview 展示
- `Change creator's name?` 已联动：
  - preview 作者栏（byline）
  - 右上角 `Hi, ...!`
- `Work Skin` 本地测试能力（快速看样式是否按预期生效）
- AO3 风格 `Kudos` / `Comments` / `Hide Comments` 交互（本地模拟）
- 移动端/平板适配（参考 AO3 断点）：
  - `max-width: 62em`
  - `max-width: 42em`

---

## 快速开始

1. 克隆或下载本仓库
2. 双击 `open-local.bat`（推荐）
3. 浏览器会自动打开 `http://127.0.0.1:8000/index.html`

`open-local.bat` 会优先使用 Python；如果未安装 Python，会自动回退到 Windows PowerShell 内置静态服务器。

备用方式：

1. 在项目目录手动运行 `py -m http.server 8000`
2. 浏览器打开 `http://127.0.0.1:8000/index.html`

> 说明：Rich Text 依赖 TinyMCE CDN。离线环境下会退化为 HTML 输入模式。
> 说明：`localhost` 只指“你当前这台电脑”，每个人都要在自己电脑上运行 `open-local.bat`。

---

## 使用流程

1. 在 `index.html` 填写 `Tags and Language`、正文、Work Skin 等内容
2. 点击 `Save Draft` 或 `Preview`，会保存草稿并进入 `chapter-preview.html`
3. 在 preview 检查排版和样式
4. 点击 `Edit` 返回继续修改（内容会自动回填）

---

## 与 AO3 的差异

本项目目标是“本地快速验证”，不是 1:1 复刻 AO3 后端机制。

- 已对齐：
  - AO3 风格页面结构与主要交互入口
  - 常见阅读与预览流程
  - 响应式断点思路（62em / 42em）

- 不同点：
  - 这里的 `Work Skin` 是本地文本注入预览，不是 AO3 的 `work_skin_id` 选择 + 后端清洗/限制流程
  - 所有操作都在本地完成（无账号、无服务器、无真实发布）
  - `Kudos` / 评论交互仅本地模拟，不会同步到 AO3

---

## 适用场景

- 快速测试某段 CSS / workskin 在 AO3 风格页面是否可用
- AO3 暂时不可用时继续写作和预览
- 发布前做本地预检（文本 + 标签 + 样式）

---

## 项目结构

```text
ao3-workskin-sandbox/
|- index.html              # 本地编辑页（Edit Work 风格）
|- ao3.css                 # 编辑页覆盖样式
|- ao3.js                  # 编辑页逻辑（保存/回填/跳转）
|- chapter-preview.html    # 本地预览页
|- chapter-preview.css     # 预览页覆盖样式
|- chapter-preview.js      # 预览渲染与交互
|- site/2.0/               # AO3 风格样式基底
`- images/                 # 本地图片资源
```

---

## 注意事项

- 本项目是本地 demo，不隶属于 AO3 官方。
- 草稿存储在浏览器 localStorage，清缓存或换浏览器后草稿不可见。
- 建议保留你的原始文稿备份。
