import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Public marketing SPA at /
        { source: "/", destination: "/marketing/index.html" },
        // Marketing HTML uses relative assets/… paths; at / those resolve here
        { source: "/assets/:path*", destination: "/marketing/assets/:path*" },
      ],
    };
  },
};

export default nextConfig;
