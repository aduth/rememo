var rememo = (function () {
'use strict';

function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var constants = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;


/**
 * @private
 *
 * @constant {number} INFINITY
 * @default
 */
var INFINITY = exports.INFINITY = Number.POSITIVE_INFINITY;

/**
 * @private
 *
 * @constant {string} INVALID_FIRST_PARAMETER_ERROR
 * @default
 */
// types
var INVALID_FIRST_PARAMETER_ERROR = exports.INVALID_FIRST_PARAMETER_ERROR = 'You must pass either a function or an object of options as the first parameter to moize.';

/**
 * @private
 *
 * @constant {string} NO_PROMISE_LIBRARY_EXISTS_ERROR_MESSAGE
 * @default
 */
var NO_PROMISE_LIBRARY_EXISTS_ERROR_MESSAGE = exports.NO_PROMISE_LIBRARY_EXISTS_ERROR_MESSAGE = 'You have not specified a promiseLibrary, and it appears that your browser does not support ' + 'native promises. You can either assign the library you are using to the global Promise object, or pass ' + 'the library in options via the "promiseLibrary" property.';

/**
 * @private
 *
 * @constant {IteratorDone} ITERATOR_DONE_OBJECT
 */
var ITERATOR_DONE_OBJECT = exports.ITERATOR_DONE_OBJECT = {
  done: true
};

/**
 * @private
 *
 * @constant {string|symbol} CACHE_IDENTIFIER
 * @default
 */
var CACHE_IDENTIFIER = exports.CACHE_IDENTIFIER = typeof Symbol === 'function' ? Symbol('isMoizeCache') : '__IS_MOIZE_CACHE__';

/**
 * @private
 *
 * @constant {string} ARRAY_OBJECT_CLASS
 * @default
 */
var ARRAY_OBJECT_CLASS = exports.ARRAY_OBJECT_CLASS = '[object Array]';

/**
 * @private
 *
 * @constant {string} FUNCTION_TYPEOF
 * @default
 */
var FUNCTION_TYPEOF = exports.FUNCTION_TYPEOF = 'function';

/**
 * @private
 *
 * @constant {RegExp} FUNCTION_NAME_REGEXP
 */
var FUNCTION_NAME_REGEXP = exports.FUNCTION_NAME_REGEXP = /^\s*function\s+([^\(\s]*)\s*/;

/**
 * @private
 *
 * @constant {string} OBJECT_TYPEOF
 * @default
 */
var OBJECT_TYPEOF = exports.OBJECT_TYPEOF = 'object';

/**
 * @private
 *
 * @constant {Array<Object>} GOTCHA_OBJECT_CLASSES
 */
var GOTCHA_OBJECT_CLASSES = exports.GOTCHA_OBJECT_CLASSES = [Boolean, Date, Number, RegExp, String];

/**
 * @private
 *
 * @constant {Array<string>} STATIC_PROPERTIES_TO_PASS
 */
var STATIC_PROPERTIES_TO_PASS = exports.STATIC_PROPERTIES_TO_PASS = ['contextTypes', 'defaultProps', 'propTypes'];

/**
 * @private
 *
 * @constant {number} STATIC_PROPERTIES_TO_PASS_LENGTH
 */
var STATIC_PROPERTIES_TO_PASS_LENGTH = exports.STATIC_PROPERTIES_TO_PASS_LENGTH = STATIC_PROPERTIES_TO_PASS.length;
});

var utils = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;
exports.createSetNewCachedValue = exports.createPromiseResolver = exports.createPromiseRejecter = exports.createSetExpirationOfCache = exports.createGetCacheKey = exports.getSerializerFunction = exports.createArgumentSerializer = exports.getStringifiedArgument = exports.stringify = exports.getIndexOfKey = exports.isFiniteAndPositive = exports.createAddPropertiesToFunction = exports.getMultiParamKey = exports.isKeyShallowEqualWithArgs = exports.deleteItemFromCache = exports.decycle = exports.customReplacer = exports.isValueObjectOrArray = exports.isPlainObject = exports.isFunction = exports.isComplexObject = exports.isArray = exports.isArrayFallback = exports.getFunctionName = exports.getFunctionNameViaRegexp = exports.createPluckFromInstanceList = exports.createCurriableOptionMethod = exports.isCache = exports.unshift = exports.splice = exports.every = exports.compose = exports.addStaticPropertiesToFunction = exports.toString = exports.keys = exports.jsonStringify = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// cache


// constants




var _Cache2 = _interopRequireDefault(Cache_1);



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// types
var jsonStringify = exports.jsonStringify = JSON.stringify;
var keys = exports.keys = Object.keys;
var toString = exports.toString = Object.prototype.toString;

/**
 * @private
 *
 * @function addStaticPropertiesToFunction
 *
 * @description
 * add static properties to the memoized function if they exist on the original
 *
 * @param {function} originalFunction the function to be memoized
 * @param {function} memoizedFn the higher-order memoized function
 * @returns {function} memoizedFn with static properties added
 */
var addStaticPropertiesToFunction = exports.addStaticPropertiesToFunction = function addStaticPropertiesToFunction(originalFunction, memoizedFn) {
  var index = constants.STATIC_PROPERTIES_TO_PASS_LENGTH,
      property = void 0;

  while (index--) {
    property = constants.STATIC_PROPERTIES_TO_PASS[index];

    if (originalFunction[property]) {
      memoizedFn[property] = originalFunction[property];
    }
  }

  return memoizedFn;
};

/**
 * @private
 *
 * @function compose
 *
 * @description
 * method to compose functions and return a single function
 *
 * @param {...Array<function>} functions the functions to compose
 * @returns {function(...Array<*>): *} the composed function
 */
var compose = exports.compose = function compose() {
  for (var _len = arguments.length, functions = Array(_len), _key = 0; _key < _len; _key++) {
    functions[_key] = arguments[_key];
  }

  return functions.reduce(function (f, g) {
    return function () {
      return f(g.apply(undefined, arguments));
    };
  });
};

/**
 * @private
 *
 * @function every
 *
 * @description
 * faster version of determining every item in array matches fn check
 *
 * @param {Array<*>} array array to test
 * @param {function} fn fn to test each item against
 * @returns {boolean} do all values match
 */
var every = exports.every = function every(array, fn) {
  if (!array.length) {
    return true;
  }

  var index = array.length;

  while (index--) {
    if (!fn(array[index], index)) {
      return false;
    }
  }

  return true;
};

/**
 * @private
 *
 * @function splice
 *
 * @description
 * faster version of splicing a single item from the array
 *
 * @param {Array<*>} array array to splice from
 * @param {number} startingIndex index to splice at
 * @returns {Array<*>} array minus the item removed
 */
var splice = exports.splice = function splice(array, startingIndex) {
  if (!array.length) {
    return array;
  }

  var index = startingIndex - 1;

  while (++index < array.length) {
    array[index] = array[index + 1];
  }

  array.length -= 1;

  return array;
};

/**
 * @private
 *
 * @function unshift
 *
 * @description
 * faster version of unshifting a single item into an array
 *
 * @param {Array<*>} array array to unshift into
 * @param {*} item item to unshift into array
 * @returns {*} the item just added to the array
 */
var unshift = exports.unshift = function unshift(array, item) {
  var index = array.length;

  while (index--) {
    array[index + 1] = array[index];
  }

  return array[0] = item;
};

/**
 * @private
 *
 * @function isCache
 *
 * @description
 * is the object passed an instance of the native Cache implementation
 *
 * @param {*} object object to test
 * @returns {boolean} is the object an instance of Cache
 */
var isCache = exports.isCache = function isCache(object) {
  return !!object[constants.CACHE_IDENTIFIER];
};

/**
 * @private
 *
 * @function createCurriableOptionMethod
 *
 * @description
 * create a method that will curry moize with the option + value passed
 *
 * @param {function} fn the method to call
 * @param {string} option the name of the option to apply
 * @param {*} value the value to assign to option
 * @returns {function} the moizer with the option pre-applied
 */
var createCurriableOptionMethod = exports.createCurriableOptionMethod = function createCurriableOptionMethod(fn, option) {
  return function (value) {
    var _fn;

    return fn((_fn = {}, _fn[option] = value, _fn));
  };
};

/**
 * @private
 *
 * @function createPluckFromInstanceList
 *
 * @description
 * get a property from the list on the cache
 *
 * @param {{list: Array<Object>}} cache cache whose list to map over
 * @param {string} key key to pluck from list
 * @returns {Array<*>} array of values plucked at key
 */
var createPluckFromInstanceList = exports.createPluckFromInstanceList = function createPluckFromInstanceList(cache, key) {
  return !isCache(cache) ? function () {} : function () {
    return cache.list.map(function (item) {
      return item[key];
    });
  };
};

/**
 * @private
 *
 * @function getFunctionNameViaRegexp
 *
 * @description
 * use regexp match on stringified function to get the function name
 *
 * @param {function} fn function to get the name of
 * @returns {string} function name
 */
var getFunctionNameViaRegexp = exports.getFunctionNameViaRegexp = function getFunctionNameViaRegexp(fn) {
  var match = fn.toString().match(constants.FUNCTION_NAME_REGEXP);

  return match ? match[1] : '';
};

/**
 * @private
 *
 * @function getFunctionName
 *
 * @description
 * get the function name, either from modern property or regexp match,
 * falling back to generic string
 *
 * @param {function} fn function to get the name of
 * @returns {string} function name
 */
var getFunctionName = exports.getFunctionName = function getFunctionName(fn) {
  return fn.displayName || fn.name || getFunctionNameViaRegexp(fn) || constants.FUNCTION_TYPEOF;
};

/**
 * @private
 *
 * @function isArrayFallback
 *
 * @description
 * provide fallback for native Array.isArray test
 *
 * @param {*} object object to test if it is an array
 * @returns {boolean} is the object passed an array or not
 */
var isArrayFallback = exports.isArrayFallback = function isArrayFallback(object) {
  return toString.call(object) === constants.ARRAY_OBJECT_CLASS;
};

/**
 * @private
 *
 * @function isArray
 *
 * @description
 * isArray function to use internally, either the native one or fallback
 *
 * @param {*} object object to test if it is an array
 * @returns {boolean} is the object passed an array or not
 */
var isArray = exports.isArray = Array.isArray || isArrayFallback;

/**
 * @private
 *
 * @function isComplexObject
 *
 * @description
 * is the object passed a complex object
 *
 * @param {*} object object to test if it is complex
 * @returns {boolean} is it a complex object
 */
var isComplexObject = exports.isComplexObject = function isComplexObject(object) {
  return !!object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === constants.OBJECT_TYPEOF;
};

/**
 * @private
 *
 * @function isFunction
 *
 * @description
 * is the object passed a function or not
 *
 * @param {*} object object to test
 * @returns {boolean} is it a function
 */
var isFunction = exports.isFunction = function isFunction(object) {
  return (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === constants.FUNCTION_TYPEOF;
};

/**
 * @private
 *
 * @function isPlainObject
 *
 * @description
 * is the object passed a plain object or not
 *
 * @param {*} object object to test
 * @returns {boolean} is it a plain object
 */
var isPlainObject = exports.isPlainObject = function isPlainObject(object) {
  return isComplexObject(object) && object.constructor === Object;
};

/**
 * @private
 *
 * @function isValueObjectOrArray
 *
 * @description
 * check if the object is actually an object or array
 *
 * @param {*} object object to test
 * @returns {boolean} is the object an object or array
 */
var isValueObjectOrArray = exports.isValueObjectOrArray = function isValueObjectOrArray(object) {
  return isComplexObject(object) && every(constants.GOTCHA_OBJECT_CLASSES, function (Class) {
    return !(object instanceof Class);
  });
};

/**
 * @private
 *
 * @function customReplacer
 *
 * @description
 * custom replacer for the stringify function
 *
 * @param {string} key key in json object
 * @param {*} value value in json object
 * @returns {*} if function then toString of it, else the value itself
 */
var customReplacer = exports.customReplacer = function customReplacer(key, value) {
  return isFunction(value) ? '' + value : value;
};

/**
 * @private
 *
 * @function decycle
 *
 * @description
 * ES2015-ified version of cycle.decyle
 *
 * @param {*} object object to stringify
 * @returns {string} stringified value of object
 */
var decycle = exports.decycle = function decycle(object) {
  var cache = new _Cache2.default();

  /**
   * @private
   *
   * @function coalesceCircularReferences
   *
   * @description
   * recursive method to replace any circular references with a placeholder
   *
   * @param {*} value value in object to decycle
   * @param {string} path path to reference
   * @returns {*} clean value
   */
  var coalesceCircularReferences = function coalesceCircularReferences(value, path) {
    if (!isValueObjectOrArray(value)) {
      return value;
    }

    if (cache.has(value)) {
      return {
        $ref: cache.get(value)
      };
    }

    cache.set(value, path);

    if (isArray(value)) {
      return value.map(function (item, itemIndex) {
        return coalesceCircularReferences(item, path + '[' + itemIndex + ']');
      });
    }

    return keys(value).reduce(function (object, name) {
      object[name] = coalesceCircularReferences(value[name], path + '[' + JSON.stringify(name) + ']');

      return object;
    }, {});
  };

  return coalesceCircularReferences(object, '$');
};

/**
 * @private
 *
 * @function deleteItemFromCache
 *
 * @description
 * remove an item from cache
 *
 * @param {Cache} cache caching mechanism for method
 * @param {*} key key to delete
 * @param {boolean} [isKeyLastItem=false] should the key be the last item in the LRU list
 */
var deleteItemFromCache = exports.deleteItemFromCache = function deleteItemFromCache(cache, key) {
  var isKeyLastItem = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (isKeyLastItem && isCache(cache)) {
    key = cache.list[cache.list.length - 1].key;
  }

  if (cache.has(key)) {
    cache.delete(key);
  }
};

/**
 * @private
 *
 * @function isKeyShallowEqualWithArgs
 *
 * @description
 * is the value passed shallowly equal with the args
 *
 * @param {*} value the value to compare
 * @param {Array<*>} args the args to test
 * @returns {boolean} are the args shallow equal to the value
 */
var isKeyShallowEqualWithArgs = exports.isKeyShallowEqualWithArgs = function isKeyShallowEqualWithArgs(value, args) {
  return value.isMultiParamKey && value.key.length === args.length && every(args, function (arg, index) {
    return arg === value.key[index];
  });
};

/**
 * @private
 *
 * @function getMultiParamKey
 *
 * @description
 * get the multi-parameter key that either matches a current one in state or is the same as the one passed
 *
 * @param {Cache} cache cache to compare args to
 * @param {Array<*>} args arguments passed to moize get key
 * @returns {Array<*>} either a matching key in cache or the same key as the one passed
 */
var getMultiParamKey = exports.getMultiParamKey = function getMultiParamKey(cache, args) {
  if (cache.lastItem && isKeyShallowEqualWithArgs(cache.lastItem, args)) {
    return cache.lastItem.key;
  }

  var iterator = cache.getKeyIterator();

  var iteration = void 0;

  while ((iteration = iterator.next()) && !iteration.done) {
    if (isKeyShallowEqualWithArgs(iteration, args)) {
      return iteration.key;
    }
  }

  // $FlowIgnore ok to add key to array object
  args.isMultiParamKey = true;

  return args;
};

/**
 * @private
 *
 * @function createAddPropertiesToFunction
 *
 * @description
 * add the caching mechanism to the function passed and return the function
 *
 * @param {Cache} cache caching mechanism that has get / set / has methods
 * @param {function} originalFunction function to get the name of
 * @param {Options} options the options for the given memoized function
 * @returns {function(function): function} method that has cache mechanism added to it
 */
var createAddPropertiesToFunction = exports.createAddPropertiesToFunction = function createAddPropertiesToFunction(cache, originalFunction, options) {
  return function (fn) {
    fn.cache = cache;
    fn.displayName = 'Memoized(' + getFunctionName(originalFunction) + ')';
    fn.isMemoized = true;
    fn.options = options;
    fn.originalFunction = originalFunction;

    /**
     * @private
     *
     * @function add
     *
     * @description
     * manually add an item to cache if the key does not already exist
     *
     * @param {*} key key to use in cache
     * @param {*} value value to assign to key
     */
    fn.add = function (key, value) {
      if (!cache.has(key) && getMultiParamKey(cache, key) === key) {
        cache.set(key, value);
      }
    };

    /**
     * @private
     *
     * @function clear
     *
     * @description
     * clear the current cache for this method
     */
    fn.clear = function () {
      cache.clear();
    };

    /**
     * @private
     *
     * @function delete
     *
     * @description
     * delete the cache for the key passed for this method
     *
     * @param {Array<*>} args combination of args to remove from cache
     */
    fn.delete = function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var key = args.length === 1 && args[0].isMultiParamKey ? args[0] : getMultiParamKey(cache, args);

      deleteItemFromCache(cache, key);
    };

    /**
     * @private
     *
     * @function keys
     *
     * @description
     * get the list of keys currently in cache
     *
     * @returns {Array<*>}
     */
    fn.keys = createPluckFromInstanceList(cache, 'key');

    /**
     * @private
     *
     * @function values
     *
     * @description
     * get the list of values currently in cache
     *
     * @returns {Array<*>}
     */
    fn.values = createPluckFromInstanceList(cache, 'value');

    return addStaticPropertiesToFunction(originalFunction, fn);
  };
};

/**
 * @private
 *
 * @function isFiniteAndPositive
 *
 * @description
 * is the number passed finite and positive
 *
 * @param {number} number number to test for finiteness and positivity
 * @returns {boolean} is the number finite and positive
 */
var isFiniteAndPositive = exports.isFiniteAndPositive = function isFiniteAndPositive(number) {
  return number === ~~number && number > 0;
};

/**
 * @private
 *
 * @function getIndexOfKey
 *
 * @description
 * get the index of the key in the map
 *
 * @param {Cache} cache cache to iterate over
 * @param {*} key key to find in list
 * @returns {number} index location of key in list
 */
var getIndexOfKey = exports.getIndexOfKey = function getIndexOfKey(cache, key) {
  var iterator = cache.getKeyIterator();

  var iteration = void 0;

  while ((iteration = iterator.next()) && !iteration.done) {
    if (iteration.key === key) {
      return iteration.index;
    }
  }

  return -1;
};

/**
 * @private
 *
 * @function stringify
 *
 * @description
 * stringify with a custom replacer if circular, else use standard JSON.stringify
 *
 * @param {*} value value to stringify
 * @param {function} [replacer] replacer to used in stringification
 * @returns {string} the stringified version of value
 */
var stringify = exports.stringify = function stringify(value, replacer) {
  try {
    return jsonStringify(value, replacer);
  } catch (exception) {
    return jsonStringify(decycle(value), replacer);
  }
};

/**
 * @private
 *
 * @function getStringifiedArgument
 *
 * @description
 * get the stringified version of the argument passed
 *
 * @param {*} arg argument to stringify
 * @param {function} [replacer] replacer to used in stringification
 * @returns {string}
 */
var getStringifiedArgument = exports.getStringifiedArgument = function getStringifiedArgument(arg, replacer) {
  return isComplexObject(arg) ? stringify(arg, replacer) : arg;
};

/**
 * @private
 *
 * @function createArgumentSerializer
 *
 * @description
 * create the internal argument serializer based on the options passed
 *
 * @param {boolean} serializeFunctions should functions be included in the serialization
 * @param {number} maxArgs the cap on the number of arguments used in serialization
 * @returns {function(...Array<*>): string} argument serialization method
 */
var createArgumentSerializer = exports.createArgumentSerializer = function createArgumentSerializer(serializeFunctions, maxArgs) {
  var replacer = serializeFunctions ? customReplacer : null;
  var hasMaxArgs = isFiniteAndPositive(maxArgs);

  return function (args) {
    var length = hasMaxArgs ? maxArgs : args.length;

    var index = -1,
        key = '|';

    while (++index < length) {
      key += getStringifiedArgument(args[index], replacer) + '|';
    }

    return key;
  };
};

/**
 * @private
 *
 * @function getSerializerFunction
 *
 * @description
 * based on the options passed, either use the serializer passed or generate the internal one
 *
 * @param {function} [serializerFromOptions] serializer function passed into options
 * @param {boolean} serializeFunctions should functions be included in the serialization
 * @param {number} maxArgs the cap on the number of arguments used in serialization
 * @returns {function} the function to use in serializing the arguments
 */
var getSerializerFunction = exports.getSerializerFunction = function getSerializerFunction(serializerFromOptions, serializeFunctions, maxArgs) {
  // $FlowIgnore
  return isFunction(serializerFromOptions) ? serializerFromOptions : createArgumentSerializer(serializeFunctions, maxArgs);
};

/**
 * @private
 *
 * @function createGetCacheKey
 *
 * @description
 * get the key used for storage in the method's cache
 *
 * @param {Cache} cache cache where keys are stored
 * @param {boolean} serialize should the arguments be serialized into a string
 * @param {function} serializerFromOptions method used to serialize keys into a string
 * @param {boolean} serializeFunctions should functions be converted to string in serialization
 * @param {number} maxArgs the maximum number of arguments to use in the serialization
 * @returns {function(Array<*>): *}
 */
var createGetCacheKey = exports.createGetCacheKey = function createGetCacheKey(cache, serialize, serializerFromOptions, serializeFunctions, maxArgs) {
  if (serialize) {
    var serializeArguments = getSerializerFunction(serializerFromOptions, serializeFunctions, maxArgs);

    return function (args) {
      return serializeArguments(args);
    };
  }

  if (isFiniteAndPositive(maxArgs)) {
    return function (args) {
      return args.length > 1 ? getMultiParamKey(cache, args.slice(0, maxArgs)) : args[0];
    };
  }

  return function (args) {
    return args.length > 1 ? getMultiParamKey(cache, args) : args[0];
  };
};

/**
 * @private
 *
 * @function setExpirationOfCache
 *
 * @description
 * create function to set the cache to expire after the maxAge passed (coalesced to 0)
 *
 * @param {number} maxAge number in ms to wait before expiring the cache
 * @returns {function(Cache, Array<*>): void} setExpirationOfCache method
 */
var createSetExpirationOfCache = exports.createSetExpirationOfCache = function createSetExpirationOfCache(maxAge) {
  return function (cache, key) {
    setTimeout(function () {
      deleteItemFromCache(cache, key);
    }, maxAge);
  };
};

/**
 * @private
 *
 * @function createPromiseRejecter
 *
 * @description
 * create method that will reject the promise and delete the key from cache
 *
 * @param {Cache} cache cache to update
 * @param {*} key key to delete from cache
 * @param {function} PromiseLibrary the promise library used
 * @returns {function} the rejecter function for the promise
 */
var createPromiseRejecter = exports.createPromiseRejecter = function createPromiseRejecter(cache, key, PromiseLibrary) {
  return function (exception) {
    cache.delete(key);

    return PromiseLibrary.reject(exception);
  };
};

/**
 * @private
 *
 * @function createPromiseResolver
 *
 * @description
 * create method that will resolve the promise and update the key in cache
 *
 * @param {Cache} cache cache to update
 * @param {*} key key to update in cache
 * @param {boolean} hasMaxAge should the cache expire after some time
 * @param {function} setExpirationOfCache function to set the expiration of cache
 * @param {function} PromiseLibrary the promise library used
 * @returns {function} the resolver function for the promise
 */
var createPromiseResolver = exports.createPromiseResolver = function createPromiseResolver(cache, key, hasMaxAge, setExpirationOfCache, PromiseLibrary) {
  return function (resolvedValue) {
    cache.updateItem(key, PromiseLibrary.resolve(resolvedValue));

    if (hasMaxAge) {
      setExpirationOfCache(cache, key);
    }

    return resolvedValue;
  };
};

/**
 * @private
 *
 * @function createSetNewCachedValue
 *
 * @description
 * assign the new value to the key in the functions cache and return the value
 *
 * @param {Cache} cache the cache to assign the value to at key
 * @param {boolean} isPromise is the value a promise or not
 * @param {number} maxAge how long should the cache persist
 * @param {number} maxSize the maximum number of values to store in cache
 * @param {Function} PromiseLibrary the library to use for resolve / reject
 * @returns {function(function, *, *): *} value just stored in cache
 */
var createSetNewCachedValue = exports.createSetNewCachedValue = function createSetNewCachedValue(cache, isPromise, maxAge, maxSize, PromiseLibrary) {
  var hasMaxAge = isFiniteAndPositive(maxAge);
  var hasMaxSize = isFiniteAndPositive(maxSize);
  var setExpirationOfCache = createSetExpirationOfCache(maxAge);

  if (isPromise) {
    return function (key, value) {
      var promiseResolver = createPromiseResolver(cache, key, hasMaxAge, setExpirationOfCache, PromiseLibrary);
      var promiseRejecter = createPromiseRejecter(cache, key, PromiseLibrary);

      var handler = value.then(promiseResolver, promiseRejecter);

      cache.set(key, handler);

      if (hasMaxSize && cache.size > maxSize) {
        deleteItemFromCache(cache, undefined, true);
      }

      return handler;
    };
  }

  return function (key, value) {
    cache.set(key, value);

    if (hasMaxAge) {
      setExpirationOfCache(cache, key);
    }

    if (hasMaxSize && cache.size > maxSize) {
      deleteItemFromCache(cache, undefined, true);
    }

    return value;
  };
};
});

