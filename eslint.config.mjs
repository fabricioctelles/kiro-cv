import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import js from '@eslint/js';
import globals from 'globals';

// Note: typescript-eslint does not support TypeScript 7.0 yet.
// Type checking is done by tsc --noEmit during build.
// Full ESLint support will return with TypeScript 7.1.
// See: https://github.com/typescript-eslint/typescript-eslint/issues/10940

export default [
  js.configs.recommended,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '*.config.*',
      // Temporarily ignore TS files until typescript-eslint supports TS 7.1
      '**/*.ts',
      '**/*.tsx',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
    plugins: {
      '@next/next': nextPlugin,
      'react': reactPlugin,
      'react-hooks': hooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
