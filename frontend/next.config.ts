/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '..'),
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
