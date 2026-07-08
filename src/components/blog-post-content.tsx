import Link from "next/link";
import { posts } from "@/lib/site-data";
import { notFound } from "next/navigation";

export function BlogPostContent({ slug }: { slug: string }) {
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="container">
      <div style={{ paddingTop: "3rem", paddingBottom: "1.5rem" }}>
        <Link
          href="/blog"
          style={{
            fontSize: "0.875rem",
            color: "var(--color-ink-3)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          ← All updates
        </Link>
      </div>

      <article style={{ paddingBottom: "4rem" }}>
        <header style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "2rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-ink-3)", marginBottom: "0.75rem" }}>
            {post.date}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-dm-serif, Georgia, serif)",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 700,
              color: "var(--color-ink)",
              lineHeight: 1.2,
              marginBottom: "0.75rem",
            }}
          >
            {post.title}
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--color-ink-2)" }}>{post.excerpt}</p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {post.content.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: "1.0625rem",
                color: "var(--color-ink-2)",
                lineHeight: 1.8,
                maxWidth: "42rem",
              }}
            >
              {para}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
