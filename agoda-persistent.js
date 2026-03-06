/**
 * Agoda 酒店查询 - 命令行参数版
 * 
 * 使用方式：
 * node agoda-persistent.js --checkIn 2026-05-15 --checkOut 2026-05-17 --adults 2 --rooms 1
 * 
 * 参数说明：
 * --checkIn   入住日期 (YYYY-MM-DD)，默认 2026-06-01
 * --checkOut  退房日期 (YYYY-MM-DD)，默认 2026-06-12
 * --adults    成人数量，默认 3
 * --rooms     房间数，默认 1
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    checkIn: '2026-06-01',
    checkOut: '2026-06-12',
    adults: 3,
    rooms: 1
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--checkIn':
        params.checkIn = args[++i];
        break;
      case '--checkOut':
        params.checkOut = args[++i];
        break;
      case '--adults':
        params.adults = parseInt(args[++i]);
        break;
      case '--rooms':
        params.rooms = parseInt(args[++i]);
        break;
    }
  }
  
  return params;
}

// 计算晚数
function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

console.log('='.repeat(60));
console.log('🏨 Agoda 酒店查询');
console.log('='.repeat(60));

async function runSearch() {
  const params = parseArgs();
  const nights = calculateNights(params.checkIn, params.checkOut);
  
  // 保持原 URL 完整结构，只替换关键参数
  let url = 'https://www.agoda.com/zh-hk/search?guid=5f3ecb86-c347-4add-99a3-544101aaff48&lastSearchedCity=9590&asq=u2qcKLxwzRU5NDuxJ0kOF3T91go8JoYYMxAgy8FkBH1BN0lGAtYH25sdXoy34qb9IFhkhrLrlQhcq1zcv19MJdWRJ6z6KZ8HHlt6GYfpj%2BFVB9Lk1q3%2B%2FtlBRDuT3pjvD%2BhryppLJCuDrWZ0jMHzon1CgyHhNV29NWUEu3I%2FAo0OhiM1GYOVytIVfi6y3AT7YWLftW0b%2FKwml011Xu0kBA%3D%3D&poi=280892&tick=639080682910&isdym=true&searchterm=%E5%9C%96%E9%AD%AF%E6%96%AF%E6%9D%9C%E5%B3%B6&txtuuid=5f3ecb86-c347-4add-99a3-544101aaff48&locale=zh-hk&ckuid=8c3fe679-9cc1-4910-80b4-8c829ce8a619&prid=0&currency=CNY&correlationId=99725b39-872e-48e6-ae46-0ee52268da3d&analyticsSessionId=4375956668955761983&pageTypeId=103&realLanguageId=7&languageId=7&origin=JP&stateCode=13&cid=-1&userId=8c3fe679-9cc1-4910-80b4-8c829ce8a619&whitelabelid=1&loginLvl=0&storefrontId=3&currencyId=11&currencyCode=CNY&htmlLanguage=zh-hk&cultureInfoName=zh-hk&memberId=320124716&machineName=hk-pc-2g-acm-web-user-78b6d4cfd5-rs2n4&trafficGroupId=4&trafficSubGroupId=4&aid=130243&useFullPageLogin=true&cttp=4&isRealUser=true&mode=production&browserFamily=Chrome&cdnDomain=agoda.net&checkIn=2026-06-01&checkOut=2026-06-12&rooms=1&adults=3&children=0&priceCur=CNY&los=11&textToSearch=%E5%9C%96%E9%AD%AF%E6%96%AF%E6%9D%9C%E5%B3%B6&travellerType=3&familyMode=off&city=280892&ds=WZ1R8juMc8Emzrvn&productType=-1&sort=priceLowToHigh';
  
  // 只替换关键参数，保留其他参数不变
  url = url.replace(/checkIn=\d{4}-\d{2}-\d{2}/, `checkIn=${params.checkIn}`);
  url = url.replace(/checkOut=\d{4}-\d{2}-\d{2}/, `checkOut=${params.checkOut}`);
  url = url.replace(/adults=\d+/, `adults=${params.adults}`);
  url = url.replace(/rooms=\d+/, `rooms=${params.rooms}`);
  url = url.replace(/los=\d+/, `los=${nights}`);
  
  console.log(`\n📋 查询参数:`);
  console.log(`   目的地: 图鲁斯社岛 (Thulusdhoo)`);
  console.log(`   入住: ${params.checkIn}`);
  console.log(`   退房: ${params.checkOut}`);
  console.log(`   晚数: ${nights}晚`);
  console.log(`   成人: ${params.adults}人`);
  console.log(`   房间: ${params.rooms}间`);
  
  let browser;
  
  try {
    console.log('\n📌 启动浏览器...');
    browser = await chromium.launch({ headless: false, slowMo: 200 });
    
    const page = await browser.newContext({
      viewport: { width: 1280, height: 900 }
    }).then(ctx => ctx.newPage());
    
    console.log('\n📌 访问搜索页面...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    
    console.log('   ⏳ 等待页面加载...');
    await page.waitForFunction(() => document.body.innerText.length > 100, { timeout: 30000 });
    console.log('   ✅ 页面已加载');
    
    console.log('   ⏳ 等待价格加载...');
    await page.waitForTimeout(15000);
    
    console.log('   📜 滚动加载酒店...');
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(2000);
    
    console.log('   ✅ 提取数据...');
    
    const hotels = await page.evaluate(() => {
      const results = [];
      const container = document.querySelector('.hotel-list-container, [class*="hotel-list"]');
      if (!container) return results;
      
      const cards = container.querySelectorAll('[data-selenium="hotel-item"], .PropertyCard');
      
      cards.forEach((card, index) => {
        if (index >= 5) return;
        
        const nameEl = card.querySelector('[data-selenium="hotel-name"]');
        const hotelName = nameEl ? nameEl.innerText.trim() : '';
        const hotelLink = nameEl ? nameEl.getAttribute('href') : '';
        
        const priceEl = card.querySelector('[data-selenium="display-price"]');
        const price = priceEl ? priceEl.innerText.trim() : '';
        
        const cardText = card.innerText || '';
        const isSoldOut = cardText.toLowerCase().includes('sold out') || 
                         cardText.includes('已訂滿') || cardText.includes('已订满');
        
        if (hotelName && price && !isSoldOut) {
          results.push({ name: hotelName, link: hotelLink, price });
        }
      });
      
      return results;
    });
    
    console.log(`\n   提取到 ${hotels.length} 个有效酒店`);
    
    // 输出结果（参数从变量读取）
    console.log('\n' + '='.repeat(60));
    console.log('🏨 查询结果');
    console.log('='.repeat(60));
    console.log('📍 目的地: 图鲁斯社岛 (Thulusdhoo)');
    console.log(`📅 日期: ${params.checkIn} → ${params.checkOut} (${nights}晚)`);
    console.log(`👥 人数: ${params.adults} 人（成人）`);
    console.log(`📊 共找到 ${hotels.length} 个有房的酒店`);
    console.log('-'.repeat(40));
    
    if (hotels.length > 0) {
      hotels.slice(0, 2).forEach((h, i) => {
        const totalPrice = parseInt(h.price) * nights;
        console.log(`\n${i+1}. ${h.name}`);
        console.log(`   💰 ¥${h.price}/晚 | 总价: ¥${totalPrice}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // 保存结果到 Markdown 文件（参数从变量读取）
    const resultFile = path.join(__dirname, 'agoda-results.md');
    let md = `# 🏨 图鲁斯社岛 (Thulusdhoo)酒店查询结果\n\n`;
    md += `**查询条件：**\n`;
    md += `- 📍 目的地：图鲁斯社岛 (Thulusdhoo)\n`;
    md += `- 📅 日期：${params.checkIn} → ${params.checkOut}（${nights}晚）\n`;
    md += `- 👥 人数：${params.adults} 人（成人）\n\n`;
    md += `---\n\n`;
    md += `**查询结果：共找到 ${hotels.length} 个有房的酒店**\n\n`;
    md += `| # | 酒店 | 价格/晚 | 总价(${nights}晚) |\n`;
    md += `|---|------|---------|---------------|\n`;
    
    if (hotels.length > 0) {
      hotels.slice(0, 2).forEach((h, i) => {
        const totalPrice = parseInt(h.price) * nights;
        md += `| ${i+1} | ${h.name} | ¥${h.price} | ¥${totalPrice} |\n`;
      });
      
      md += `\n---\n\n`;
      md += `**最优惠选择：** ${hotels[0].name} - ¥${hotels[0].price}/晚\n`;
    }
    
    fs.writeFileSync(resultFile, md);
    console.log(`📁 结果已保存: ${resultFile}`);
    console.log('✅ 浏览器保持打开');
    
    await page.waitForTimeout(60000 * 60);
    await browser.close();
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (browser) await browser.close();
  }
}

runSearch();