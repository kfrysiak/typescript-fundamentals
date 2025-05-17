import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    result: 'src/result/index.ts',
    'eslint-plugin': 'src/rules/eslint-plugin.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
});
