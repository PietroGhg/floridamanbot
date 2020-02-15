const puppeteer = require('puppeteer');
const monthNames = ["january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function scrapeFloridaMan(url,c){
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url,{timeout: 0});
  let titlePage = await page.title();
  if(!(titlePage.toLowerCase().includes('page not found'))){
    //method 1:
    //take all the imgs
    let img = await page.$$eval('img', img => img.map(img => img.src));

    //the third one is the one usually
    console.log(img[2]);

    //method 2 (more elegant):
    try {
      //check for img inside a parent with class entry-image
      let img2 = await page.$eval('.entry-image img', img => img.src);
      console.log(img2);
      //if there are none it's because the image is in the content and not the header
    } catch (e) {
      //check for images inside the entry content
      let img2 = await page.$eval('.entry-content img', img => img.src);
      console.log(img2);
    }
    let title
    let h2
    try{
      //check for header in the entry content
      h2 = await page.$eval('.entry-content > h2', h2 => h2.textContent);
      console.log(h2);
      //if there are none, throws an error
    }catch(e){
      //catch the error then find the text in the paragraph
      title = await page.$$eval('.entry-content > p', p => p.map(img => img.textContent));
      title.splice(0,1);
      title.pop();
      console.log(title);
    }

  }
  else{
    console.log("404")
  }
  console.log("Done for "+c);
}

let random = randomDate(new Date(2012, 0, 1), new Date());
let dd = parseInt(String(random.getDate()).padStart(2, '0'));
let mm = String(random.getMonth()).padStart(2, '0'); //January is 0!

for (let  i = 0; i<5; i++){
  let random = randomDate(new Date(2012, 0, 1), new Date());
  let dd = parseInt(String(random.getDate()).padStart(2, '0'));
  let mm = String(random.getMonth()).padStart(2, '0'); //January is 0!
  random = monthNames[parseInt(mm)] + '-' + dd;
  console.log('going to : http://thefloridamantimes.com/' + random + '/');
  scrapeFloridaMan('http://thefloridamantimes.com/' + random + '/',i);
}

console.log('going to : http://thefloridamantimes.com/february-18/');
scrapeFloridaMan('http://thefloridamantimes.com/february-18/','feb');

console.log('going to : http://thefloridamantimes.com/february-15/');
scrapeFloridaMan('http://thefloridamantimes.com/february-15/','today');
