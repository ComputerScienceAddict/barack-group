import { BlogPostContent } from "@/components/blog-post-content";
import { notFound } from "next/navigation";
import { posts } from "@/lib/site-data";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found | Barak Group",
    };
  }

  return {
    title: `${post.title} | Barak Group`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  return <BlogPostContent post={post} />;
}
