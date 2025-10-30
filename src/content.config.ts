// Import utilities from `astro:content`

import { defineCollection, z } from "astro:content";
// Import the glob loader
import { glob } from "astro/loaders";

// Define a `loader` and `schema` for each collection
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      description: z.string(),
      tags: z.array(z.string()),
      author: z.string(),
      image: z.preprocess((val) => `./assets/${val}`, image()),
      alt: z.string(),
      targetKeyword: z.string(),
      draft: z.boolean().default(true),
    }),
});
// Export a single `collections` object to register your collection(s)
export const collections = { blog };
