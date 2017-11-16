const scrapeIt = require("scrape-it")

const getProxies = scrapeIt("https://free-proxy-list.net/anonymous-proxy.html", {
  proxies: {
    listItem: "#proxylisttable tr",
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
}).then(({proxies}) => proxies.filter(proxy => proxy.ip != '' && proxy.port != ''));
