const assert = require( 'assert' );
const sinon = require( 'sinon' );

function test( createSelector, WeakMapImpl ) {
	let getTasksByCompletion;
	const sandbox = sinon.sandbox.create();

	function ifWeakMapIt( ...args ) {
		if ( typeof WeakMapImpl !== 'undefined' ) {
			return it( ...args );
		}
	}

	const selector = sandbox.spy(
		( state, isComplete = false, extra ) => (
			state.todo.filter(
				( task ) => task.complete === isComplete
			).concat( extra || [] )
		)
	);

	const getState = () => ( {
		todo: [
			{ text: 'Go to the gym', complete: true },
			{ text: 'Try to spend time in the sunlight', complete: false },
			{ text: 'Laundry must be done', complete: true },
		],
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

	it( 'clears cache when primitive dependant changes', () => {
		const getTasksByCompletionOnCount = createSelector( selector, ( state ) => state.ok );
		const state = getState();
		state.ok = false;
		let completed = getTasksByCompletionOnCount( state, true );
		state.ok = true;
		completed = getTasksByCompletionOnCount( state, true );

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

	ifWeakMapIt( 'deep caches on object dependants', () => {
		const stateByDate = {
			todos: {
				'2018-01-01': [
					{ text: 'Go to the gym', complete: true },
					{ text: 'Try to spend time in the sunlight', complete: true },
				],
				'2018-01-02': [
					{ text: 'Laundry must be done', complete: false },
				],
			},
		};

		const selectorByDate = sandbox.spy( ( state, date, isComplete = false ) => (
			state.todos[ date ].filter( ( task ) => task.complete === isComplete )
		) );

		const getTasksByCompletionByDate = createSelector(
			selectorByDate,
			( state, date ) => state.todos[ date ]
		);

		getTasksByCompletionByDate( stateByDate, '2018-01-01' );
		sinon.assert.calledOnce( selectorByDate );

		getTasksByCompletionByDate( stateByDate, '2018-01-02' );
		sinon.assert.calledTwice( selectorByDate );

		getTasksByCompletionByDate( stateByDate, '2018-01-01' );
		sinon.assert.calledTwice( selectorByDate );

		getTasksByCompletionByDate( stateByDate, '2018-01-02' );
		sinon.assert.calledTwice( selectorByDate );
	} );

	it( 'ensures equal argument length before returning cache', () => {
		const state = getState();
		let completed;
		completed = getTasksByCompletion( state, true );
		completed = getTasksByCompletion( state );

		sinon.assert.calledTwice( selector );
		assert.deepEqual( completed, selector( state ) );
	} );
}

describe( 'createSelector', () => {
	const _WeakMap = WeakMap;

	const WEAKMAP_SUPPORT = {
		with: _WeakMap,
		without: undefined,
	};

	for ( const name in WEAKMAP_SUPPORT ) {
		const WeakMapImpl = WEAKMAP_SUPPORT[ name ];

		context( name + ' WeakMap', () => {
			let implementation;
			const createSelector = ( ...args ) => implementation( ...args );

			before( () => {
				global.WeakMap = WeakMapImpl;

				delete require.cache[ require.resolve( '../' ) ];
				implementation = require( '../' );
			} );

			after( () => {
				global.WeakMap = _WeakMap;
			} );

			test( createSelector, WeakMapImpl );
		} );
	}
} );
