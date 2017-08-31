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
 * @param  {?Object}  options       Selector options
 * @return {*}                      Selector return value
 */
var index = function( selector, getDependants, options ) {
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
	function callSelector( /* state, ...extraArgs */ ) {
		var len = arguments.length,
			node, i, args, dependants;

		// Retrieve and normalize dependants as array
		dependants = getDependants.apply( null, arguments );
		if ( ! Array.isArray( dependants ) ) {
			dependants = [ dependants ];
		}

		// Perform shallow comparison on this pass with the last. If references
		// have changed, destroy cache to recalculate memoized function result.
		if ( lastDependants && ! index$1( dependants, lastDependants ) ) {
			clear();
		}

		lastDependants = dependants;

		node = head;
		searchCache: while ( node ) {
			// Check whether node arguments match arguments
			for ( i = 1; i < len; i++ ) {
				if ( node.args[ i ] !== arguments[ i ] ) {
					node = node.next;
					continue searchCache;
				}
			}

			// At this point we can assume we've found a match

			// Surface matched node to head if not already
			if ( node !== head ) {
				// As tail, shift to previous. Must only shift if not also
				// head, since if both head and tail, there is no previous.
				if ( node === tail ) {
					tail = node.prev;
				}

				node.prev.next = node.next;
				node.next = head;
				node.prev = null;
				head.prev = node;
				head = node;
			}

			// Return immediately
			return node.val;
		}

		// No cached value found. Continue to insertion phase:

		// Create a copy of arguments (avoid leaking deoptimization). We could
		// create this as len - 1 and assign from index one, but this approach
		// avoids offsetting index in both this loop and the cache search above
		args = new Array( len );
		for ( i = 1; i < len; i++ ) {
			args[ i ] = arguments[ i ];
		}

		node = {
			args: args,

			// Generate the result from original function
			val: selector.apply( null, arguments )
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
};

return index;

}());
