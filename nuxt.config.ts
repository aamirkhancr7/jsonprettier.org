export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2025-07-17',
  nitro: {
    preset: 'static'
  },

  // ✅ Required by latest @nuxtjs/sitemap
  site: {
    url: 'https://jsonprettier.org' // MUST start with https
  },

  app: {
    head: {
      title: 'JSON Prettier | Free Online JSON Formatter & Pretty Printer',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Beautify, format, and validate your JSON data instantly with jsonprettier.org. Free, fast, privacy-friendly JSON formatter tool.' },
        { name: 'keywords', content: 'json pretty, json formatter, online json tool, beautify json, json validator, format json online, json viewer' },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'jsonprettier.org' },
        { property: 'og:title', content: 'JSON Prettier - Free Online JSON Formatter' },
        { property: 'og:description', content: 'Format and validate JSON with syntax highlighting and indentation. No sign up. No tracking. Just fast results.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://jsonprettier.org' },
        { property: 'og:image', content: 'https://jsonprettier.org/social-preview.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'JSON Prettier | Format Your JSON Online' },
        { name: 'twitter:description', content: 'A free online JSON pretty printer and validator. Format JSON instantly at jsonprettier.org.' },
        { name: 'twitter:image', content: 'https://jsonprettier.org/social-preview.png' }
      ],
      link: [
        { rel: 'canonical', href: 'https://jsonprettier.org' },
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  },

  modules: [
    ['@nuxtjs/sitemap', {
      sitemapFilename: 'sitemap.xml',
      xsl: false,
      gzip: true,
      trailingSlash: false
    }],
    ['@nuxtjs/robots', {
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: 'https://jsonprettier.org/sitemap.xml'
    }]
  ]
})
