module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime', // new JSX transform from React 17
    'plugin:react-hooks/recommended',
    // 1.关闭与prettier冲突的样式规则（eslint-config-prettier）；
    // 2.注册eslint-plugin-prettier插件，使ESLint检测prettier样式问题
    'plugin:prettier/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // 'react/jsx-max-props-per-line': [1, { maximum: 1, when: 'multiline' }],
    'react/no-unknown-property': ['error', { ignore: ['styleName'] }],
  },
};
