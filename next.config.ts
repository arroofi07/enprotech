import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menghasilkan .next/standalone (server.js mandiri) untuk image Docker ramping.
  output: "standalone",
};

export default nextConfig;
