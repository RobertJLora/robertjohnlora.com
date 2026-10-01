// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://robertjohnlora.com',
  integrations: [
    sitemap({
      // /notes/about-me 301s to / via public/_redirects, so keep it out of the sitemap
      filter: (page) => !page.includes('/notes/about-me'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});