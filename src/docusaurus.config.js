/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Newbe.Claptrap",
  tagline: "Newbe.Claptrap",
  url: "https://claptrap.newbe.pro",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "images/icon/favicon.ico",
  organizationName: "newbe36524", // Usually your GitHub org/user name.
  projectName: "Newbe.Claptrap", // Usually your repo name.
  i18n: {
    defaultLocale: "en-US",
    locales: [
      // "de-DE",
      "en-US",
      // "es-ES",
      // "fr-FR",
      // "ja-JP",
      // "ru-RU",
      "zh-Hans",
      // "zh-HK",
      "zh-TW",
    ],
    localeConfigs: {
      "en-US": { label: "English" },
      "zh-Hans": { label: "简体中文" },
      // "zh-HK": { label: "粤语" },
      "zh-TW": { label: "繁體中文" },
      // "ru-RU": { label: "русский язык" },
      // "de-DE": { label: "Deutsche" },
      // "es-ES": { label: "Español" },
      // "fr-FR": { label: "français" },
      // "ja-JP": { label: "日本語" },
    },
  },
  plugins: [
    [
      "@docusaurus/plugin-pwa",
      {
        debug: true,
        offlineModeActivationStrategies: ["appInstalled", "queryString"],
        pwaHead: [
          {
            tagName: "link",
            rel: "icon",
            href: "/images/icon/apple-touch-icon.png",
          },
          {
            tagName: "link",
            rel: "manifest",
            href: "/images/icon/site.webmanifest.json", // your PWA manifest
          },
          {
            tagName: "meta",
            name: "theme-color",
            content: "rgb(37, 194, 160)",
          },
        ],
      },
    ],
  ],
  themeConfig: {
    prism: {
      defaultLanguage: "csharp",
      additionalLanguages: ["powershell", "csharp", "sql"],
      // theme: require("prism-react-renderer/themes/github"),
      // darkTheme: require("prism-react-renderer/themes/palenight"),
    },
    // algolia: {
    //   apiKey: "6e0145abb5d335f273b4d8205992745f",
    //   indexName: "newbe",

    //   // Optional: see doc section bellow
    //   contextualSearch: true,

    //   // Optional: Algolia search parameters
    //   searchParameters: {},

    //   //... other Algolia params
    // },
    navbar: {
      title: "Newbe.Claptrap",
      logo: {
        alt: "Newbe.Claptrap",
        src: "images/main_banner.png",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "开发文档",
          position: "left",
        },
        { to: "blog", label: "博客", position: "left" },
        // right
        {
          href: "https://jq.qq.com/?_wv=1027&k=vRi0usiG",
          label: "QQ 群(610394020)",
          position: "right",
        },
        {
          href: "https://github.com/newbe36524/Newbe.Claptrap",
          label: "GitHub",
          position: "right",
        },
        {
          type: "docsVersionDropdown",
          position: "right",
          dropdownActiveClassDisabled: true,
          // dropdownItemsAfter: [
          //   {
          //     to: '/versions',
          //     label: 'All versions',
          //   },
          // ],
        },
        {
          type: "localeDropdown",
          position: "right",
          dropdownItemsAfter: [
            {
              to: "https://crowdin.com/project/newbeclaptrap/invite",
              label: "Help Us Translate",
            },
          ],
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "开发文档",
          items: [
            {
              label: "项目简介",
              to: "docs/",
            },
            {
              label: "快速入门",
              to: "docs/01-0-Quick-Start/",
            },
          ],
        },
        {
          title: "参与讨论",
          items: [
            {
              label: "QQ 群(610394020)",
              href: "https://jq.qq.com/?_wv=1027&k=vRi0usiG",
            },
          ],
        },
        {
          title: "更多资源",
          items: [
            {
              label: "项目博客",
              to: "blog",
            },
            {
              label: "个人博客",
              href: "https://www.newbe.pro",
            },
            {
              label: "GitHub",
              href: "https://github.com/newbe36524/Newbe.Claptrap",
            },
          ],
        },
      ],
      copyright: `MIT ${new Date().getFullYear()} newbe36524. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/newbe36524/Newbe.Claptrap.Docs/edit/master/src/",
        },
        blog: {
          showReadingTime: true,
          editUrl:
            "https://github.com/newbe36524/Newbe.Claptrap.Docs/edit/master/src/blog/",
          // showLastUpdateAuthor: true,
          // showLastUpdateTime: true,
          blogSidebarCount: 5, //"ALL",
          truncateMarker: /<!-- more -->/,
          feedOptions: {
            type: "all", // required. 'rss' | 'feed' | 'all'
          },
        },
        gtag: {
          trackingID: "UA-100658571-3",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
