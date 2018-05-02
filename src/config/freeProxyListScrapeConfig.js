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

module.exports = freeProxyListScrapeConfig;
