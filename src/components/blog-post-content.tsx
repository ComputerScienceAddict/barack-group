"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatedContent } from "@/components/reactbits";
import type { Post } from "@/lib/site-data";

export function BlogPostContent({ post }: { post: Post }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
      <AnimatedContent>
        <Link href="/blog" className="text-sm text-slate-500 transition hover:text-blue-300">
          ← Back to updates
        </Link>

        <time className="mt-8 block text-xs text-slate-500">{post.date}</time>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">{post.title}</h1>
      </AnimatedContent>

      <AnimatedContent delay={80}>
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-xl">
          <Image src={post.image} alt={post.imageAlt} fill className="object-cover" priority />
        </div>
      </AnimatedContent>

      <AnimatedContent delay={120}>
        <div className="mt-8 space-y-5">
          {post.content.map((paragraph) => (
            <p key={paragraph} className="text-base leading-7 text-slate-300">
              {paragraph}
            </p>
          ))}
        </div>
      </AnimatedContent>
    </article>
  );
}
