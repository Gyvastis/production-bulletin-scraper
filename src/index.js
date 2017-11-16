const scrapeIt = require('scrape-it')
const request = require('request-promise');
const cheerio = require('cheerio');

const getProxies = scrapeIt("https://free-proxy-list.net/anonymous-proxy.html", {
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
}).then(({proxies}) => proxies);

// $ = cheerio.load();
// const getProductionBulletinPage =
scrapeIt("https://productionbulletin.com/database/", {
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
}).then(page => console.log(page));
