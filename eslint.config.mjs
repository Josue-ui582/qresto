import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import noHardcodedCssValues from './src/eslint-rules/no-hardcoded-css-values.mjs';

export default [
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    ignores: ['.next/**', 'generated/**', 'node_modules/**'],
    plugins: {
      'design-tokens': {
        rules: {
          'no-hardcoded-css-values': noHardcodedCssValues,
        },
      },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react/no-unescaped-entities': 'warn',
      'design-tokens/no-hardcoded-css-values': 'error',
    },
  },
];
