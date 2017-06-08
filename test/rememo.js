const assert = require( 'assert' );
const sinon = require( 'sinon' );
const createSelector = require( '../' );

describe( 'createSelector', () => {
	const sandbox = sinon.sandbox.create();

	const selector = sandbox.spy(
		( state, isComplete ) => state.todo.filter(
			( task ) => task.complete === isComplete
		)
	);

	const getTasksByCompletion = createSelector( selector, ( state ) => state.todo );

	const getState = () => ( {
		todo: [
			{ text: 'Go to the gym', complete: true },
			{ text: 'Try to spend time in the sunlight', complete: false },
			{ text: 'Laundry must be done', complete: true }
		]
	} );

	beforeEach( () => {
		sandbox.reset();
		getTasksByCompletion.memoizedSelector.clear();
	} );

	it( 'exposes cache clearing method', () => {
		assert.equal(
			typeof getTasksByCompletion.memoizedSelector.clear,
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
		assert.deepEqual( completed, selector( state, true ) );
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
