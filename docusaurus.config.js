module.exports = {
  title: 'aditaja.my.id',
  tagline: 'aditaja.my.id',
  url: 'https://aditaja.my.id',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'kudaliar032',
  projectName: 'aditaja-blog',
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
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://aditaja.my.id">aditaja.my.id</a> &bull; Built with <a href="https://v2.docusaurus.io">🦖</a>.`
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        blog: {
          showReadingTime: true,
          blogSidebarTitle: 'Recent Posts',
          feedOptions: {
            type: 'all'
          }
        }
      }
    ]
  ]
}
