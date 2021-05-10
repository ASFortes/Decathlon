const puppeteer = require('puppeteer')
const CronJob = require('cron').CronJob;
//const nodemailer = require('nodemailer');
const cheerio = require('cheerio');

const screenshot = 'shopping_staples.png'

const bikev2 ="https://www.decathlon.pt/bicic-btt-st-540-v2-azul-275-id_8667311.html"

async function initBrowser(){
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(bikev2, { waitUntil: 'networkidle2' })
  await page.screenshot({ path: screenshot })
  return page;
}

async function checkStock(page){
    
    await page.reload();
    let content = await page.evaluate(() => document.body.innerHTML);

    const $ = cheerio.load(content);

    const availabilityElmt = $('.dropdown-menu').children()[2]
    const isOutOfStock = availabilityElmt.attribs.class.toLowerCase().includes("unavailable");
    
    if (isOutOfStock) {
      console.log("Indisponível");
    } else {
      console.log("Dísponivel");
    }   
}

async function monitor(){
  let page= await initBrowser();
  let job = new CronJob("0/30 * * * * *", function(){
    checkStock(page);
}, null, true, null, null, true);
job.start();
}
monitor();

