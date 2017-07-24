const assert = require( 'assert' );
const identity = require( '../es/identity' ).default;

describe( 'identity', () => {
	it( 'returns the same value', () => {
		assert.equal( identity( 5 ), 5 );
	} );
} );
