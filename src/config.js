const config = {
  gatsby: {
    pathPrefix: '/',
    siteUrl: 'https://claptrap.newbe.pro',
    gaTrackingId: 'UA-100658571-2',
    trailingSlash: false,
  },
  header: {
    logo: '/images/brand.svg',
    logoLink: 'https://claptrap.newbe.pro/',
    title: "<!--<a href='https://claptrap.newbe.pro'>Newbe.Claptrap</a>-->",
    githubUrl: 'https://github.com/newbe36524/Newbe.Claptrap',
    helpUrl: '',
    tweetText: '',
    social: `<!--<li>
		    <a href="https://twitter.com/hasurahq" target="_blank" rel="noopener">
		      <div class="twitterBtn">
		        <img src='https://graphql-engine-cdn.hasura.io/learn-hasura/assets/homepage/twitter-brands-block.svg' alt={'Discord'}/>
		      </div>
		    </a>
		  </li>
			<li>
		    <a href="https://discordapp.com/invite/hasura" target="_blank" rel="noopener">
		      <div class="discordBtn">
		        <img src='https://graphql-engine-cdn.hasura.io/learn-hasura/assets/homepage/discord-brands-block.svg' alt={'Discord'}/>
		      </div>
		    </a>
		  </li>-->`,
    links: [{ text: 'newbe.pro', link: 'https://www.newbe.pro' }],
    search: {
      enabled: false,
      indexName: '',
      algoliaAppId: process.env.GATSBY_ALGOLIA_APP_ID,
      algoliaSearchKey: process.env.GATSBY_ALGOLIA_SEARCH_KEY,
      algoliaAdminKey: process.env.ALGOLIA_ADMIN_KEY,
    },
  },
  sidebar: {
    forcedNavOrder: [
      "/zh_Hans", // add trailing slash if enabled above
      "/en_US",
      "/zh_HK",
      "/zh_TW",
      "/ru_RU",
      "/de_DE",
      "/es_ES",
      "/fr_FR",
      "/ja_JP",
    ],
    
    collapsedNav: [
      "/en_US",
      "/zh_HK",
      "/zh_TW",
      "/ru_RU",
      "/de_DE",
      "/es_ES",
      "/fr_FR",
      "/ja_JP",
    ],
    links: [
      { text: 'newbe.pro', link: 'https://www.newbe.pro' },
      { text: 'Github', link: 'https://github.com/newbe36524/Newbe.Claptrap' },
      { text: 'Gitee', link: 'https://gitee.com/yks/Newbe.Claptrap' },
    ],
    frontline: false,
    ignoreIndex: true,
    title: "<a href='https://claptrap.newbe.pro'>Newbe.Claptrap</a>",
  },
  siteMetadata: {
    title: 'Newbe.Claptrap Documents | Newbe',
    description: 'Documentation about Newbe.Claptrap ',
    ogImage: null,
    docsLocation: 'https://github.com/newbe36524/Newbe.Claptrap.Docs/tree/master/src/content',
    favicon: 'images/icon/favicon.ico',
  },
  pwa: {
    enabled: true, // disabling this will also remove the existing service worker.
    manifest: {
      name: 'Newbe.Claptrap Documents',
      short_name: 'newbe.claptrap',
      start_url: '/',
      background_color: '#6b37bf',
      theme_color: '#6b37bf',
      display: 'standalone',
      crossOrigin: 'use-credentials',
      icons: [
        {
          src: '/images/icon/apple-touch-icon.png',
          sizes: `384x384`,
          type: `image/png`,
        },
      ],
    },
  },
};

module.exports = config;
