const config = {
  gatsby: {
    pathPrefix: '/',
    siteUrl: 'https://claptrap.newbe.pro',
    gaTrackingId: null,
    trailingSlash: false,
  },
  header: {
    logo: 'https://graphql-engine-cdn.hasura.io/learn-hasura/assets/homepage/brand.svg',
    logoLink: 'https://claptrap.newbe.pro/',
    title:
      "<a href='https://claptrap.newbe.pro'>Newbe.Claptrap</a>",
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
      '/zh_Hans', // add trailing slash if enabled above
      '/en_US',
    ],
    collapsedNav: [
      '/en_US', // add trailing slash if enabled above
    ],
    links: [{ text: 'newbe.pro', link: 'https://www.newbe.pro' }],
    frontline: false,
    ignoreIndex: true,
    title:
      "<a href='https://claptrap.newbe.pro'>Newbe.Claptrap</a>",
  },
  siteMetadata: {
    title: 'Newbe.Claptrap Documents | Newbe',
    description: 'Documentation about Newbe.Claptrap ',
    ogImage: null,
    docsLocation: 'https://github.com/newbe36524/Newbe.Claptrap.Docs/tree/master/src/content',
    favicon: 'https://graphql-engine-cdn.hasura.io/img/hasura_icon_black.svg',
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
          src: 'src/pwa-512.png',
          sizes: `512x512`,
          type: `image/png`,
        },
      ],
    },
  },
};

module.exports = config;
