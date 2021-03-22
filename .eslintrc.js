module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    typescript: true,
    ecmaVersion: 7,
    ecmaFeatures: {
      classes: true,
      experimentalObjectRestSpread: true,
      jsx: true,
    },
    sourceType: 'module',
    project: [
      './tsconfig.json',
    ],
  },
  env: {
    'jest/globals': true,
  },
  plugins: [
    '@typescript-eslint',
    'jest',
    'import',
  ],
  extends: [
    'airbnb-typescript',
    'plugin:jest/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'eslint-comments/no-unused-disable': 'error',
    'import/no-unresolved': [2, { commonjs: true, amd: true }],
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'import/extensions': ['error', 'ignorePackages', {
      ts: 'never',
      tsx: 'never',
      js: 'never',
      jsx: 'never',
      mjs: 'never',
    }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
        packageDir: __dirname,
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'], // Your TypeScript files extension
      parserOptions: {
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
    },
  ],
  // settings: {
  //   'import/resolver': {
  //     webpack: {
  //       config: './src/webpack/inc/webpack-resolver-config.js',
  //     },
  //   },
  // },
};
