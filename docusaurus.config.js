module.exports = {
  title: 'aditaja',
  tagline: 'aditaja.my.id',
  url: 'https://aditaja.my.id',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'kudaliar032', // Usually your GitHub org/user name.
  projectName: 'aditaja', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'aditaja',
      logo: {
        alt: 'aditaja',
        src: 'img/logo.svg',
      },
    },
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} aditaja. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        blog: {
          showReadingTime: true,
          routeBasePath: '/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    require.resolve('docusaurus-lunr-search')
  ]
};
