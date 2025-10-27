<template>
  <main>
<!--    <h1 class="text-3xl font-bold mb-4">JSON Pretty Formatter Online</h1>-->
<!--    <p class="mb-6 text-lg">-->
<!--      Use <strong>jsonprettier.org</strong> to format, beautify, validate, and visualize your JSON data instantly. This free online tool helps developers and analysts prettify JSON with easy copy-paste functionality.-->
<!--    </p>-->

<!--    <ul class="list-disc pl-6 mb-6">-->
<!--      <li>Instant JSON formatting and indentation</li>-->
<!--      <li>Syntax highlighting and error detection</li>-->
<!--      <li>Secure client-side JSON parser</li>-->
<!--      <li>No data saved – 100% privacy friendly</li>-->
<!--      <li>Supports nested structures, arrays, objects</li>-->
<!--    </ul>-->

    <JsonPretty />

<!--    <section class="mt-12">-->
<!--      <h2 class="text-2xl font-semibold mb-2">Why use JSON Prettier?</h2>-->
<!--      <p>-->
<!--        Whether you’re debugging APIs, formatting server responses, or sharing structured data, our <strong>online JSON formatter</strong> helps you clean up and understand your raw JSON files with proper indentation and structure.-->
<!--      </p>-->
<!--    </section>-->

<!--    <section class="mt-10">-->
<!--      <h2 class="text-xl font-semibold mb-2">Related Tools</h2>-->
<!--      <ul class="list-disc pl-6">-->
<!--        <li>Free JSON Validator</li>-->
<!--        <li>JSON Minifier</li>-->
<!--        <li>JSON to XML Converter</li>-->
<!--        <li>JSON Schema Viewer</li>-->
<!--      </ul>-->
<!--    </section>-->
  </main>
</template>

<script setup>
useHead({
  title: 'JSON Prettier | Free Online JSON Formatter & Validator',
  meta: [
    { name: 'description', content: 'Prettify, format, and validate JSON with this free online tool. jsonprettier.org is the fastest way to format and beautify JSON for developers.' },
    { name: 'keywords', content: 'json pretty, json formatter, online json viewer, beautify json, json validator, format json, jsonprettier.org' },
    { name: 'robots', content: 'index, follow' },

    { property: 'og:title', content: 'JSON Prettier | Online JSON Formatter Tool' },
    { property: 'og:description', content: 'Easily format and view JSON data online. Supports syntax highlighting, validation, and more.' },
    { property: 'og:url', content: 'https://jsonprettier.org' },
    { property: 'og:type', content: 'website' },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'JSON Prettier | Online JSON Formatter Tool' },
    { name: 'twitter:description', content: 'Free online tool to format, validate, and beautify JSON instantly at jsonprettier.org.' }
  ],
  link: [
    { rel: 'canonical', href: 'https://jsonprettier.org' }
  ],
  script: [
    {
      type: 'application/ld+json',
      // @ts-ignore: allow raw script content
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "JSON Prettier",
        "url": "https://jsonprettier.org",
        "description": "Free online tool to format, beautify, and validate JSON data instantly.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://jsonprettier.org?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      })
    }
  ]
})
</script>
