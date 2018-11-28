export default {
	input: 'es/rememo.js',
	output: {
		file: 'rememo.js',
		format: 'cjs',
	},
	external: [
		'shallow-equal/arrays',
	],
};
