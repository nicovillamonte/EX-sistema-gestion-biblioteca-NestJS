module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'src/database/**/*'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    
    '@typescript-eslint/no-unused-vars': 'warn',  // Advierte sobre variables no utilizadas en lugar de marcarlas como errores
    '@typescript-eslint/no-empty-function': 'warn',  // Advierte sobre funciones vacías en lugar de marcarlas como errores
  
    'prettier/prettier': ['error', { endOfLine: 'auto' }], // Evita el error: Delete `␍`eslintprettier/prettier error
  },
};
