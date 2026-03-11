---
name: travel-price-agent
description: Travel price search agent for Agoda hotels and Ctrip flights. Supports multi-platform price comparison (Agoda, Ctrip, Qunar, Lvmama) with automated Playwright scripts for real-time price data.
---

# 🏨✈️ Travel Price Agent / 旅游价格查询助手

多平台旅游价格查询助手 - 自动获取 Agoda 酒店和携程机票的实时价格。

## 支持平台 / Supported Platforms

### 🏨 酒店查询
- **Agoda (agoda.com)** - 国际酒店，价格准确
- 支持日期范围查询、多人多房间配置

### ✈️ 机票查询
- **携程网 (ctrip.com)** - 国内/国际机票
- **去哪儿网 (qunar.com)** - 比价
- **驴妈妈 (lvmama.com)** - 特价机票

## 功能特性 / Features

### 酒店查询 / Hotel Search
- 入住/退房日期配置
- 成人数量、房间数自定义
- 价格排序（低→高）
- 实时抓取最新价格

### 机票查询 / Flight Search
- 单程/往返查询
- 出发城市、目的城市
- 出发日期选择
- 舱位等级（可选）
- 价格日历（多日期比价）

## 使用示例 / Usage Examples

### 查询酒店 / Search Hotels

```
查询马尔代夫图鲁斯社岛酒店
入住：2026-06-01
退房：2026-06-12
成人：3 人
房间：1 间
```

**输出格式：**
```
🏨 Agoda 酒店查询
📍 图鲁斯社岛 (Thulusdhoo)
📅 2026-06-01 → 2026-06-12 (11 晚)
👥 3 成人 | 1 房间

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 #  酒店名称                  价格/晚     总价      评分
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1  Kurumba Maldives         ¥2,450    ¥26,950   ⭐9.2
 2  Paradise Island Resort   ¥1,980    ¥21,780   ⭐8.8
 3  Bandos Maldives          ¥1,750    ¥19,250   ⭐8.5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
共 3 家酒店
最低价：¥1,750/晚 (Bandos Maldives)
```

### 查询机票 / Search Flights

```
查询广州到马尔代夫的机票
日期：2026-03-16
```

**输出格式：**
```
✈️ 广州 (CAN) → 马尔代夫 (MLE)
📅 2026 年 3 月 16 日

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 #  时间          航司            价格     备注
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1  09:55→1:35   马来峇迪航空     ¥786    直飞
 2  09:55→1:35   马来峇迪航空     ¥882    直飞
 3  09:55→1:35   马来西亚亚航     ¥1063   中转
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
最低价：¥786 (马来峇迪航空 直飞)

🗓 03 月日历优惠价格（TOP 3）
| 日期   | 星期 | 价格  |
|--------|------|-------|
| 03-16 ⭐ | 周一 | ¥786  |
| 03-15  | 周日 | ¥837  |
| 03-17  | 周二 | ¥794  |
```

## 技术实现 / Technical Implementation

### 核心脚本 / Core Scripts

1. **scripts/agoda-persistent.js** - Agoda 酒店查询
   - Playwright 持久化浏览器会话
   - 自动处理登录状态
   - 价格数据提取

2. **scripts/ctrip-flight.js** - 携程机票查询
   - 国际航线价格抓取
   - 价格日历生成
   - 中转/直飞识别

### 依赖 / Dependencies

```json
{
  "playwright": "^1.x.x"
}
```

### 运行方式 / How to Run

```bash
# 安装依赖
npm install

# 查询酒店
node scripts/agoda-persistent.js

# 查询机票
node scripts/ctrip-flight.js
```

## 数据输出 / Data Output

### 酒店结果 / Hotel Results
保存到 `output/agoda-results.md`：
- 酒店名称
- 每晚价格
- 总价
- 评分
- 预订链接

### 机票结果 / Flight Results
保存到 `output/ctrip-results.md`：
- 航班时间
- 航空公司
- 价格
- 直飞/中转
- 日历优惠价

## 错误处理 / Error Handling

| 情况 | 处理方式 |
|------|---------|
| 页面加载失败 | 重试 3 次，失败则提示网络问题 |
| 价格元素未找到 | 截图保存调试，提示用户手动检查 |
| 日期格式错误 | 提示用户输入 YYYY-MM-DD 格式 |
| 城市代码无效 | 询问用户确认城市全称 |

## 注意事项 / Notes

1. **价格时效性** - 抓取的是实时价格，可能随时变动
2. **汇率波动** - 国际酒店价格受汇率影响
3. **税费说明** - 部分价格不含税费，需在预订页面确认
4. **网络要求** - 需要稳定的网络连接访问 Agoda/携程

## 扩展计划 / Roadmap

- [ ] 添加 Booking.com 支持
- [ ] 添加 Skyscanner 机票比价
- [ ] 价格历史趋势分析
- [ ] 价格提醒功能
- [ ] 多城市联程查询

---

**版本 / Version:** 1.0.0  
**作者 / Author:** K K (@GuGuaGuGuaX)  
**许可证 / License:** MIT
