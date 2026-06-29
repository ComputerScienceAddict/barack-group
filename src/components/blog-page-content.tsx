"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatedContent } from "@/components/reactbits";
import { SectionHeading } from "@/components/section-heading";
import { posts } from "@/lib/site-data";

export function BlogPageContent() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <AnimatedContent>
        <SectionHeading
          eyebrow="Updates"
          title="From the field"
          description="Photos and short notes from recent jobs."
        />
      </AnimatedContent>

      <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
        {posts.map((post, index) => (
          <AnimatedContent key={post.slug} delay={index * 60}>
            <Link
              href={`/blog/${post.slug}`}
              className="group grid gap-5 py-7 sm:grid-cols-[160px_1fr] sm:items-start sm:gap-6"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl sm:aspect-square">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  className="object-cover transition duration-300 group-hover:opacity-90"
                />
              </div>
              <div className="min-w-0">
                <time className="text-xs text-slate-500">{post.date}</time>
                <h2 className="mt-1 font-display text-xl font-bold leading-snug text-white transition group-hover:text-blue-300 sm:text-2xl">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{post.excerpt}</p>
              </div>
            </Link>
          </AnimatedContent>
        ))}
      </div>
    </div>
  );
}
