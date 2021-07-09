import { terser } from 'rollup-plugin-terser';

export default /** @type {import('rollup').RollupOptions[]} */ [
	{
		input: 'es/rememo.js',
		output: {
			file: 'rememo.js',
			format: 'cjs',
			exports: 'default',
		},
	},
	{
		input: 'es/rememo.js',
		output: {
			file: 'dist/rememo.js',
			name: 'rememo',
			exports: 'default',
			format: 'iife',
		},
	},
	{
		input: 'es/rememo.js',
		output: {
			file: 'dist/rememo.min.js',
			name: 'rememo',
			exports: 'default',
			format: 'iife',
		},
		plugins: [terser()],
	},
];
