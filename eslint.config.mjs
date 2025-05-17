import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import localPlugin from './dist/eslint-plugin.mjs';
const tsEslintPlugin = await import('@typescript-eslint/eslint-plugin');

export default [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin.default,
      local: localPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsEslintPlugin.default.configs.recommended.rules,
      'local/avoid-success-check': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'prettier/prettier': 'error',
    },
  },
];
