module.exports = {
  title: 'blog aditaja',
  tagline: 'hanya sebuah blog',
  url: 'https://blog.aditaja.my.id',
  baseUrl: '/',
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
      title: 'blog aditaja',
      logo: {
        alt: 'blog aditaja',
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
      copyright: `Copyright © ${new Date().getFullYear()} &nbsp;&nbsp;&bull;&nbsp;&nbsp; <a href="https://blog.aditaja.my.id">blog.aditaja.my.id</a> &nbsp;&nbsp;&bull;&nbsp;&nbsp; Built with <a href="https://v2.docusaurus.io">🦖</a>.`
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        blog: {
          blogTitle: 'blog aditaja',
          blogDescription: 'hanya sebuah blog',
          blogSidebarTitle: 'Recent Posts',
          showReadingTime: true,
          routeBasePath: '/',
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} blog.aditaja.my.id`
          }
        }
      }
    ]
  ]
}
