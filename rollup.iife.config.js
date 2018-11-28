import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	input: 'es/rememo.js',
	output: {
		file: 'dist/rememo.js',
		name: 'rememo',
		format: 'iife',
	},
	plugins: [
		resolve(),
		commonjs(),
	],
};
