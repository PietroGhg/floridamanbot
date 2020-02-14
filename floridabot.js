const puppeteer = require('puppeteer');
const fs = require("fs")
const Telegraf = require('telegraf');
const bot =  new Telegraf('1094823882:AAG7NTfFQS6_9RkK8slJS940yq0_2kX69KY');
let users = [];
const monthNames = ["january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

async function scrapeFloridaMan(url){
    const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  let [el] = await page.$x('/html/body/div[1]/main/div/div/div[1]/article/div/div[1]/h2');
  let txt = await el.getProperty('textContent');

  let rawTxt = await txt.jsonValue();

  //await page.goto(rawTxt);

  //let title = await page.title();

    console.log(rawTxt);

    [el] = await page.$x('/html/body/div[1]/main/div/div/div[1]/article/div/header/div[2]/a/img');
    let img = await el.getProperty('src');
    let rawImg = await img.jsonValue();
    var viewSource = await page.goto(rawImg); 
    fs.writeFile("./florida.jpg", await viewSource.buffer(),
		 function(err) {
		     if(err) { return console.log(err); }
		     console.log("The file was saved!"); });

    //console.log(rawImg);
    return rawTxt;

}




bot.start(async (message) => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = monthNames[parseInt(mm)] + '-' + dd;

    let news = await scrapeFloridaMan('http://thefloridamantimes.com/' + today + '/');


    bot.telegram.sendMessage(message.from.id, news);
    bot.telegram.sendPhoto(message.from.id, {source: './florida.jpg'})
});

bot.command('news', async (message) => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = monthNames[parseInt(mm)] + '-' + dd;

    let news = await scrapeFloridaMan('http://thefloridamantimes.com/' + today + '/');


    bot.telegram.sendMessage(message.chat.id, news);
    bot.telegram.sendPhoto(message.chat.id, {source: './florida.jpg'})
});

bot.startPolling();
    

