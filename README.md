# OpenClaw Travel Price Agent

<div align="center">

**旅游价格查询助手 | Travel Price Query Agent**

[![OpenClaw](https://img.shields.io/badge/OpenClaw-Compatible-blue)](https://github.com/openclaw/openclaw)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.58%2B-orange)](https://playwright.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 简介

基于 Playwright 的旅游价格查询工具，**核心功能是 Agoda 酒店最低价查询**，同时支持携程国际机票查询。

### ✨ 功能特点

- 🏨 **Agoda 酒店最低价查询**（核心功能）
  - 按价格排序，自动提取最便宜的酒店
  - 支持自定义入住日期、人数、房间数
  - 结构化 Markdown 报告输出
- ✈️ **携程国际机票查询**（辅助功能）
  - 单程机票价格查询
  - 价格日历展示

---

## 🎯 使用场景

### 场景 A：作为 OpenClaw Agent 调用

如果你已经在使用 [OpenClaw](https://github.com/openclaw/openclaw)，可以将本 Agent 添加到你的 OpenClaw 实例中。

#### 安装 Agent

```bash
# 进入 OpenClaw workspace 目录
cd ~/.openclaw/workspace

# 克隆 Agent 到 price-tag 目录
git clone https://github.com/54853315/openclaw-travel-price-agent.git price-tag

# 安装依赖
cd price-tag
npm install
npx playwright install chromium
```

#### 调用示例

```
/agent price-tag 查询上海到马尔代夫 2026-05-15 的 2 张机票价格
```

```
/agent price-tag 查询马尔代夫图鲁斯社岛 2026-05-15 到 2026-05-17，2 人（成人）的最优惠住宿价格
```

---

### 场景 B：作为独立工具使用

如果你不使用 OpenClaw，可以直接克隆本仓库作为独立工具运行。

#### 环境要求

- Node.js 18+
- npm 或 yarn

#### 快速开始

```bash
git clone https://github.com/54853315/openclaw-travel-price-agent.git
cd openclaw-travel-price-agent
npm install
npx playwright install chromium
```

#### Agoda 酒店查询

```bash
node agoda-persistent.js
```

修改脚本中的 URL 参数：

```javascript
// 关键参数说明
checkIn=2026-06-01    // 入住日期
checkOut=2026-06-12   // 退房日期
rooms=1               // 房间数
adults=3              // 成人数
children=0            // 儿童数
sort=priceLowToHigh   // 按价格升序排列
```

#### 携程机票查询

```bash
node ctrip-flight.js
```

修改脚本中的配置：

```javascript
const config = {
  fromCode: 'CAN',        // 出发地 IATA 代码
  fromCityName: '广州',
  toCode: 'MLE',          // 目的地 IATA 代码
  toCityName: '马尔代夫',
  date: '2026-03-16',     // 出发日期
  adults: 1,              // 成人数
  seat: 5                 // 舱位 (5=经济舱)
};
```

IATA 代码参考见 `destinations.md`。

---

## 📁 项目结构

```
openclaw-travel-price-agent/
├── agoda-persistent.js  # Agoda 酒店查询（核心）
├── ctrip-flight.js      # 携程机票查询（辅助）
├── destinations.md      # IATA 机场代码参考
├── package.json         # 依赖配置
└── README.md            # 本文档
```

---

## ⚠️ 注意事项

1. 价格实时变动，结果仅供参考
2. 建议合理控制请求频率，避免触发反爬

---

## 📄 许可证

MIT License

---

<div align="center">

Made with ❤️ by [konakona](https://github.com/54853315)

</div>