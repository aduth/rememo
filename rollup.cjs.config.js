export default {
	entry: 'es/rememo.js',
	dest: 'rememo.js',
	format: 'cjs',
	external: [
		'shallow-equal/arrays',
		'moize',
		'moize/lib/utils',
		'moize/lib/Cache'
	]
};
