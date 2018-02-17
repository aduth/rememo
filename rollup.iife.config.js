import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	entry: 'es/rememo.js',
	dest: 'dist/rememo.js',
	moduleName: 'rememo',
	format: 'iife',
	plugins: [
		resolve(),
		commonjs(),
	],
};