var utils_13 = utils.getMultiParamKey;

var Cache_1 = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;





function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// constants


// utils


// types


/**
 * @class Cache
 * @classdesc class that mimics parts of the Map infrastructure, but faster
 */
var Cache = function () {
  function Cache() {
    _classCallCheck(this, Cache);

    this[constants.CACHE_IDENTIFIER] = true;
    this.lastItem = undefined;
    this.list = [];
    this.size = 0;
  }
  // $FlowIgnore computed properties not yet supported on classes


  /**
   * @function clear
   * @memberof Cache
   * @instance
   *
   * @description
   * remove all keys from the map
   */
  Cache.prototype.clear = function clear() {
    this.list.length = 0;

    this.setLastItem();
  };

  /**
   * @function delete
   * @memberof Cache
   * @instance
   *
   * @description
   * remove the key from the map
   *
   * @param {*} key key to delete from the map
   */


  Cache.prototype.delete = function _delete(key) {
    var index = (0, utils.getIndexOfKey)(this, key);

    if (~index) {
      (0, utils.splice)(this.list, index);

      this.setLastItem(this.list[0]);
    }
  };

  /**
   * @function get
   * @memberof Cache
   * @instance
   *
   * @description
   * get the value for the given key
   *
   * @param {*} key key to get the value for
   * @returns {*} value at the key location
   */


  Cache.prototype.get = function get(key) {
    if (!this.lastItem) {
      return undefined;
    }

    if (key === this.lastItem.key) {
      return this.lastItem.value;
    }

    var index = (0, utils.getIndexOfKey)(this, key);

    if (~index) {
      var item = this.list[index];

      this.setLastItem((0, utils.unshift)((0, utils.splice)(this.list, index), item));

      return item.value;
    }
  };

  /**
   * @function getKeyIterator
   * @memberof Cache
   * @instance
   *
   * @description
   * create a custom iterator for the keys in the list
   *
   * @returns {{next: (function(): Object)}} iterator instance
   */


  Cache.prototype.getKeyIterator = function getKeyIterator() {
    var _this = this;

    var index = -1;

    return {
      next: function next() {
        return ++index >= _this.size ? constants.ITERATOR_DONE_OBJECT : {
          index: index,
          isMultiParamKey: _this.list[index].isMultiParamKey,
          key: _this.list[index].key
        };
      }
    };
  };

  /**
   * @function has
   * @memberof Cache
   * @instance
   *
   * @description
   * does the map have the key provided
   *
   * @param {*} key key to test for in the map
   * @returns {boolean} does the map have the key
   */


  Cache.prototype.has = function has(key) {
    // $FlowIgnore: this.lastItem exists
    return this.size !== 0 && (key === this.lastItem.key || !!~(0, utils.getIndexOfKey)(this, key));
  };

  /**
   * @function set
   * @memberof Cache
   * @instance
   *
   * @description
   * set the value at the key location, or add a new item with that key value
   *
   * @param {*} key key to assign value of
   * @param {*} value value to store in the map at key
   */


  Cache.prototype.set = function set(key, value) {
    this.setLastItem((0, utils.unshift)(this.list, {
      key: key,
      isMultiParamKey: !!(key && key.isMultiParamKey),
      value: value
    }));
  };

  /**
   * @function setLastItem
   * @memberof Cache
   * @instance
   *
   * @description
   * assign the lastItem
   *
   * @param {ListItem|undefined} lastItem the item to assign
   */


  Cache.prototype.setLastItem = function setLastItem(lastItem) {
    this.lastItem = lastItem;
    this.size = this.list.length;
  };

  /**
   * @function updateItem
   * @memberof Cache
   * @instance
   *
   * @description
   * update an item in-place with a new value
   *
   * @param {*} key key to update value of
   * @param {*} value value to store in the map at key
   */


  Cache.prototype.updateItem = function updateItem(key, value) {
    var index = (0, utils.getIndexOfKey)(this, key);

    if (~index) {
      this.list[index].value = value;

      if (this.lastItem && key === this.lastItem.key) {
        this.lastItem.value = value;
      }
    }
  };

  return Cache;
}();

