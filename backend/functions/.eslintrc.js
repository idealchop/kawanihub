module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
    sourceType: 'module',
  },
  ignorePatterns: ['lib/**', 'vitest.config.ts', '.eslintrc.js', 'src/__tests__/**'],
  plugins: ['@typescript-eslint'],
  rules: {
    'max-len': 'off',
    'require-jsdoc': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
