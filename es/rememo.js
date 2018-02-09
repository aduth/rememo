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
 * Returns true if the value passed is object-like, or false otherwise. A value
 * is object-like if it can support property assignment, e.g. object or array.
 *
 * @param  {*}       value Value to test
 * @return {Boolean}       Whether value is object-like
 */
function isObjectLike( value ) {
	return !! value && 'object' === typeof value;
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
	var LEAF_KEY = {},
		rootCache, maxSize;

	/**
	 * Returns the cache for a given dependants array. When possible, a WeakMap
	 * will be used to create a unique cache for each set of dependants. This
	 * is feasible due to the nature of WeakMap in allowing garbage collection
	 * to occur on entries where the key object is no longer referenced. Since
	 * WeakMap requires the key to be an object, this is only possible when the
	 * dependant is object-like. The root cache is created as a hierarchy where
	 * each top-level key is the first entry in a dependants set, the value a
	 * WeakMap where each key is the next dependant, and so on. This continues
	 * so long as the dependants are object-like. If no dependants are object-
	 * like, then the cache is shared across all invocations.
	 *
	 * @see isObjectLike
	 *
	 * @param {Array} dependants Selector dependants
	 *
	 * @return {Object} Cache object
	 */
	function getCache( dependants ) {
		var caches = rootCache,
			i, dependant, map, cache;

		for ( i = 0; i < dependants.length; i++ ) {
			dependant = dependants[ i ];

			// Can only compose WeakMap from object-like key.
			if ( ! isObjectLike( dependant ) ) {
				break;
			}

			// Does current segment of cache already have a WeakMap?
			if ( caches.has( dependant ) ) {
				// Traverse into nested WeakMap.
				caches = caches.get( dependant );
			} else {
				// Create, set, and traverse into a new one.
				map = new WeakMap();
				caches.set( dependant, map );
				caches = map;
			}
		}

		// We use an arbitrary (but consistent) object as key for the last item
		// in the WeakMap to serve as our running cache.
		if ( ! caches.has( LEAF_KEY ) ) {
			cache = {
				clear: function() {
					cache.head = null;
					cache.tail = null;
					cache.size = 0;
				}
			};

			// Initialize cache.
			cache.clear();

			caches.set( LEAF_KEY, cache );
		}

		return caches.get( LEAF_KEY );
	}

	// Pull max size from options, defaulting to Infinity (no limit)
	if ( options && options.maxSize > 0 ) {
		maxSize = options.maxSize;
	}

	// Use object source as dependant if getter not provided
	if ( ! getDependants ) {
		getDependants = identity;
	}

	/**
	 * Resets root memoization cache.
	 */
	function clear() {
		rootCache = new WeakMap();
	}

	/**
	 * The augmented selector call, considering first whether dependants have
	 * changed before passing it to underlying memoize function.
	 *
	 * @param  {Object} source    Source object for derivation
	 * @param  {...*}   extraArgs Additional arguments to pass to selector
	 * @return {*}                Selector result
	 */
	function callSelector( /* source, ...extraArgs */ ) {
		var len = arguments.length,
			cache, node, i, argsWithSource, args, dependants;

		// Create copies of arguments (avoid leaking deoptimization).
		argsWithSource = new Array( len );
		args = new Array( len - 1 );
		for ( i = 0; i < len; i++ ) {
			// Create one copy with source object intact, passed to dependants
			// getter and original selector.
			argsWithSource[ i ] = arguments[ i ];

			// Another copy omits state, used in arguments comparison and in
			// tracking arguments cache (avoid lingering reference to source
			// in cache which could prevent garbage collection).
			if ( i > 0 ) {
				args[ i - 1 ] = arguments[ i ];
			}
		}

		// Retrieve and normalize dependants as array
		dependants = getDependants.apply( null, argsWithSource );
		if ( ! Array.isArray( dependants ) ) {
			dependants = [ dependants ];
		}

		cache = getCache( dependants );

		// Perform shallow comparison on this pass with the last. If references
		// have changed, destroy cache to recalculate memoized function result.
		if ( cache.lastDependants && ! isShallowEqual( dependants, cache.lastDependants ) ) {
			cache.clear();
		}

		cache.lastDependants = dependants;

		node = cache.head;
		while ( node ) {
			// Check whether node arguments match arguments
			if ( ! isShallowEqual( node.args, args ) ) {
				node = node.next;
				continue;
			}

			// At this point we can assume we've found a match

			// Surface matched node to head if not already
			if ( node !== cache.head ) {
				// As tail, shift to previous. Must only shift if not also
				// head, since if both head and tail, there is no previous.
				if ( node === cache.tail ) {
					cache.tail = node.prev;
				}

				// Adjust siblings to point to each other. If node was tail,
				// this also handles new tail's empty `next` assignment.
				node.prev.next = node.next;
				if ( node.next ) {
					node.next.prev = node.prev;
				}

				node.next = cache.head;
				node.prev = null;
				cache.head.prev = node;
				cache.head = node;
			}

			// Return immediately
			return node.val;
		}

		// No cached value found. Continue to insertion phase:

		node = {
			args: args,

			// Generate the result from original function
			val: selector.apply( null, argsWithSource )
		};

		// Don't need to check whether node is already head, since it would
		// have been returned above already if it was

		// Shift existing head down list
		if ( cache.head ) {
			cache.head.prev = node;
			node.next = cache.head;
		} else {
			// If no head, follows that there's no tail (at initial or reset)
			cache.tail = node;
		}

		// Trim tail if we're reached max size and are pending cache insertion
		if ( cache.size === maxSize ) {
			cache.tail = cache.tail.prev;
			cache.tail.next = null;
		} else {
			cache.size++;
		}

		cache.head = node;

		return node.val;
	}

	callSelector.clear = clear;
	clear();

	return callSelector;
}
