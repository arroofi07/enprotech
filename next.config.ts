import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menghasilkan .next/standalone (server.js mandiri) untuk image Docker ramping.
  output: "standalone",
  typescript: {
    tsconfigPath: "tsconfig.build.json",
  },
  experimental: {
    // TypeScript 7 tidak lagi mengekspos JavaScript compiler API; gunakan CLI `tsc` lokal.
    useTypeScriptCli: true,
  },
};

export default nextConfig;
