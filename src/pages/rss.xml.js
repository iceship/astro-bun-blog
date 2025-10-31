import { getCollection } from "astro:content";
import rss from "@astrojs/rss";

export async function GET(context) {
  const allPosts = await getCollection("blog", ({ data }) => {
    return data.draft !== true;
  });

  // Sort posts by date in descending order
  const posts = allPosts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );

  return rss({
    title: "Iceship | Log",
    description: "iceship's log about everything.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/posts/${post.id}/`,
    })),
    customData: `<language>ko-kr</language>`,
  });
}
