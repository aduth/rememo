import { defineConfig } from 'tsdown';

export default defineConfig([
	/**
	 * Dual ESM/CJS with per-format declarations.
	 */
	{
		entry: ['src/rememo.ts'],
		format: ['esm', 'cjs'],
		dts: true,
		fixedExtension: true,
		platform: 'neutral',
		sourcemap: true,
		clean: true,
	},
	/**
	 * Browser-ready IIFE builds assigning the global `window.rememo`
	 */
	{
		entry: ['src/iife.ts'],
		format: ['iife'],
		globalName: 'rememo',
		dts: false,
		platform: 'browser',
		clean: false,
		outputOptions: {
			entryFileNames: 'rememo.js',
			exports: 'default',
		},
	},
	/**
	 * The minified one served via unpkg (see README).
	 */
	{
		entry: ['src/iife.ts'],
		format: ['iife'],
		globalName: 'rememo',
		minify: true,
		dts: false,
		platform: 'browser',
		clean: false,
		outputOptions: {
			entryFileNames: 'rememo.min.js',
			exports: 'default',
		},
	},
]);
