import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    ...compat.extends('eslint:recommended', 'plugin:vue/vue3-recommended', '@vue/eslint-config-typescript'),
    {
        ignores: ["node_modules/", "dist/", "build/"],

        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
        },

        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/html-self-closing': 'off',
        },
    },
];
