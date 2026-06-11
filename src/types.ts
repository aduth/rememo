export type GetDependants = (...args: any[]) => any[];

export type Clear = () => void;

export interface EnhancedSelector {
	getDependants: GetDependants;
	clear: Clear;
}

/**
 * Internal cache entry.
 */
export interface CacheNode {
	/**
	 * Previous node.
	 */
	prev?: CacheNode | null;

	/**
	 * Next node.
	 */
	next?: CacheNode | null;

	/**
	 * Function arguments for cache entry.
	 */
	args: any[];

	/**
	 * Function result.
	 */
	val: any;
}

export interface Cache {
	/**
	 * Function to clear cache.
	 */
	clear: Clear;

	/**
	 * Whether dependants are valid in considering cache uniqueness. A cache is
	 * unique if dependents are all arrays or objects.
	 */
	isUniqueByDependants?: boolean;

	/**
	 * Cache head.
	 */
	head?: CacheNode | null;

	/**
	 * Dependants from previous invocation.
	 */
	lastDependants?: any[];
}
