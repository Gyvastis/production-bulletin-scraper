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

module.exports = productionBulletinScrapeConfig;
