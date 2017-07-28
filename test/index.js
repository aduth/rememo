const assert = require( 'assert' );
const sinon = require( 'sinon' );
const createSelector = require( '../' );

describe( 'createSelector', () => {
	let getTasksByCompletion;
	const sandbox = sinon.sandbox.create();

	const selector = sandbox.spy(
		( state, isComplete, extra ) => (
			state.todo.filter(
				( task ) => task.complete === isComplete
			).concat( extra || [] )
		)
	);

	const getState = () => ( {
		todo: [
			{ text: 'Go to the gym', complete: true },
			{ text: 'Try to spend time in the sunlight', complete: false },
			{ text: 'Laundry must be done', complete: true }
		]
	} );

	beforeEach( () => {
		sandbox.reset();
		getTasksByCompletion = createSelector( selector, ( state ) => state.todo );
	} );

	it( 'exposes cache clearing method', () => {
		assert.equal(
			typeof getTasksByCompletion.clear,
			'function'
		);
	} );

	it( 'returns the correct value', () => {
		const state = getState();
		const completed = getTasksByCompletion( state, true );

		assert.deepEqual( completed, selector( state, true ) );
	} );

	it( 'caches return value', () => {
		const state = getState();
		let completed;
		completed = getTasksByCompletion( state, true );
		completed = getTasksByCompletion( state, true );

		sinon.assert.calledOnce( selector );
		assert.deepEqual( completed, selector( state, true ) );
	} );

	it( 'caches return value for non-primitive args by reference', () => {
		const state = getState();
		let completed;
		const obj = {};
		completed = getTasksByCompletion( state, true, obj );
		obj.mutated = true;
		completed = getTasksByCompletion( state, true, obj );

		sinon.assert.calledOnce( selector );
		assert.deepEqual( completed, selector( state, true, obj ) );
	} );

	it( 'caches with maxSize', () => {
		getTasksByCompletion = createSelector(
			selector,
			( state ) => state.todo,
			{ maxSize: 2 }
		);

		const state = getState();
		const result = getTasksByCompletion( state, true );
		selector.reset();

		// cache MISS [ [ true, 1 ] ] (calls: 1)
		assert.deepEqual( getTasksByCompletion( state, true, 1 ), [ ...result, 1 ] );

		// cache MISS [ [ true, 2 ], [ true, 1 ] ] (calls: 2)
		assert.deepEqual( getTasksByCompletion( state, true, 2 ), [ ...result, 2 ] );

		// cache MISS [ [ true, 3 ], [ true, 2 ] ] (calls: 3)
		assert.deepEqual( getTasksByCompletion( state, true, 3 ), [ ...result, 3 ] );

		// cache MISS [ [ true, 1 ], [ true, 3 ] ] (calls: 4)
		assert.deepEqual( getTasksByCompletion( state, true, 1 ), [ ...result, 1 ] );

		// cache HIT [ [ true, 3 ], [ true, 1 ] ] (calls: 4)
		assert.deepEqual( getTasksByCompletion( state, true, 3 ), [ ...result, 3 ] );

		// cache HIT [ [ true, 1 ], [ true, 3 ] ] (calls: 4)
		assert.deepEqual( getTasksByCompletion( state, true, 1 ), [ ...result, 1 ] );

		// cache MISS [ [ true, 2 ], [ true, 1 ] ] (calls: 5)
		assert.deepEqual( getTasksByCompletion( state, true, 2 ), [ ...result, 2 ] );

		sinon.assert.callCount( selector, 5 );
	} );

	it( 'defaults to caching on entire state object', () => {
		const getTasksByCompletionOnState = createSelector( selector );
		let state = getState();
		let completed;
		completed = getTasksByCompletionOnState( state, true );
		completed = getTasksByCompletionOnState( state, true );
		state = getState();
		completed = getTasksByCompletionOnState( state, true );

		sinon.assert.calledTwice( selector );
		assert.deepEqual( completed, selector( state, true ) );
	} );

	it( 'returns cached value on superfluous arguments', () => {
		const state = getState();
		let completed;
		completed = getTasksByCompletion( state, true, true );
		completed = getTasksByCompletion( state, true, true );

		sinon.assert.calledOnce( selector );
		assert.deepEqual( completed, selector( state, true, true ) );
	} );

	it( 'returns the correct value of differing arguments', () => {
		const state = getState();
		const completed = getTasksByCompletion( state, true );
		const uncompleted = getTasksByCompletion( state, false );

		sinon.assert.calledTwice( selector );
		assert.deepEqual( completed, selector( state, true ) );
		assert.deepEqual( uncompleted, selector( state, false ) );
	} );

	it( 'clears cache when state reference changes', () => {
		let state = getState();
		let completed = getTasksByCompletion( state, true );
		state = getState();
		completed = getTasksByCompletion( state, true );

		sinon.assert.calledTwice( selector );
		assert.deepEqual( completed, selector( state, true ) );
	} );

	it( 'clears cache when non-primitive argument reference changes', () => {
		const state = getState();
		let completed;
		let obj;
		obj = {};
		completed = getTasksByCompletion( state, true, obj );
		obj = {};
		completed = getTasksByCompletion( state, true, obj );

		sinon.assert.calledTwice( selector );
		assert.deepEqual( completed, selector( state, true, obj ) );
	} );

	it( 'returns cache even if target object has changed reference', () => {
		let state = getState();
		let completed;
		completed = getTasksByCompletion( state, true );
		state = Object.assign( {}, state, { other: true } );
		completed = getTasksByCompletion( state, true );

		sinon.assert.calledOnce( selector );
		assert.deepEqual( completed, selector( state, true ) );
	} );
} );
