# robertjohnlora.com

Robert Lora's personal site: who he is, case studies, builds, Umbra, a few games, and notes. It's built with Astro 5 and styled as a Ghostty terminal window in his ClaudeNight and ClaudeDay themes. Every page works without JavaScript; the prompt in the bottom bar is a layer on top.

## Run it

```sh
npm ci
npm run dev      # local dev server at http://localhost:4321
npm run build    # static site into dist/
npm run preview  # serve dist/ locally
```

## Where things live

* `src/layouts/Layout.astro` holds the head (SEO tags, canonical, JSON-LD), the title bar tabs and the bottom bar.
* `src/styles/global.css` holds the theme tokens and every shared style. The game pages under `src/pages/play/` read the older variable names, which are mapped onto the theme there.
* `src/scripts/terminal.ts` is the prompt, theme toggle, clock and copy action.
* `src/data/` holds the case studies and quotes, each used by a page and by the prompt.
* `design-archive/` keeps old mockups and the previous amber brand assets. It is not published.

## Deploy

Deploys go to the Cloudflare Pages project `robertjohnlora-com`, from the built `dist/` folder only. Run `npm run build` first and publish `dist/`, never the project folder.

The scripts in `scripts/` belong to the previous amber design. `generate-og-image.js` and `generate-favicon.js` write into `public/` and would overwrite the current share image and icons, so don't run them.
