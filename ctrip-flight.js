/**
 * 携程国际机票查询 - 修复版
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('✈️ 携程国际机票查询');
console.log('='.repeat(60));

const config = {
  fromCode: 'CAN',
  fromCityName: '广州',
  toCode: 'MLE',
  toCityName: '马尔代夫',
  date: '2026-03-16',
  adults: 1,
  child: 0,
  baby: 0,
  seat: 5
};

async function runSearch() {
  let browser;
  let page;
  
  try {
    console.log('\n📌 启动浏览器...');
    browser = await chromium.launch({ headless: false, slowMo: 200 });
    
    page = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    }).then(ctx => ctx.newPage());
    
    console.log('\n📌 构建URL...');
    
    const params = new URLSearchParams({
      from: 'inner',
      tripType: 'ONE_WAY',
      dcode: config.fromCode,
      dcityName: config.fromCityName,
      acode: config.toCode,
      acityName: config.toCityName,
      ddate: config.date,
      seat: config.seat,
      adult: config.adults,
      child: config.child,
      baby: config.baby
    });
    
    const url = `https://m.ctrip.com/html5/flight/taro/interFirst?${params.toString()}#DATE_PICKER#DATE_PICKER#DATE_PICKER`;
    console.log(`   URL: ${url}`);
    
    console.log('\n📌 访问页面...');
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('   ⏳ 等待页面加载...');
    await page.waitForTimeout(25000);
    
    // 截图
    await page.screenshot({ path: path.join(__dirname, 'ctrip-screenshot.png'), fullPage: true });
    console.log('   📸 截图已保存');
    
    // ===== 1. 获取日历价格 - 修复正则处理换行 =====
    console.log('\n📌 获取日历价格...');
    
    const calendarData = await page.evaluate(() => {
      const results = [];
      
      // 先规范化文本：将换行符替换为特定分隔符
      const pageText = document.body.innerText;
      
      // 匹配日期格式: "03-02周一查价" 或 "03-16周一¥786"
      // 允许日期和星期之间有换行
      const regex = /(\d{2}-\d{2})[\n]*(周[一二三四五六日])[\n]*(¥\d+|查价)/g;
      let match;
      
      while ((match = regex.exec(pageText)) !== null) {
        results.push({
          day: match[1],
          week: match[2],
          price: match[3] === '查价' ? '查价' : match[3].replace('¥', '')
        });
      }
      
      return results;
    });
    
    console.log(`   找到 ${calendarData.length} 个日期价格`);
    calendarData.forEach(c => console.log(`   ${c.day} (${c.week}): ¥${c.price}`));
    
    // ===== 2. 获取航班信息 =====
    console.log('\n📌 获取航班信息...');
    
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(__dirname, 'ctrip-flight-list.png'), fullPage: true });
    
    const flightData = await page.evaluate(() => {
      const flights = [];
      const pageText = document.body.innerText;
      
      // 查找所有价格及其上下文
      const priceRegex = /¥(\d+)/g;
      let match;
      
      while ((match = priceRegex.exec(pageText)) !== null) {
        const priceIndex = match.index;
        const contextStart = Math.max(0, priceIndex - 200);
        const contextEnd = Math.min(pageText.length, priceIndex + 100);
        const context = pageText.substring(contextStart, contextEnd);
        
        // 提取时间: 格式 "01:35 -> 11:45" 或类似
        const timeMatch = context.match(/(\d{1,2}:\d{2})[\s\S]{0,20}(\d{1,2}:\d{2})/);
        
        // 提取航空公司
        const airlineMatch = context.match(/([\u4e00-\u9fa5]+航(?:空公司|空|司|))/);
        
        // 提取出发/到达机场
        const fromMatch = context.match(/(白云T\d|首都T\d|浦东T\d|虹桥T\d|新白云T\d)/);
        const toMatch = context.match(/(维拉纳T\d|吉隆坡T\d|希思罗T\d|樟宜T\d)/);
        
        // 提取中转信息
        const stopMatch = context.match(/(中转|经停|转机|停留)([\u4e00-\u9fa5]{2,10}?\d{0,2}h?\d{0,2}m?)/);
        
        // 提取飞行时长
        const durationMatch = context.match(/(\d{1,2}h\d{1,2}m)/);
        
        if (timeMatch) {
          flights.push({
            time: `${timeMatch[1]} → ${timeMatch[2]}`,
            price: match[1],
            airline: airlineMatch ? airlineMatch[1] : '未知航司',
            from: fromMatch ? fromMatch[1] : '',
            to: toMatch ? toMatch[1] : '',
            duration: durationMatch ? durationMatch[1] : '',
            stops: stopMatch ? stopMatch[1] + (stopMatch[2] || '') : '直飞'
          });
        }
      }
      
      return flights;
    });
    
    console.log(`   找到 ${flightData.length} 个航班`);
    flightData.forEach(f => {
      console.log(`   ✈️ ${f.time} | ¥${f.price} | ${f.airline} | ${f.stops}`);
    });
    
    // 保存结果
    console.log('\n' + '='.repeat(60));
    console.log('✈️ 查询结果');
    console.log('='.repeat(60));
    
    const resultFile = path.join(__dirname, 'ctrip-results.md');
    
    let md = `# ✈️ 携程国际机票查询\n\n`;
    md += `**航线**: ${config.fromCityName}(${config.fromCode}) → ${config.toCityName}(${config.toCode})\n`;
    md += `**日期**: ${config.date}\n`;
    md += `**乘客**: ${config.adults} 成人\n\n`;
    
    // 表格1: 当月价格日历
    md += `## 📅 ${config.date.split('-')[1]}月价格日历\n\n`;
    md += `| 日期 | 星期 | 价格 |\n`;
    md += `|------|------|------|\n`;
    calendarData.forEach(c => {
      const priceDisplay = c.price === '查价' ? '待查询' : `¥${c.price}`;
      const isTargetDate = c.day === config.date.split('-')[2].padStart(2, '0') ? ' ⭐' : '';
      md += `| ${c.day} | ${c.week} | ${priceDisplay} |${isTargetDate}\n`;
    });
    
    // 表格2: 出发日航班
    if (flightData.length > 0) {
      md += `\n## ✈️ ${config.date} 出发日航班详情\n\n`;
      md += `| # | 航班时间 | 航司 | 价格 | 飞行时长 | 备注 |\n`;
      md += `|---|----------|------|------|----------|------|\n`;
      flightData.forEach((f, i) => {
        md += `| ${i+1} | ${f.time} | ${f.airline} | ¥${f.price} | ${f.duration || '-'} | ${f.stops} |\n`;
      });
    }
    
    fs.writeFileSync(resultFile, md);
    console.log(`\n📁 结果已保存: ${resultFile}`);
    console.log('✅ 浏览器保持打开');
    
    await page.waitForTimeout(60000 * 60);
    await browser.close();
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (browser) await browser.close();
  }
}

runSearch();