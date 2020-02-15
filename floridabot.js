const puppeteer = require('puppeteer');
const fs = require("fs");
const Telegraf = require('telegraf');
const token = require('./token');
const bot =  new Telegraf(token.value);
let users = [];
const monthNames = ["january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

async function scrapeFloridaMan(url){
  console.log("started : "+url);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url,{timeout: 0});
  let titlePage = await page.title();
  if(!(titlePage.toLowerCase().includes('page not found'))){
      let img2;
    //method 2 (more elegant):
    try {
      //check for img inside a parent with class entry-image
      img2 = await page.$eval('.entry-image img', img => img.src);
      console.log(img2);
      //if there are none it's because the image is in the content and not the header
    } catch (e) {
      //check for images inside the entry content
      img2 = await page.$eval('.entry-content img', img => img.src);
      console.log(img2);
    }

    let viewSource = await page.goto(img2);
    fs.writeFileSync("./florida.jpg", await viewSource.buffer(), function(err) { if(err) console.log(err);  else console.log("The file was saved!"); });
    let title;
    await page.goBack({timeout: 0});
    try{
      console.log("in try");
      //check for header in the entry content
      let h2 = await page.$eval('.entry-content > h2', h2 => h2.textContent);
      console.log(h2);
      console.log("Done for "+url);
      return h2;
      //if there are none, throws an error
    }catch(e){
      //catch the error then find the text in the paragraph
      console.log("in catch");
      let title = await page.$$eval('.entry-content > p', p => p.map(text => text.textContent));
      title.splice(0,1); //to remove "Florida man challenge"
      title.pop(); //to remove "Read more"
      console.log(title);
      return title.join('\n');
    }
  }
  else{
    console.log("404");
    return null;
  }
}


function _randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomDate(){
  let random = _randomDate(new Date(2012, 0, 1), new Date());
  let dd = parseInt(String(random.getDate()).padStart(2, '0'));
  let mm = String(random.getMonth()).padStart(2, '0'); //January is 0!

    return monthNames[parseInt(mm)] + '-' + dd;
}

async function getContent(date, id){
    let news = await scrapeFloridaMan('http://thefloridamantimes.com/' + date + '/');
    console.log(news);
    return news;
}

function send(id, news){
  if(news == null){
    bot.telegram.sendMessage(id,"Surprisingly, the florida man did nothing crazy that day, maybe he rested ... \n "+
    "why don't you do the same? No one runs after you, all the problems you think you have are temporary, take a moment for yourself.\n"+
    "Here is a video by bob ross to remind you that life is beautiful : https://youtu.be/nsXuGvfMj64");
  }
  else{
    bot.telegram.sendMessage(id, news);
      bot.telegram.sendPhoto(id, {source: './florida.jpg'});
  }
}

bot.start(async (message) => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = monthNames[parseInt(mm)] + '-' + dd;
    let news = await getContent(today);
    send(message.chat.id, news);
});

bot.command('news', async (message) => {

    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth()).padStart(2, '0'); //January is 0!

    today = monthNames[parseInt(mm)] + '-' + dd;
    let news = await getContent(today);
    send(message.chat.id, news);
});

let people = ['Vittorio il Villico', 'Lorenzo Bertenzo', 'Carmelo culo pieno di pelo', 'Agostino fiumicino', 'Maurizo vedova\'s'];
bot.command('whosabitch', (message) => {
    let bitch = people[Math.floor(Math.random()*(people.length - 1))];
    bot.telegram.sendMessage(message.chat.id, bitch + ', he\'s truly the bitchest of the bitches');
});


bot.command('random', async message =>{

  let random = randomDate();

  console.log(random);
    let news;
    do{
	news = await getContent(random);
	random = randomDate();
	
    }while(news == null);
    send(message.chat.id, news);

});


bot.launch();
