import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16.4 programming model: opt-in, composable caching
  cacheComponents: true,
  partialPrefetching: true,
  // Automatic memoization (needs babel-plugin-react-compiler)
  reactCompiler: true,
  // Let the dev server work when opened from your network address or phone,
  // not only from localhost. Without this, Next blocks its dev scripts and the page never starts.
  allowedDevOrigins: ["192.168.1.14", "192.168.*.*", "*.local"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
