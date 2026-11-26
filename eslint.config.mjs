import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  // 1. Globally ignore auto-generated folders and the config file itself
  globalIgnores([
    '.features-gen/**',
    'playwright-report/**',
    'test-results/**',
    'eslint.config.mjs',
  ]),

  // 2. Base JS and TypeScript type-aware rules (scoped strictly to .ts files)
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },

  // 3. Playwright rules (scoped to your tests and step definitions)
  {
    files: ['**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // Optional: playwright-bdd uses step functions instead of test() blocks,
      // so disabling this prevents false positives in step definition files
      'playwright/no-standalone-expect': 'off',
    },
  },
  eslintConfigPrettier,
]);
