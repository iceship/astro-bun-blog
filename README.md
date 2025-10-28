# Astro + Bun + Cloudflare Pages + Biome + Obsidian Markdown Blog

A production‑ready starter workflow to build a **Markdown-first blog** authored in **Obsidian**, developed with **Astro** and **Bun**, linted & formatted by **Biome**, and deployed to **Cloudflare Pages**.

---

## 1) What you’re building

- **Authoring**: Write in Obsidian using plain Markdown and frontmatter.
- **Source of truth**: Keep posts under `src/content/posts/` (Astro Content Collections).
- **Local dev**: `bun dev` for instant Astro HMR.
- **Quality**: `biome` for lint/format across TS/JS/MD/JSON.
- **Deploy**: Cloudflare Pages (static, globally cached, fast).

> If you later want server features (comments, search, etc.), you can add Cloudflare Pages Functions or Workers. For now, this is a static blog optimized for speed and simplicity.

---

## 2) Prerequisites

- **Bun** ≥ 1.1 installed (`curl -fsSL https://bun.sh/install | bash`)
- **Git** installed
- A **Cloudflare** account (for Pages)
- Optional: **Obsidian** desktop app (for drafting posts)

---

## 3) Create the Astro project

```bash
# 1) Create a minimal Astro project
bun create astro@latest my-blog
cd my-blog

# 2) Install dependencies
bun install

# 3) Add recommended integrations/plugins
bun add -D @biomejs/biome remark-gfm rehype-slug rehype-autolink-headings @astrojs/sitemap zod
```

> You can add MDX later with `@astrojs/mdx`. This starter sticks to Markdown for simplicity.

---

## 4) Configure Astro for Markdown + Content Collections

### 4.1 `astro.config.mjs`

Create or update **`astro.config.mjs`**:

```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Markdown enhancements
const markdown = {
  remarkPlugins: [
    (await import("remark-gfm")).default, // tables, strikethrough, task lists
  ],
  rehypePlugins: [
    (await import("rehype-slug")).default, // automatic heading IDs
    (await import("rehype-autolink-headings")).default, // anchor links on headings
  ],
};

export default defineConfig({
  site: "https://<your-domain-or-pages-url>", // set later for proper sitemap/og urls
  integrations: [sitemap()],
  markdown,
  build: {
    assets: "assets",
  },
  vite: {
    // Optional: speed up markdown imports
    server: { fs: { strict: false } },
  },
});
```

### 4.2 Content Collections schema

Create **`src/content/config.ts`**:

```ts
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
  }),
});

export const collections = { posts };
```

Create the folder **`src/content/posts/`** where your Markdown posts will live.

---

## 5) Minimal pages & listing

Create **`src/pages/index.astro`**:

```astro
---
import { getCollection } from "astro:content";

const all = await getCollection("posts");
const posts = all
  .filter((p) => !p.data.draft)
  .sort((a, b) => (b.data.date as any) - (a.data.date as any));
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My Blog</title>
  </head>
  <body>
    <main>
      <h1>My Blog</h1>
      <ul>
        {posts.map(({ slug, data }) => (
          <li>
            <a href={`/posts/${slug}/`}>{data.title}</a>
            <small> — {new Date(data.date).toISOString().slice(0, 10)}</small>
          </li>
        ))}
      </ul>
    </main>
  </body>
</html>
```

Create **`src/pages/posts/[...slug].astro`** (a simple post renderer):

```astro
---
import { getCollection } from "astro:content";
export async function getStaticPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { slug: post.slug.split("/") },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, data } = await post.render();
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{data.title}</title>
    {data.description && <meta name="description" content={data.description} />}
  </head>
  <body>
    <article>
      <h1>{data.title}</h1>
      <p><small>{new Date(data.date).toLocaleDateString()}</small></p>
      <Content />
      {data.tags?.length ? (
        <p><strong>Tags:</strong> {data.tags.join(", ")}</p>
      ) : null}
    </article>
  </body>
</html>
```

---

## 6) Bring your Obsidian notes

You have two good options:

### Option A — Draft directly in the repo
- Create notes under `src/content/posts/` inside this Astro project.
- Obsidian: add this folder to your Vault or open the repo as a Vault.

