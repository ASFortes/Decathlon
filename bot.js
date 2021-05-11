const puppeteer = require('puppeteer')
const CronJob = require('cron').CronJob;
const nodemailer = require('nodemailer');
const cheerio = require('cheerio');
var mailList = ['alexandre_sf1@hotmail.com','joaninha_sp@hotmail.com'];

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
      getDate();
    } else {
      console.log("Dísponivel");
      sendNotification();
    }   
}

async function sendNotification(){
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user: 'comprasafortes@gmail.com',
            pass: 'comprasFortes1'
        }
    });
    let textToSend = 'O teu produto está disponível, vai comprá-lo rápido';
    let htmlText = `<a href =\"${bikev2}\">Link</a>`;


    let info = await transporter.sendMail({
        from:'"Decathlon Monitor" <comprasafortes@gmail.com>',
        to:mailList,
        subject:"A BICICLETA ESTÁ DISPONÍVEL... RÁPIDO",
        text: textToSend,
        html:htmlText
    });
}

async function getDate(){

    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();

    console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
}

async function monitor(){
    let page= await initBrowser();
    let job = new CronJob("0/30 * * * * *", function(){
        checkStock(page);
    }, null, true, null, null, true);
    job.start();
}
monitor();

