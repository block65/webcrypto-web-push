module.exports = {
  root: true,
  extends: ['@block65/eslint-config'],
  parserOptions: {
    project: './tsconfig-eslint.json',
  },
  rules: {
    'no-console': 'off',
  },
};
