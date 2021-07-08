export default /** @type {import('rollup').RollupOptions} */ ({
	input: 'es/rememo.js',
	output: {
		file: 'rememo.js',
		format: 'cjs',
		exports: 'default',
	},
});
