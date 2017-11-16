const scrapeIt = require('scrape-it')
const request = require('request-promise');
const cheerio = require('cheerio');

const freeProxyListScrapeConfig = {
  proxies: {
    listItem: "#proxylisttable tbody tr",
    data: {
      ip: {
        selector: "td",
        eq: 0
      },
      port: {
        selector: "td",
        eq: 1
      },
      isElite: {
        selector: "td",
        eq: 4,
        convert: value => value.toLowerCase().indexOf('elite') >= 0
      }
    }
  }
};

const productionBulletinScrapeConfig = {
  productions: {
    listItem: "#projectlist tbody tr",
    data: {
      projectId: {
        selector: "td",
        eq: 1,
        attr: "class",
        convert: value => value.split(' ')[0]
      },
      project: {
        selector: "td",
        eq: 1,
      },
      startDate: {
        selector: "td",
        eq: 2,
      },
      location: {
        selector: "td",
        eq: 3,
      },
      type: {
        selector: "td",
        eq: 4,
      },
      director: {
        selector: "td",
        eq: 5,
      },
      productionCompany: {
        selector: "td",
        eq: 6,
      }
    }
  },
};

const scrapeProxies = () => scrapeIt("https://free-proxy-list.net/anonymous-proxy.html", freeProxyListScrapeConfig)
  .then(({proxies}) => proxies.filter(proxy => proxy.isElite));

const parseProductions = ($) => scrapeIt.scrapeHTML($, productionBulletinScrapeConfig);

const fetchProductionPage = (proxy, pageNumber = 1) => request({
  uri: "https://productionbulletin.com/database/",
  options: {
    proxy,
    transform: body => cheerio.load(body),
  },
})
  .then($ => parseProductions($))
  .then(({productions}) => productions);

const getRandomArbitrary = (min, max) => Math.round(Math.random() * (max - min) + min);

const getRandomArrayKey = (array) => getRandomArbitrary(0, array.length - 1);

scrapeProxies()
  .then(proxies => { console.log('Scraped proxies: ' + proxies.length); return proxies })
  .then(proxies => { const randomProxy = proxies[getRandomArrayKey(proxies)]; console.log(`Random proxy: ${randomProxy.ip}:${randomProxy.port}`); return `${randomProxy.ip}:${randomProxy.port}`; })
  .then(proxy => fetchProductionPage(proxy))
  .then(productions => { console.log('Scraped productions: ' + productions.length); return productions })
  .then(productions => console.log(productions));