exports.default = Cache;
module.exports = exports['default'];
});

var Cache = unwrapExports(Cache_1);

var index = createCommonjsModule(function (module, exports) {
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// cache


// constants


// utils


// types




var _Cache2 = _interopRequireDefault(Cache_1);





function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module moize
 */

/**
 * @constant {{isPromise: true}} PROMISE_OPTIONS
 */
var PROMISE_OPTIONS = {
  isPromise: true
};

/**
 * @constant {{maxArgs: number, serialize: boolean, serializeFunctions: boolean}} REACT_OPTIONS
 */
var REACT_OPTIONS = {
  maxArgs: 2,
  serialize: true,
  serializeFunctions: true
};

/**
 * @constant {{serialize: boolean}} SERIALIZE_OPTIONS
 */
var SERIALIZE_OPTIONS = {
  serialize: true
};

/**
 * @function moize
 *
 * @description
 * store cached values returned from calling method with arguments to avoid reprocessing data from same arguments
 *
 * @example
 * import moize from 'moize';
 *
 * // standard implementation
 * const fn = (foo, bar) => {
 *  return `${foo} ${bar}`;
 * };
 * const memoizedFn = moize(fn);
 *
 * // implementation with options
 * const fn = async (id) => {
 *  return get(`http://foo.com/${id}`);
 * };
 * const memoizedFn = moize(fn, {
 *  isPromise: true,
 *  maxSize: 5
 * });
 *
 * @param {function} functionOrComposableOptions method to memoize
 * @param {Options} [passedOptions={}] options to customize how the caching is handled
 * @param {Cache} [passedOptions.cache=new Cache()] caching mechanism to use for method
 * @param {boolean} [passedOptions.isPromise=false] is the function return expected to be a promise to resolve
 * @param {number} [passedOptions.maxAge=Infinity] the maximum age the value should persist in cache
 * @param {number} [passedOptions.maxArgs=Infinity] the maximum number of arguments to be used in serializing the keys
 * @param {number} [passedOptions.maxSize=Infinity] the maximum size of the cache to retain
 * @param {function} [passedOptions.promiseLibrary=Promise] promise library to use for resolution / rejection
 * @param {function} [passedOptions.serializeFunctions=false] should function parameters be serialized as well
 * @param {function} [passedOptions.serializer] method to serialize arguments with for cache storage
 * @returns {Function} higher-order function which either returns from cache or newly-computed value
 */
var moize = function moize(functionOrComposableOptions) {
  var passedOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if ((0, utils.isPlainObject)(functionOrComposableOptions)) {
    return function (fn) {
      var otherOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return moize(fn, _extends({}, functionOrComposableOptions, otherOptions));
    };
  }

  if (!(0, utils.isFunction)(functionOrComposableOptions)) {
    throw new TypeError(constants.INVALID_FIRST_PARAMETER_ERROR);
  }

  var isComposed = functionOrComposableOptions.isMemoized;
  // $FlowIgnore the value of the property is a function
  var fn = isComposed ? functionOrComposableOptions.originalFunction : functionOrComposableOptions;
  var options = !isComposed ? passedOptions : _extends({}, functionOrComposableOptions.options, passedOptions);

  var _options$cache = options.cache,
      cache = _options$cache === undefined ? new _Cache2.default() : _options$cache,
      _options$isPromise = options.isPromise,
      isPromise = _options$isPromise === undefined ? false : _options$isPromise,
      _options$maxAge = options.maxAge,
      maxAge = _options$maxAge === undefined ? constants.INFINITY : _options$maxAge,
      _options$maxArgs = options.maxArgs,
      maxArgs = _options$maxArgs === undefined ? constants.INFINITY : _options$maxArgs,
      _options$maxSize = options.maxSize,
      maxSize = _options$maxSize === undefined ? constants.INFINITY : _options$maxSize,
      _options$promiseLibra = options.promiseLibrary,
      promiseLibrary = _options$promiseLibra === undefined ? Promise : _options$promiseLibra,
      _options$serialize = options.serialize,
      serialize = _options$serialize === undefined ? false : _options$serialize,
      _options$serializeFun = options.serializeFunctions,
      serializeFunctions = _options$serializeFun === undefined ? false : _options$serializeFun,
      serializer = options.serializer;


  if (isPromise && !promiseLibrary) {
    throw new ReferenceError(constants.NO_PROMISE_LIBRARY_EXISTS_ERROR_MESSAGE);
  }

  var addPropertiesToFunction = (0, utils.createAddPropertiesToFunction)(cache, fn, options);
  var getCacheKey = (0, utils.createGetCacheKey)(cache, serialize, serializer, serializeFunctions, maxArgs);
  var setNewCachedValue = (0, utils.createSetNewCachedValue)(cache, isPromise, maxAge, maxSize, promiseLibrary);

  var key = void 0;

  /**
   * @private
   *
   * @function memoizedFunction
   *
   * @description
   * higher-order function which either returns from cache or stores newly-computed value and returns it
   *
   * @param {Array<*>} args arguments passed to method
   * @returns {any} value resulting from executing of fn passed to memoize
   */
  var memoizedFunction = function memoizedFunction() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    key = getCacheKey(args);

    return cache.has(key) ? cache.get(key) : setNewCachedValue(key, fn.apply(this, args));
  };

  return addPropertiesToFunction(memoizedFunction);
};

moize.compose = utils.compose;
moize.maxAge = (0, utils.createCurriableOptionMethod)(moize, 'maxAge');
moize.maxArgs = (0, utils.createCurriableOptionMethod)(moize, 'maxArgs');
moize.maxSize = (0, utils.createCurriableOptionMethod)(moize, 'maxSize');
moize.promise = moize(PROMISE_OPTIONS);
moize.react = moize(REACT_OPTIONS);
moize.serialize = moize(SERIALIZE_OPTIONS);
moize.simple = moize.maxSize(1);

exports.default = moize;
module.exports = exports['default'];
});

var memoize = unwrapExports(index);

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
			return utils_13( cache, args.slice( 1 ) );
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
var rememo = function( selector, getDependants ) {
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

		if ( lastDependants && ! index$1( dependants, lastDependants ) ) {
			memoizedSelector.clear();
		}

		lastDependants = dependants;

		return memoizedSelector.apply( null, arguments );
	}

	callSelector.memoizedSelector = memoizedSelector;

	return callSelector;
};

return rememo;

}());