### Option B — Sync from a separate Vault (recommended)
- Keep your Vault elsewhere (e.g., `~/Documents/Vault/Blog/`).
- Sync into the project before build/dev using `rsync` (or `robocopy` on Windows).

**Example (macOS/Linux):**
```bash
rsync -av --delete ~/Documents/Vault/Blog/ ./src/content/posts/
```

**Example (Windows PowerShell):**
```powershell
robocopy "$HOME\Documents\Vault\Blog" ".\src\content\posts" /MIR
```

> Keep Obsidian‑specific syntax minimal. `remark-gfm` enables tables, footnotes, and task lists. For Obsidian callouts (`> [!note]`), they’ll render as blockquotes by default; you can add custom CSS later.

---

## 7) Biome (lint/format) setup

Initialize once:
```bash
bunx @biomejs/biome init
```

Replace **`biome.json`** with:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.8.0/schema.json",
  "vcs": { "enabled": true },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "files": {
    "ignore": ["dist", ".astro", ".vercel", ".netlify", "node_modules"]
  }
}
```

Add scripts to **`package.json`**:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "format": "biome format --write .",
    "lint": "biome lint .",
    "check": "biome check .",
    "sync:notes": "rsync -av --delete "$HOME/Documents/Vault/Blog/" "./src/content/posts/" || echo "Skipping sync on Windows""
  }
}
```

Run:
```bash
bun run format && bun run lint
```

---

## 8) Local development

```bash
bun dev
# open http://localhost:4321
```

Create your first post (or copy the sample `GEMINI.md` into `src/content/posts/`).

---

## 9) Build

```bash
bun run build
# output => ./dist
```

---

## 10) Deploy to Cloudflare Pages

1. Push your repo to GitHub (or GitLab/Bitbucket).
2. In Cloudflare Dashboard → **Pages** → **Create a project** → **Connect to Git**.
3. **Build command**: `bun run build`
4. **Build output directory**: `dist`
5. **Environment**: Select **Bun** if available, or **Node** (Bun is supported on Pages — if not visible, set `NODE_VERSION=22`).
6. Set `site` in `astro.config.mjs` to your Pages domain after first deploy to ensure correct absolute URLs.
7. (Optional) Add custom domain and enable **Early Hints** / **Caching**.

**Static headers / redirects** (optional):
- Add a `_headers` or `_redirects` file in the root or `public/` for fine‑grained control.

---

## 11) Recommended structure

```
my-blog/
├─ public/                 # static assets (robots.txt, favicon, images)
├─ src/
│  ├─ content/
│  │  ├─ config.ts         # content collection schema
│  │  └─ posts/            # your Markdown posts (from Obsidian)
│  └─ pages/
│     ├─ index.astro       # list posts
│     └─ posts/
│        └─ [...slug].astro  # post page
├─ astro.config.mjs
├─ package.json
├─ biome.json
└─ tsconfig.json
```

---

## 12) Drafts, tags, and SEO tips

- Set `draft: true` in frontmatter while writing; the listing page filters out drafts.
- Use concise `title` and `description` fields per post.
- Add a `heroImage` in frontmatter and place the file under `public/` or a CDN.
- Consider adding Open Graph tags and a layout with `<meta>` defaults.

---

## 13) Next steps (optional but nice)

- Add a site layout and CSS, or bring Tailwind.
- Introduce MDX later if needed.
- Implement a tag index page.
- Hook up search (Lunr/elasticlunr client‑side), or Algolia/Typesense.
- Add RSS (`@astrojs/rss`) and a `sitemap` (already added).

---

## 14) Troubleshooting

- **Cloudflare build fails on Bun?** Temporarily switch to Node env with `npm run build` equivalent, or add a `.npmrc` + `package-lock.json` for Node builds. Astro outputs the same static site.
- **Obsidian wikilinks** (`[[Page]]`) not resolving? Prefer standard Markdown links, or wire up a `remark-wiki-link` plugin later.
- **Korean filenames**: Astro & Pages handle UTF‑8 fine, but avoid spaces in slugs.

---

Happy writing! Move on to the sample post template in **GEMINI.md**.
