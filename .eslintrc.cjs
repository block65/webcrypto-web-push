module.exports = {
  root: true,
  extends: ['@block65/eslint-config/typescript'],
  parserOptions: {
    project: [
      './tsconfig.json',
      './test/tsconfig.json',
      './lib/tsconfig.json',
      './examples/tsconfig.json',
    ],
  },
  rules: {
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        'no-restricted-syntax': 'off',
        '@typescript-eslint/no-import-type-side-effects': 'error',
      },
    },

    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/test/*.ts'],
      rules: {
        '@typescript-eslint/consistent-type-imports': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },

    {
      files: ['*.config.js', '*.config.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
