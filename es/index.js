'use strict';

import isShallowEqual from 'shallow-equal/arrays';

/**
 * Returns the first argument.
 *
 * @param  {*} value Value to return
 * @return {*}       Value returned
 */
function identity( value ) {
	return value;
}

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
 * @param  {?Object}  options       Selector options
 * @return {*}                      Selector return value
 */
export default function( selector, getDependants, options ) {
	var cache, lastDependants, maxSize;

	// Pull max size from options, defaulting to Infinity (no limit)
	if ( options && options.maxSize > 0 ) {
		maxSize = options.maxSize;
	} else {
		maxSize = Infinity;
	}

	// Use object source as dependant if getter not provided
	if ( ! getDependants ) {
		getDependants = identity;
	}

	/**
	 * Resets memoization cache to empty.
	 */
	function clear() {
		cache = [];
	}

	/**
	 * The augmented selector call, considering first whether dependants have
	 * changed before passing it to underlying memoize function.
	 *
	 * @param  {Object} source    Source object for derivation
	 * @param  {...*}   extraArgs Additional arguments to pass to selector
	 * @return {*}                Selector result
	 */
	function callSelector( /* state, ...extraArgs */ ) {
		var len = arguments.length,
			args = new Array( len ),
			nextCache = [ undefined ],
			i, dependants, argsSansState, result;

		// Copy arguments. Using a loop is shown to be most performant in V8 to
		// avoid arguments leaking deoptimization:
		//
		// https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
		for ( i = 0; i < len; i++ ) {
			args[ i ] = arguments[ i ];
		}

		// Retrieve and normalize dependants as array
		dependants = getDependants.apply( null, args );
		if ( ! Array.isArray( dependants ) ) {
			dependants = [ dependants ];
		}

		// Perform shallow comparison on this pass with the last. If references
		// have changed, destroy cache to recalculate memoized function result.
		if ( lastDependants && ! isShallowEqual( dependants, lastDependants ) ) {
			clear();
		}

		lastDependants = dependants;

		// Create copy of arguments except first index, used as "key" for cache
		// tuple. We don't consider first argument in sameness, so it's a waste
		// of memory to maintain reference.
		argsSansState = args.slice( 1 );

		// Try to find an entry in cache which matches arguments.
		for ( i = 0, len = cache.length; i < len; i++ ) {
			if ( ! result && isShallowEqual( cache[ i ][ 0 ], argsSansState ) ) {
				result = cache[ i ];
			} else {
				nextCache.push( cache[ i ] );
			}
		}

		// If no result found in cache, generate new
		if ( ! result ) {
			result = [ argsSansState, selector.apply( null, args ) ];
		}

		// Only need to update cache if result wasn't already top entry
		if ( cache[ 0 ] !== result ) {
			// Move result to top of stack (bias to recent access)
			nextCache[ 0 ] = result;

			// Trim cache if exceeding max size
			if ( nextCache.length > maxSize ) {
				nextCache.length = maxSize;
			}

			cache = nextCache;
		}

		return result[ 1 ];
	}

	callSelector.clear = clear;
	clear();

	return callSelector;
}
