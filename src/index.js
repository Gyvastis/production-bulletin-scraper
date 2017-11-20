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
  method: 'GET',
  options: {
    proxy,
    transform: body => cheerio.load(body),
  },
})
  .then($ => parseProductions($))
  .then(({productions}) => productions);

const productionCreateOrUpdate = body => request({
  uri: "http://localhost:3001/production/",
  method: 'POST',
  body,
  json: true,
});

(async () => {
  const proxies = await scrapeProxies();
  console.log('Scraped proxies: ' + proxies.length);

  const proxy = `${proxies[0].ip}:${proxies[0].port}`;
  console.log('Selected proxy ' + proxy);

  const productions = await fetchProductionPage(proxy);
  console.log('Scraped productions: ' + productions.length);

  console.log('Saving productions...');
  await Promise.all(productions.map(production => productionCreateOrUpdate(production)));

  console.log('Done!');
})();
