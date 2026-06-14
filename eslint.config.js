import { defineConfig } from 'eslint/config';
import es5 from '@aduth/eslint-config/es5';
import esnext from '@aduth/eslint-config/esnext';

export default defineConfig([
	...esnext.map((config) => ({
		ignores: ['rememo.js'],
		...config,
	})),
	...es5.map((config) => ({
		files: ['rememo.js'],
		...config,
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2015,
				sourceType: 'module',
			},
		},
		rules: {
			'no-var': 'off',
		},
	})),
]);
