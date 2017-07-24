/**
 * Creates a shallow equality comparison function given an index at which to
 * start array comparison.
 *
 * @param  {Number}  index Index at which to start array comparison
 * @return {Function}      Shallow equality comparison function
 */
export default function createIsShallowEqualFromIndex( index ) {
	/**
	 * Returns true if the two arrays are shallowly equal from the scope index,
	 * or false otherwise.
	 *
	 * @param  {Array}   arrayA First array in comparison
	 * @param  {Array}   arrayB Second array in comparison
	 * @return {Boolean}        Whether arrays are equal from index
	 */
	return function( arrayA, arrayB ) {
		var i;
		if ( arrayA.length !== arrayB.length ) {
			return false;
		}

		for ( i = index; i < arrayA.length; i++ ) {
			if ( arrayA[ i ] !== arrayB[ i ] ) {
				return false;
			}
		}

		return true;
	};
}
