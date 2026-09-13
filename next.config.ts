import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  // Icons are served via /api/eve-icon (immutable 1y). remotePatterns kept if needed later.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.evetech.net",
        pathname: "/types/**",
      },
    ],
  },
}

export default nextConfig
