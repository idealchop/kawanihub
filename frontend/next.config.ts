/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
