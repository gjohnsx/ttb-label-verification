import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@node-rs/xxhash"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
        pathname: "/**",
      },
    ],
  },
};

export default withWorkflow(nextConfig);
