export function shouldBypassImageOptimizer(src: string): boolean {
  try {
    const hostname = new URL(src, "https://localhost").hostname.toLowerCase();
    return hostname === "barakservices.com" || hostname === "www.barakservices.com";
  } catch {
    return false;
  }
}
