import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "6mb" } }, // project photo uploads (max 5 MB)
};
export default config;
