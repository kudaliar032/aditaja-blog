module.exports = {
  title: 'aditaja.my.id',
  tagline: 'aditaja.my.id',
  url: 'https://aditaja.my.id',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'kudaliar032', // Usually your GitHub org/user name.
  projectName: 'aditaja', // Usually your repo name.
  themeConfig: {
    algolia: {
      apiKey: 'ac45017a48f395fd401085fd2596396f',
      appId: 'KFE723IYI9',
      indexName: 'aditaja-blog',
    },
    navbar: {
      title: 'aditaja.my.id',
      logo: {
        alt: 'aditaja.my.id',
        src: 'img/logo.svg',
      },
      items: [
        {
          label: "About",
          to: "about",
          position: "right"
        }
      ]
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} aditaja.my.id &bull; Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        blog: {
          showReadingTime: true,
          routeBasePath: '/blog'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
