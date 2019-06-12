const express = require('express');
const puppeteer = require('puppeteer');

const server = express();
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';

async function getMovie(link) {
  try {
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    var page = await browser.newPage();
    await page.goto(link);

    var movie = await page.evaluate(async () => {
      var title, runtime, genre, poster, summary, creators, stars, ratings;
      genre = [];
      creators = [];
      stars = [];

      var movieWrapper = document.querySelector('div#main_top');
      if (!movieWrapper) {
        return { error: true, message: 'No such page' };
      }
      var genreWrapper = movieWrapper.querySelectorAll('div.subtext > a:not(:last-child)');
      var creatorsWrapper = movieWrapper.querySelectorAll('div.credit_summary_item')[0];
      var starsWrapper = movieWrapper.querySelectorAll('div.credit_summary_item')[1];

      starsWrapper.querySelectorAll('a:not(:last-child)').forEach(anchor => stars.push(anchor.innerText));
      creatorsWrapper.querySelectorAll('a').forEach(async anchor => creators.push(anchor.innerText));
      genreWrapper.forEach(async anchor => genre.push(anchor.innerText));

      title = movieWrapper.querySelector('div.title_wrapper > h1').innerText;
      runtime = movieWrapper.querySelector('time').innerText;
      poster = movieWrapper.querySelector('div.slate_wrapper > div.poster > a > img').src;
      summary = movieWrapper.querySelector('div.plot_summary > div.summary_text').innerText;
      ratings = movieWrapper.querySelector('div.ratingValue').innerText;

      return { error: false, movie: { title, runtime, ratings, poster, summary, genre, creators, stars } };
    });
    if (dev) {
      console.log(movie);
    }
    await page.close();
    await browser.close();
    return movie;
  } catch (err) {
    console.log(err);
    return { error: true, message: 'Runtime error occured' };
  }
}

async function getWebSeries(link) {
  try {
    var browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    var page = await browser.newPage();
    await page.goto(link);

    var movie = await page.evaluate(async () => {
      var title, runtime, genre, poster, summary, creators, stars, ratings;
      genre = [];
      creators = [];
      stars = [];

      var movieWrapper = document.querySelector('div#main_top');
      if (!movieWrapper) {
        return { error: true, message: 'No such page' };
      }

      return { error: false };
    });
    if (dev) {
      console.log(movie);
    }
    await page.close();
    await browser.close();
    return movie;
  } catch (err) {
    console.log(err);
    return { error: true, message: 'Runtime error occured' };
  }
}

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

server.get('/', (req, res) => {
  res.send('Hello World! Working pages /getDataFromIMDb?link=');
});

server.get('/getDataFromIMDb', async (req, res) => {
  let link = req.query.link;
  if (link === '' || !link) {
    if (dev) {
      console.log('link: empty');
    }
    res.send({ error: true, errorMessage: 'Link cannot be empty' });
  } else {
    console.log('link: ', link);
    res.send(await getMovie(link));
  }
});

server.get('*', (req, res) => {
  res.send('404 Page Not Found');
});

server.listen(port, err => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
// want to rebuild
