import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default /** @type {import('rollup').RollupOptions} */ ( {
	input: 'es/rememo.js',
	output: {
		file: 'dist/rememo.js',
		name: 'rememo',
		exports: 'default',
		format: 'iife',
	},
	plugins: [
		resolve(),
		commonjs(),
	],
} );
