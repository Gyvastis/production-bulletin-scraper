const scrapeIt = require('scrape-it')
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

const freeProxyListScrapeConfig = require('./config/freeProxyListScrapeConfig');
const productionBulletinScrapeConfig = require('./config/productionBulletinScrapeConfig');

const scrapeProxies = () => scrapeIt("https://free-proxy-list.net/anonymous-proxy.html", freeProxyListScrapeConfig)
  .then(({proxies}) => proxies.filter(proxy => proxy.isElite));

const parseProductions = ($) => scrapeIt.scrapeHTML($, productionBulletinScrapeConfig);

const fetchProductionPage = (proxy, pageNumber = 1) => request({
  uri: `https://productionbulletin.com/database/?pages=${6 + pageNumber}&projectlist_length=25`,
  method: 'GET',
  options: {
    proxy,
    transform: body => cheerio.load(body),
  },
})
  .then($ => parseProductions($))
  .then(({productions}) => productions);

const productions = [];

const productionCreateOrUpdate = body => fs.appendFile("./output.json", JSON.stringify(body) + ",\r\n", (err) => {
    if(err) {
        return console.log(err);
    }
});
// request({
//   uri: "http://localhost:3001/production/",
//   method: 'POST',
//   body,
//   json: true,
// });

const processPage = (proxy, pageNumber) => new Promise(async (resolve, reject) => {
  const productions = await fetchProductionPage(proxy, pageNumber).catch(error => reject(error));
  console.log('Scraped productions: ' + productions.length);

  console.log('Saving productions...');
  await Promise.all(productions.map(production => productionCreateOrUpdate(production))).catch(error => reject(error));

  console.log('Done scraping page #' + pageNumber);

  resolve();
});

const [ , , scrapeNumberOfPages, startFromPage] = process.argv;

(async (scrapeNumberOfPages = 1, startFromPage = 0) => {
  console.log(`Scraping ${scrapeNumberOfPages} from ${startFromPage}`);
  let proxies = await scrapeProxies();
  console.log('Scraped proxies: ' + proxies.length);

  const requestedNumberOfPages = parseInt(scrapeNumberOfPages) + parseInt(startFromPage);
  let currentPage = parseInt(startFromPage);
  let promises = [];

  while(currentPage < requestedNumberOfPages) {
    currentPage++;
    console.log('Scraping page #' + currentPage);

    if(proxies.length == 0) {
      proxies = await scrapeProxies();
      console.log('Scraped proxies: ' + proxies.length);
    };

    const proxy = `${proxies[0].ip}:${proxies[0].port}`;
    proxies = proxies.slice(1);
    console.log('Selected proxy ' + proxy);

    promises.push(processPage(proxy, currentPage).catch(error => console.log('Failed to scrape page #' + currentPage)));

    if(promises.length == 10) { // wait for every 10 requests to finish
      await Promise.all(promises);

      promises = [];
    }
  }
})(scrapeNumberOfPages, startFromPage);
