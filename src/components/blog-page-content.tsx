import Link from "next/link";
import { posts } from "@/lib/site-data";

export function BlogPageContent() {
  return (
    <div className="container">
      <section className="hero" style={{ paddingBottom: "2.5rem" }}>
        <span className="hero-eyebrow">From the field</span>
        <h1 className="hero-title">Updates</h1>
        <p className="hero-subtitle">
          Snapshots from job sites, crew milestones, and company news.
        </p>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="post-list">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="post-row" style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ display: "flex", gap: "1.5rem", alignItems: "baseline" }}>
                <span className="post-date">{post.date}</span>
                <span className="post-title">{post.title}</span>
              </span>
              <span className="post-excerpt" style={{ paddingLeft: "8.5rem" }}>{post.excerpt}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
