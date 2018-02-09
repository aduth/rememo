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
	var maxSize, lastDependants, head, tail, size;

	// Pull max size from options, defaulting to Infinity (no limit)
	if ( options && options.maxSize > 0 ) {
		maxSize = options.maxSize;
	}

	// Use object source as dependant if getter not provided
	if ( ! getDependants ) {
		getDependants = identity;
	}

	/**
	 * Resets memoization cache to empty.
	 */
	function clear() {
		head = null;
		tail = null;
		size = 0;
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
			node, i, argsWithSource, args, dependants;

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

		// Perform shallow comparison on this pass with the last. If references
		// have changed, destroy cache to recalculate memoized function result.
		if ( lastDependants && ! isShallowEqual( dependants, lastDependants ) ) {
			clear();
		}

		lastDependants = dependants;

		node = head;
		while ( node ) {
			// Check whether node arguments match arguments
			if ( ! isShallowEqual( node.args, args ) ) {
				node = node.next;
				continue;
			}

			// At this point we can assume we've found a match

			// Surface matched node to head if not already
			if ( node !== head ) {
				// As tail, shift to previous. Must only shift if not also
				// head, since if both head and tail, there is no previous.
				if ( node === tail ) {
					tail = node.prev;
				}

				// Adjust siblings to point to each other. If node was tail,
				// this also handles new tail's empty `next` assignment.
				node.prev.next = node.next;
				if ( node.next ) {
					node.next.prev = node.prev;
				}

				node.next = head;
				node.prev = null;
				head.prev = node;
				head = node;
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
		if ( head ) {
			head.prev = node;
			node.next = head;
		} else {
			// If no head, follows that there's no tail (at initial or reset)
			tail = node;
		}

		// Trim tail if we're reached max size and are pending cache insertion
		if ( size === maxSize ) {
			tail = tail.prev;
			tail.next = null;
		} else {
			size++;
		}

		head = node;

		return node.val;
	}

	callSelector.clear = clear;
	clear();

	return callSelector;
}
