import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["chromadb", "pdf-parse"],
};

export default nextConfig;
