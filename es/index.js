'use strict';

import memoize from 'moize';
import createIsShallowEqualFromIndex from './createIsShallowEqualFromIndex';
import identity from './identity';

/**
 * Returns true if the two arrays are shallowly equal, or false otherwise.
 *
 * @param  {Array}   arrayA First array in comparison
 * @param  {Array}   arrayB Second array in comparison
 * @return {Boolean}        Whether arrays are equal
 */
var isShallowEqual = createIsShallowEqualFromIndex( 0 );

/**
 * Returns true if the two arrays are shallowly equal ignoring the first
 * entry, or false otherwise.
 *
 * @param  {Array}   arrayA First array in comparison
 * @param  {Array}   arrayB Second array in comparison
 * @return {Boolean}        Whether arrays are equal ignoring first entry
 */
var isShallowEqualIgnoringFirst = createIsShallowEqualFromIndex( 1 );

/**
 * Returns a memoized selector function. The getDependants function argument is
 * called before the memoized selector and is expected to return an immutable
 * reference or array of references on which the selector depends for computing
 * its own return value. The memoize cache is preserved only as long as those
 * dependant references remain the same. If getDependants returns a different
 * reference(s), the cache is cleared and the selector value regenerated.
 *
 * @param  {Function} selector      Selector function
 * @param  {Function} getDependants Dependant getter returning an immutable
 *                                  reference or array of reference used in
 *                                  cache bust consideration
 * @return {*}                      Selector return value
 */
export default function( selector, getDependants ) {
	var memoizedSelector, lastDependants;

	memoizedSelector = memoize( selector, {
		equals: isShallowEqualIgnoringFirst,

		// While we never use moize's promise functionality, we must stub a
		// replacement Promise library to prevent it from trying to access the
		// Promise global, which is not available in all supported environments
		promiseLibrary: function() {}
	} );

	// Use object source as dependant if getter not provided
	if ( ! getDependants ) {
		getDependants = identity;
	}

	/**
	 * The augmented selector call, considering first whether dependants have
	 * changed before passing it to underlying memoize function.
	 *
	 * @param  {Object} source Source object for derivation
	 * @param  {...*}   args   Additional arguments to pass to selector
	 * @return {*}             Selector result
	 */
	function callSelector( /* state, ...args */ ) {
		// Retrieve and normalize dependants as array
		var dependants = getDependants.apply( null, arguments );
		if ( ! Array.isArray( dependants ) ) {
			dependants = [ dependants ];
		}

		// Perform shallow comparison on this pass with the last. If references
		// have changed, destroy cache to recalculate memoized function result.
		if ( lastDependants && ! isShallowEqual( dependants, lastDependants ) ) {
			memoizedSelector.clear();
		}

		lastDependants = dependants;

		return memoizedSelector.apply( null, arguments );
	}

	callSelector.memoizedSelector = memoizedSelector;

	return callSelector;
}
