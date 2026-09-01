/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.{test,spec}.ts'],
  },
});
