/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: "Newbe.Claptrap",
  tagline: "The tagline of my site",
  url: "https://claptrap.newbe.pro",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "newbe36524", // Usually your GitHub org/user name.
  projectName: "Newbe.Claptrap", // Usually your repo name.
  i18n: {
    defaultLocale: "zh_Hans",
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
  themeConfig: {
    navbar: {
      title: "My Site",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "docs/",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        { to: "blog", label: "Blog", position: "left" },
        // right
        {
          href: "https://github.com/facebook/docusaurus",
          label: "GitHub",
          position: "right",
        },
        // {
        //   type: 'docsVersionDropdown',
        //   position: 'right',
        //   dropdownActiveClassDisabled: true,
        //   dropdownItemsAfter: [
        //     {
        //       to: '/versions',
        //       label: 'All versions',
        //     },
        //   ],
        // },
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
          title: "Docs",
          items: [
            // {
            //   label: "Style Guide",
            //   to: "docs/",
            // },
            // {
            //   label: "Second Doc",
            //   to: "docs/doc2/",
            // },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Stack Overflow",
              href: "https://stackoverflow.com/questions/tagged/docusaurus",
            },
            {
              label: "Discord",
              href: "https://discordapp.com/invite/docusaurus",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/docusaurus",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/facebook/docusaurus",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
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
          // Please change this to your repo.
          editUrl:
            "https://github.com/facebook/docusaurus/edit/master/website/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/facebook/docusaurus/edit/master/website/blog/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
