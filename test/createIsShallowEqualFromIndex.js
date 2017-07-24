const assert = require( 'assert' );
const createIsShallowEqualFromIndex = require( '../es/createIsShallowEqualFromIndex' ).default;

describe( 'createIsShallowEqualFromIndex', () => {
	context( 'index 0', () => {
		const isShallowEqual = createIsShallowEqualFromIndex( 0 );

		it( 'create function which returns false on non-shallow equal', () => {
			assert.equal( isShallowEqual( [ 1, 2, 3 ], [ 1, 2, 4 ] ), false );
		} );

		it( 'create function which returns true on non-shallow equal', () => {
			assert.equal( isShallowEqual( [ 1, 2, 3 ], [ 1, 2, 3 ] ), true );
		} );
	} );

	context( 'index 1', () => {
		const isShallowEqual = createIsShallowEqualFromIndex( 1 );
		const createUniqueObject = () => ( {} );

		it( 'create function which returns false on non-shallow equal', () => {
			assert.equal( isShallowEqual(
				[ createUniqueObject(), 2, 3 ],
				[ createUniqueObject(), 2, 4 ]
			), false );
		} );

		it( 'create function which returns true on non-shallow equal', () => {
			assert.equal( isShallowEqual(
				[ createUniqueObject(), 2, 3 ],
				[ createUniqueObject(), 2, 3 ]
			), true );
		} );
	} );
} );
