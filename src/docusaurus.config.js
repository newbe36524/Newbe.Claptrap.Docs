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
    defaultLocale: "en_US",
    locales: [
      "de_DE",
      "en_US",
      "es_ES",
      "fr_FR",
      "ja_JP",
      "ru_RU",
      "zh_Hans",
      "zh_HK",
      "zh_TW",
    ],
    localeConfigs: {
      en_US: { label: "English" },
      zh_Hans: { label: "简体中文" },
      zh_HK: { label: "粤语" },
      zh_TW: { label: "繁體中文" },
      ru_RU: { label: "русский язык" },
      de_DE: { label: "Deutsche" },
      es_ES: { label: "Español" },
      fr_FR: { label: "français" },
      ja_JP: { label: "日本語" },
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
          // dropdownItemsAfter: [
          //   {
          //     to: 'https://github.com/facebook/docusaurus/issues/3526',
          //     label: 'Help Us Translate',
          //   },
          // ],
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
    gtag: {
      trackingID: "UA-100658571-3",
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
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
