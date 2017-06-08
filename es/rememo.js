'use strict';

import memoize from 'moize';
import { getMultiParamKey } from 'moize/lib/utils';
import Cache from 'moize/lib/Cache';
import shallowEqual from 'shallow-equal/arrays';

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
 * Creates a custom serializer for memoization.
 *
 * @param  {moize.Cache} cache Moize cache instance
 * @return {Function}          Memoization serializer
 */
function createSerializer( cache ) {
	/**
	 * Serializes arguments for generating a cache key. This behaves more-or-
	 * less identical to moize's default `getCacheKey` behavior, with the
	 * exception that it ignores the first argument in generating the key.
	 *
	 * @param  {Array} args Memoized function arguments as array
	 * @return {*}          Cache key
	 */
	return function( args ) {
		if ( args.length > 2 ) {
			return getMultiParamKey( cache, args.slice( 1 ) );
		}

		return args[ 1 ];
	};
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
 * @return {*}                      Selector return value
 */
export default function( selector, getDependants ) {
	var cache, memoizedSelector, lastDependants;

	// We need to maintain our own cache in order to recreate the default cache
	// serialization behavior using moize's `getMultiParamKey` utility
	cache = new Cache();

	memoizedSelector = memoize( selector, {
		cache: cache,
		serialize: true,
		serializer: createSerializer( cache )
	} );

	if ( ! getDependants ) {
		getDependants = identity;
	}

	function callSelector() {
		var dependants = getDependants.apply( null, arguments );
		if ( ! Array.isArray( dependants ) ) {
			dependants = [ dependants ];
		}

		if ( lastDependants && ! shallowEqual( dependants, lastDependants ) ) {
			memoizedSelector.clear();
		}

		lastDependants = dependants;

		return memoizedSelector.apply( null, arguments );
	}

	callSelector.memoizedSelector = memoizedSelector;

	return callSelector;
}
