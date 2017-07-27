var rememo = (function () {
'use strict';

var index$1 = function shallowEqualArrays(arrA, arrB) {
  if (arrA === arrB) {
    return true;
  }

  var len = arrA.length;

  if (arrB.length !== len) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }

  return true;
};

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
 * @return {*}                      Selector return value
 */
var index = function( selector, getDependants, options ) {
	var cache = [],
		lastDependants,
		maxSize;

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
	 * The memoized function, caching the result of the original function when
	 * passed arguments. Ignores first argument in considering cache reuse.
	 *
	 * @param  {Object} source Source object for derivation
	 * @param  {...*}   args   Additional arguments to pass to selector
	 * @return {*}             Selector result
	 */
	function memoizedSelector( /* state, ...args */ ) {
		var args = Array.prototype.slice.call( arguments, 1 ),
			nextCache = [ undefined ],
			i, il, result;

		// Try to find an entry in cache which matches arguments.
		for ( i = 0, il = cache.length; i < il; i++ ) {
			if ( ! result && index$1( cache[ i ][ 0 ], args ) ) {
				result = cache[ i ];
			} else {
				nextCache.push( cache[ i ] );
			}
		}

		// If no result found in cache, generate new
		if ( ! result ) {
			result = [ args, selector.apply( null, arguments ) ];
		}

		// Move result to top of stack (bias to recent access)
		nextCache[ 0 ] = result;

		// Trim cache if exceeding max size
		if ( nextCache.length > maxSize ) {
			nextCache.length = maxSize;
		}

		cache = nextCache;

		return result[ 1 ];
	}

	memoizedSelector.clear = function() {
		cache = [];
	};

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
		if ( lastDependants && ! index$1( dependants, lastDependants ) ) {
			memoizedSelector.clear();
		}

		lastDependants = dependants;

		return memoizedSelector.apply( null, arguments );
	}

	callSelector.memoizedSelector = memoizedSelector;

	return callSelector;
};

return index;

}());
