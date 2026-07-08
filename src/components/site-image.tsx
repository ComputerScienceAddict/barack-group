import Image, { type ImageProps } from "next/image";
import { shouldBypassImageOptimizer } from "@/lib/site-image";

export function SiteImage({ src, unoptimized, ...props }: ImageProps) {
  const bypassOptimizer =
    typeof src === "string" ? shouldBypassImageOptimizer(src) : false;

  return <Image src={src} unoptimized={unoptimized ?? bypassOptimizer} {...props} />;
}
