import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Keep Prisma's query engine and bcrypt out of the serverless bundle —
  // recommended by Prisma for Next.js + Vercel deployments.
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
