var rememo = (function () {
'use strict';

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// utils
/**
 * @private
 *
 * @class ReactCacheKey
 *
 * @classdesc
 * cache key used specifically for react components
 */

var ReactCacheKey = function () {
  function ReactCacheKey(key) {
    _classCallCheck$1(this, ReactCacheKey);

    this.key = null;

    this.key = {
      context: this._getKeyPart(key[1]),
      props: this._getKeyPart(key[0])
    };

    return this;
  }

  /**
   * @function _getKeyPart
   * @memberof ReactCacheKey
   * @instance
   *
   * @description
   * get the object of metadata for the key part
   *
   * @param {Object} keyPart the key part to get the metadata of
   * @returns {Object} the metadata for the key part
   */
  ReactCacheKey.prototype._getKeyPart = function _getKeyPart(keyPart) {
    var keys = keyPart ? Object.keys(keyPart) : [];

    return {
      keys: keys,
      size: keys.length,
      value: keyPart
    };
  };

  /**
   * @function _isPropShallowEqual
   * @memberof ReactCacheKey
   * @instance
   *
   * @description
   * check if the prop value passed is equal to the key's value
   *
   * @param {Object} object the new key to test against the instance
   * @param {Object} existing the key object stored in the instance
   * @param {Array<string>} existing.keys the keys of the existing object
   * @param {number} existing.size the length of the keys array
   * @param {Object} value the value of the key part
   * @returns {boolean} is the prop value shallow equal to the object
   */


  ReactCacheKey.prototype._isPropShallowEqual = function _isPropShallowEqual(object, existing) {
    if (getKeyCount(object) !== existing.size) {
      return false;
    }

    var index = 0,
        key = void 0;

    while (index < existing.size) {
      key = existing.keys[index];

      if (object[key] !== existing.value[key]) {
        return false;
      }

      index++;
    }

    return true;
  };

  /**
   * @function _isPropCustomEqual
   * @memberof ReactCacheKey
   * @instance
   *
   * @description
   * check if the prop value passed is equal to the key's value
   *
   * @param {Object} object the new key to test against the instance
   * @param {Object} existingObject the key stored in the instance
   * @param {function} isEqual custom equality comparator
   * @returns {boolean} are the objects equal based on the isEqual method passed
   */


  ReactCacheKey.prototype._isPropCustomEqual = function _isPropCustomEqual(object, existingObject, isEqual) {
    return isEqual(object, existingObject);
  };

  /**
   * @function matches
   * @memberof ReactCacheKey
   * @instance
   *
   * @description
   * does the passed key match the key in the instance
   *
   * @param {Array<*>} key the key to test
   * @returns {boolean} does the key passed match that in the instance
   */


  ReactCacheKey.prototype.matches = function matches(key) {
    return this._isPropShallowEqual(key[0], this.key.props) && this._isPropShallowEqual(key[1], this.key.context);
  };

  /**
   * @function matchesCustom
   * @memberof ReactCacheKey
   * @instance
   *
   * @description
   * does the passed key match the key in the instance
   *
   * @param {Array<*>} key the key to test
   * @param {function} isEqual method to check equality of keys
   * @returns {boolean} does the key passed match that in the instance
   */


  ReactCacheKey.prototype.matchesCustom = function matchesCustom(key, isEqual) {
    return this._isPropCustomEqual(key[0], this.key.props.value, isEqual) && this._isPropCustomEqual(key[1], this.key.context.value, isEqual);
  };

  return ReactCacheKey;
}();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @private
 *
 * @class SerializedCacheKey
 *
 * @classdesc
 * cache key used when the parameters should be serialized
 */
var SerializedCacheKey = function () {
  function SerializedCacheKey(key) {
    _classCallCheck$2(this, SerializedCacheKey);

    this.key = null;

    this.key = key;

    return this;
  }

  /**
   * @function matches
   * @memberof SerializedCacheKey
   * @instance
   *
   * @description
   * does the passed key match the key in the instance
   *W
   * @param {Array<*>} key the key to test
   * @returns {boolean} does the key passed match that in the instance
   */
  SerializedCacheKey.prototype.matches = function matches(key) {
    return key === this.key;
  };

  /**
   * @function matchesCustom
   * @memberof SerializedCacheKey
   * @instance
   *
   * @description
   * does the passed key match the key in the instance based on the custom equality function passed
   *
   * @param {Array<*>} key the key to test
   * @param {function} isEqual method to compare equality of the keys
   * @returns {boolean} does the key passed match that in the instance
   */


  SerializedCacheKey.prototype.matchesCustom = function matchesCustom(key, isEqual) {
    return isEqual(key, this.key);
  };

  return SerializedCacheKey;
}();

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @private
 *
 * @class SingleParameterCacheKey
 *
 * @classdesc
 * cache key used when there is a single standard parameter
 */
var SingleParameterCacheKey = function () {
  function SingleParameterCacheKey(key) {
    _classCallCheck$3(this, SingleParameterCacheKey);

    this.isMultiParamKey = false;
    this.key = null;

    this.key = key[0];

    return this;
  }

  /**
   * @function matches
   * @memberof SingleParameterCacheKey
   * @instance
   *
   * @description
   * does the passed key match the key in the instance
   *
   * @param {Array<*>} key the key to test
   * @param {boolean} isMultiParamKey is the key a multi-parameter key
   * @returns {boolean} does the key passed match that in the instance
   */
  SingleParameterCacheKey.prototype.matches = function matches(key, isMultiParamKey) {
    return !isMultiParamKey && key[0] === this.key;
  };

  /**
   * @function matchesCustom
   * @memberof SingleParameterCacheKey
   * @instance
   *
   * @description
   * does the passed key match the key in the instance based on the custom equality function passed
   *
   * @param {Array<*>} key the key to test
   * @param {boolean} isMultiParamKey is the key a multi-parameter key
   * @param {function} isEqual method to compare equality of the keys
   * @returns {boolean} does the key passed match that in the instance
   */


  SingleParameterCacheKey.prototype.matchesCustom = function matchesCustom(key, isMultiParamKey, isEqual) {
    return !isMultiParamKey && isEqual(key[0], this.key);
  };

  return SingleParameterCacheKey;
}();

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @private
 *
 * @class MultipleParameterCacheKey
 *
 * @classdesc
 * cache key used when there are multiple standard parameters
 */
var MultipleParameterCacheKey = function () {
  function MultipleParameterCacheKey(key) {
    _classCallCheck$4(this, MultipleParameterCacheKey);

    this.isMultiParamKey = true;
    this.key = null;
    this.size = 0;

    this.key = key;
    this.size = key.length;

    return this;
  }

  /**
   * @function matches
   * @memberof MultipleParameterCacheKey
   * @instance
   *
   * @description
   * does the passed key match the key in the instance
   *
   * @param {Array<*>} key the key to test
   * @param {boolean} isMultiParamKey is the key a multi-parameter key
   * @returns {boolean} does the key passed match that in the instance
   */
  MultipleParameterCacheKey.prototype.matches = function matches(key, isMultiParamKey) {
    if (!isMultiParamKey || key.length !== this.size) {
      return false;
    }

    var index = 0;

    while (index < this.size) {
      if (key[index] !== this.key[index]) {
        return false;
      }

      index++;
    }

    return true;
  };

  /**
   * @function matchesCustom
   * @memberof SingleParameterCacheKey
   * @instance
   *
   * @description
   * does the passed key match the key in the instance based on the custom equality function passed
   *
   * @param {Array<*>} key the key to test
   * @param {boolean} isMultiParamKey is the key a multi-parameter key
   * @param {function} isEqual method to compare equality of the keys
   * @returns {boolean} does the key passed match that in the instance
   */


  MultipleParameterCacheKey.prototype.matchesCustom = function matchesCustom(key, isMultiParamKey, isEqual) {
    return isMultiParamKey && isEqual(key, this.key);
  };

  return MultipleParameterCacheKey;
}();

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var FINITE_POSITIVE_INTEGER = /^[1-9]\d*$/;

/**
 * @private
 *
 * @constant {RegExp} FUNCTION_NAME_REGEXP
 */
var FUNCTION_NAME_REGEXP = /^\s*function\s+([^\(\s]*)\s*/;

/**
 * @private
 *
 * @constant {string} FUNCTION_TYPEOF
 * @default
 */
var FUNCTION_TYPEOF = 'function';

/**
 * @private
 *
 * @constant {Array<Object>} GOTCHA_OBJECT_CLASSES
 */
var GOTCHA_OBJECT_CLASSES = [Boolean, Date, Number, RegExp, String];

/**
 * @private
 *
 * @constant {number} INFINITY
 * @default
 */
var INFINITY = Number.POSITIVE_INFINITY;

/**
 * @private
 *
 * @constant {string} INVALID_FIRST_PARAMETER_ERROR
 * @default
 */
var INVALID_FIRST_PARAMETER_ERROR = 'You must pass either a function or an object of options as the first parameter to moize.';

/**
 * @private
 *
 * @constant {string} INVALID_PROMISE_LIBRARY_ERROR
 * @default
 */
var INVALID_PROMISE_LIBRARY_ERROR = 'The promiseLibrary passed must either be a function or an object with the resolve / reject methods.';

/**
 * @private
 *
 * @constant {function|undefined} NATIVE_PROMISE
 */
var NATIVE_PROMISE = (typeof Promise === 'undefined' ? 'undefined' : _typeof$1(Promise)) === FUNCTION_TYPEOF ? Promise : undefined;

/**
 * @private
 *
 * @constant {Object} DEFAULT_OPTIONS
 */
var DEFAULT_OPTIONS = {
  equals: null,
  isPromise: false,
  isReact: false,
  maxAge: INFINITY,
  maxArgs: INFINITY,
  maxSize: INFINITY,
  promiseLibrary: NATIVE_PROMISE,
  serialize: false,
  serializeFunctions: false,
  serializer: null,
  transformArgs: null
};

/**
 * @private
 *
 * @constant {string} OBJECT_TYPEOF
 * @default
 */
var OBJECT_TYPEOF = 'object';

/**
 * @private
 *
 * @constant {Array<string>} STATIC_PROPERTIES_TO_PASS
 */
var STATIC_PROPERTIES_TO_PASS = ['contextTypes', 'defaultProps', 'propTypes'];

/**
 * @private
 *
 * @constant {{isPromise: true}} PROMISE_OPTIONS
 */
var PROMISE_OPTIONS = {
  isPromise: true
};

/**
 * @private
 *
 * @constant {{maxArgs: number, serialize: boolean, serializeFunctions: boolean}} REACT_OPTIONS
 */
var REACT_OPTIONS = {
  isReact: true
};

/**
 * @private
 *
 * @constant {{serialize: boolean}} SERIALIZE_OPTIONS
 */
var SERIALIZE_OPTIONS = {
  serialize: true
};

// cache
// types


// utils
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
var customReplacer = function customReplacer(key, value) {
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
var decycle = function decycle(object) {
  var cache = new Cache();

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

    cache.add(value, path);

    if (Array.isArray(value)) {
      return value.map(function (item, itemIndex) {
        return coalesceCircularReferences(item, path + '[' + itemIndex + ']');
      });
    }

    return Object.keys(value).reduce(function (object, name) {
      object[name] = coalesceCircularReferences(value[name], path + '[' + JSON.stringify(name) + ']');

      return object;
    }, {});
  };

  return coalesceCircularReferences(object, '$');
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
var stringify = function stringify(value, replacer) {
  try {
    return JSON.stringify(value, replacer);
  } catch (exception) {
    return JSON.stringify(decycle(value), replacer);
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
var getStringifiedArgument = function getStringifiedArgument(arg, replacer) {
  return isComplexObject(arg) || isFunction(arg) ? stringify(arg, replacer) : arg;
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
var createArgumentSerializer = function createArgumentSerializer(_ref) {
  var maxArgs = _ref.maxArgs,
      serializeFunctions = _ref.serializeFunctions;

  var replacer = serializeFunctions ? customReplacer : null;
  var hasMaxArgs = isFiniteAndPositiveInteger(maxArgs);

  return function (args) {
    var length = hasMaxArgs ? maxArgs : args.length;

    var index = -1,
        key = '|',
        value = void 0;

    while (++index < length) {
      value = getStringifiedArgument(args[index], replacer);

      if (value) {
        key += value + '|';
      }
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
 * @param {Options} options the options passed to the moized function
 * @returns {function} the function to use in serializing the arguments
 */
var getSerializerFunction = function getSerializerFunction(options) {
  return isFunction(options.serializer) ? options.serializer : createArgumentSerializer(options);
};

var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// cache
// cache key
// constants
// serialize
// types


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
var isComplexObject = function isComplexObject(object) {
  return !!object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === OBJECT_TYPEOF;
};

/**
 * @private
 *
 * @function isFiniteAndPositiveInteger
 *
 * @description
 * is the number passed an integer that is finite and positive
 *
 * @param {number} number number to test for finiteness and positivity
 * @returns {boolean} is the number finite and positive
 */
var isFiniteAndPositiveInteger = function isFiniteAndPositiveInteger(number) {
  return FINITE_POSITIVE_INTEGER.test('' + number);
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
var isFunction = function isFunction(object) {
  return (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === FUNCTION_TYPEOF;
};

/**
 * @private
 *
 * @function isMoized
 *
 * @description
 * is the function passed a moized function or not
 *
 * @param {*} fn the function to get if moize
 * @returns {boolean} is the function moized or not
 */
var isMoized = function isMoized(fn) {
  return isFunction(fn) && !!fn.isMoized;
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
var isPlainObject = function isPlainObject(object) {
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
var isValueObjectOrArray = function isValueObjectOrArray(object) {
  if (!isComplexObject(object)) {
    return false;
  }

  var index = 0;

  while (index < GOTCHA_OBJECT_CLASSES.length) {
    if (object instanceof GOTCHA_OBJECT_CLASSES[index]) {
      return false;
    }

    index++;
  }

  return true;
};

/**
 * @private
 *
 * @function take
 *
 * @description
 * take the first N number of items from the array (faster than slice)
 *
 * @param {number} size the number of items to take
 * @returns {function(Array<*>): Array<*>} the shortened array
 */
var take = function take(size) {
  return function (array) {
    if (size >= array.length) {
      return array;
    }

    switch (size) {
      case 1:
        return [array[0]];

      case 2:
        return [array[0], array[1]];

      case 3:
        return [array[0], array[1], array[2]];

      case 4:
        return [array[0], array[1], array[2], array[3]];

      case 5:
        return [array[0], array[1], array[2], array[3], array[4]];
    }

    return array.slice(0, size);
  };
};

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
var addStaticPropertiesToFunction = function addStaticPropertiesToFunction(originalFunction, memoizedFn) {
  var index = STATIC_PROPERTIES_TO_PASS.length,
      property = void 0;

  while (index--) {
    property = STATIC_PROPERTIES_TO_PASS[index];

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
var compose = function compose() {
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
var createCurriableOptionMethod = function createCurriableOptionMethod(fn, option) {
  return function (value) {
    var _fn;

    return fn((_fn = {}, _fn[option] = value, _fn));
  };
};

/**
 * @private
 *
 * @function createFindIndex
 *
 * @description
 * create a findIndex method based on the startingIndex passed
 *
 * @param {number} startingIndex the index to start in the find method returned
 * @returns {function(Array<ListItem>, *): number} the findIndex method
 */
var createFindIndex = function createFindIndex(startingIndex) {
  // eslint-disable-line no-use-before-define
  return function (list, key) {
    var index = startingIndex;

    while (index < list.length) {
      if (key === list[index].key) {
        return index;
      }

      index++;
    }

    return -1;
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
var createPluckFromInstanceList = function createPluckFromInstanceList(cache, key) {
  return function () {
    return cache.list.map(function (item) {
      return item[key];
    });
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
 * @param {function} promiseLibrary the promise library used
 * @returns {function} the rejecter function for the promise
 */
var createPromiseRejecter = function createPromiseRejecter(cache, key, _ref) {
  var promiseLibrary = _ref.promiseLibrary;

  return function (exception) {
    cache.remove(key);

    return promiseLibrary.reject(exception);
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
 * @param {number} maxAge the age after which the cache will be expired
 * @param {function} promiseLibrary the promise library used
 * @returns {function} the resolver function for the promise
 */
var createPromiseResolver = function createPromiseResolver(cache, key, hasMaxAge, _ref2) {
  var maxAge = _ref2.maxAge,
      promiseLibrary = _ref2.promiseLibrary;

  return function (resolvedValue) {
    cache.update(key, promiseLibrary.resolve(resolvedValue));

    if (hasMaxAge) {
      cache.expireAfter(key, maxAge);
    }

    return resolvedValue;
  };
};

/**
 * @private
 *
 * @function findIndex
 *
 * @description
 * find the index of the key starting at the first index
 *
 * @param {Array<ListItem>} list the list to find the key in
 * @param {*} key the key to test against
 * @returns {number} the index of the matching key, or -1
 */
var findIndex = createFindIndex(0);

/**
 * @private
 *
 * @function findIndexAfterFirst
 *
 * @description
 * find the index of the key starting at the second index
 *
 * @param {Array<ListItem>} list the list to find the key in
 * @param {*} key the key to test against
 * @returns {number} the index of the matching key, or -1
 */
var findIndexAfterFirst = createFindIndex(1);

/**
 * @private
 *
 * @function getDefaultedOptions
 *
 * @description
 * get the options coalesced to their defaults
 *
 * @param {Object} options the options passed to the moize method
 * @returns {Options} the coalesced options object
 */
var getDefaultedOptions = function getDefaultedOptions(options) {
  var coalescedOptions = _extends$1({}, DEFAULT_OPTIONS, options);

  if (coalescedOptions.serialize) {
    coalescedOptions.serializer = getSerializerFunction(coalescedOptions);
  }

  return coalescedOptions;
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
var getFunctionNameViaRegexp = function getFunctionNameViaRegexp(fn) {
  var match = fn.toString().match(FUNCTION_NAME_REGEXP);

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
var getFunctionName = function getFunctionName(fn) {
  return fn.displayName || fn.name || getFunctionNameViaRegexp(fn) || FUNCTION_TYPEOF;
};

/**
 * @private
 *
 * @function getKeyCount
 *
 * @description
 * get the count of keys in the object (faster than Object.keys().length)
 * 
 * @param {Object} object the object to get the key count of
 * @returns {number} the count of keys
 */
var getKeyCount = function getKeyCount(object) {
  var counter = 0;

  for (var ignored in object) {
    counter++;
  }

  return counter;
};

/**
 * @private
 *
 * @function getReactCacheKey
 *
 * @description
 * get the cache key specific to react
 *
 * @param {Cache} cache the cache to find a potential matching key in
 * @param {*} key the key to try to find a match of, or turn into a new ReactCacheKey
 * @returns {ReactCacheKey} the matching cache key, or a new one
 */
var getReactCacheKey = function getReactCacheKey(cache, key) {
  // $FlowIgnore if cache has size, the key exists
  if (cache.size && cache.lastItem.key.matches(key)) {
    // $FlowIgnore if the key matches, the key exists
    return cache.lastItem.key;
  }

  var index = 1;

  while (index < cache.size) {
    // $FlowIgnore if cache has size, the key exists
    if (cache.list[index].key.matches(key)) {
      // $FlowIgnore if the key matches, the key exists
      return cache.list[index].key;
    }

    index++;
  }

  return new ReactCacheKey(key);
};

/**
 * @private
 *
 * @function getReactCacheKey
 *
 * @description
 * get the cache key specific to react
 *
 * @param {Cache} cache the cache to find a potential matching key in
 * @param {*} key the key to try to find a match of, or turn into a new ReactCacheKey
 * @param {Options} options the options passed to the moized method
 * @returns {ReactCacheKey} the matching cache key, or a new one
 */
var getReactCacheKeyCustomEquals = function getReactCacheKeyCustomEquals(cache, key, options) {
  // $FlowIgnore if cache has size, the key exists
  if (cache.size && cache.lastItem.key.matchesCustom(key, options.equals)) {
    // $FlowIgnore if the key matches, the key exists
    return cache.lastItem.key;
  }

  var index = 1;

  while (index < cache.size) {
    // $FlowIgnore if cache has size, the key exists
    if (cache.list[index].key.matchesCustom(key, options.equals)) {
      // $FlowIgnore if the key matches, the key exists
      return cache.list[index].key;
    }

    index++;
  }

  return new ReactCacheKey(key);
};

/**
 * @private
 *
 * @function getSerializedCacheKey
 *
 * @description
 * get the cache key specific to serialized methods
 *
 * @param {Cache} cache the cache to find a potential matching key in
 * @param {*} key the key to try to find a match of, or turn into a new SerializedCacheKey
 * @param {Options} options the options passed to the moized method
 * @returns {SerializedCacheKey} the matching cache key, or a new one
 */
var getSerializedCacheKey = function getSerializedCacheKey(cache, key) {
  // $FlowIgnore if cache has size, the key exists
  if (cache.size && cache.lastItem.key.matches(key)) {
    // $FlowIgnore if the key matches, the key exists
    return cache.lastItem.key;
  }

  var index = 1;

  while (index < cache.size) {
    // $FlowIgnore if cache has size, the key exists
    if (cache.list[index].key.matches(key)) {
      // $FlowIgnore if the key matches, the key exists
      return cache.list[index].key;
    }

    index++;
  }

  return new SerializedCacheKey(key);
};

/**
 * @private
 *
 * @function getSerializedCacheKeyCustomEquals
 *
 * @description
 * get the cache key specific to serialized methods
 *
 * @param {Cache} cache the cache to find a potential matching key in
 * @param {*} key the key to try to find a match of, or turn into a new SerializedCacheKey
 * @param {Options} options the options passed to the moized method
 * @returns {SerializedCacheKey} the matching cache key, or a new one
 */
var getSerializedCacheKeyCustomEquals = function getSerializedCacheKeyCustomEquals(cache, key, options) {
  if (cache.size &&
  // $FlowIgnore if cache has size, the key exists
  cache.lastItem.key.matchesCustom(key, options.equals)) {
    // $FlowIgnore if the key matches, the key exists
    return cache.lastItem.key;
  }

  var index = 1;

  while (index < cache.size) {
    // $FlowIgnore if cache has size, the key exists
    if (cache.list[index].key.matchesCustom(key, options.equals)) {
      // $FlowIgnore if the key matches, the key exists
      return cache.list[index].key;
    }

    index++;
  }

  return new SerializedCacheKey(key);
};

/**
 * @private
 *
 * @function getStandardCacheKey
 *
 * @description
 * get the cache key for standard parameters, either single or multiple
 *
 * @param {Cache} cache the cache to find a potential matching key in
 * @param {*} key the key to try to find a match of, or turn into a new Multiple / SingleParameterCacheKey
 * @returns {StandardCacheKey} the matching cache key, or a new one
 */
var getStandardCacheKey = function getStandardCacheKey(cache, key) {
  var isMultiParamKey = key.length > 1;

  // $FlowIgnore if cache has size, the key exists
  if (cache.size && cache.lastItem.key.matches(key, isMultiParamKey)) {
    // $FlowIgnore if the key matches, the key exists
    return cache.lastItem.key;
  }

  var index = 1;

  while (index < cache.size) {
    // $FlowIgnore if cache has size, the key exists
    if (cache.list[index].key.matches(key, isMultiParamKey)) {
      // $FlowIgnore if the key matches, the key exists
      return cache.list[index].key;
    }

    index++;
  }

  return isMultiParamKey ? new MultipleParameterCacheKey(key) : new SingleParameterCacheKey(key);
};

/**
 * @private
 *
 * @function getStandardCacheKeyCustomEquals
 *
 * @description
 * get the cache key for standard parameters, either single or multiple
 *
 * @param {Cache} cache the cache to find a potential matching key in
 * @param {*} key the key to try to find a match of, or turn into a new Multiple / SingleParameterCacheKey
 * @param {Options} options the options passed to the moized method
 * @returns {StandardCacheKey} the matching cache key, or a new one
 */
var getStandardCacheKeyCustomEquals = function getStandardCacheKeyCustomEquals(cache, key, options) {
  var isMultiParamKey = key.length > 1;

  if (cache.size &&
  // $FlowIgnore if cache has size, the key exists
  cache.lastItem.key.matchesCustom(key, isMultiParamKey, options.equals)) {
    // $FlowIgnore if the key matches, the key exists
    return cache.lastItem.key;
  }

  var index = 1;

  while (index < cache.size) {
    if (
    // $FlowIgnore if cache has size, the key exists
    cache.list[index].key.matchesCustom(key, isMultiParamKey, options.equals)) {
      // $FlowIgnore if the key matches, the key exists
      return cache.list[index].key;
    }

    index++;
  }

  return isMultiParamKey ? new MultipleParameterCacheKey(key) : new SingleParameterCacheKey(key);
};

/**
 * @private
 *
 * @function getGetCacheKeyMethod
 *
 * @description
 * based on the options, get the getCacheKey method
 *
 * @param {Options} options the options passed to the moized method
 * @returns {function(Cache, Array<*>): CacheKey} the cache key
 */
var getGetCacheKeyMethod = function getGetCacheKeyMethod(options) {
  if (options.isReact) {
    return options.equals ? getReactCacheKeyCustomEquals : getReactCacheKey;
  }

  if (options.serialize) {
    return options.equals ? getSerializedCacheKeyCustomEquals : getSerializedCacheKey;
  }

  return options.equals ? getStandardCacheKeyCustomEquals : getStandardCacheKey;
};

/**
 * @private
 *
 * @function createGetCacheKey
 *
 * @description
 * create the method that will get the cache key based on the options passed to the moized method
 *
 * @param {Cache} cache the cache to get the key from
 * @param {Options} options the options passed to the moized method
 * @returns {function(*): CacheKey} the method that will get the cache key
 */
var createGetCacheKey = function createGetCacheKey(cache, options) {
  var hasMaxArgs = isFiniteAndPositiveInteger(options.maxArgs);
  var getCacheKeyMethod = getGetCacheKeyMethod(options);

  var transform = options.transformArgs;

  if (hasMaxArgs) {
    transform = transform ? compose(transform, take(options.maxArgs)) : take(options.maxArgs);
  }

  if (options.serialize) {
    transform = transform ? compose(options.serializer, transform) : options.serializer;
  }

  if (options.equals) {
    if (transform) {
      return function (key) {
        // $FlowIgnore transform is a function
        return getCacheKeyMethod(cache, transform(key), options);
      };
    }

    return function (key) {
      return getCacheKeyMethod(cache, key, options);
    };
  }

  if (transform) {
    return function (key) {
      // $FlowIgnore transform is a function
      return getCacheKeyMethod(cache, transform(key));
    };
  }

  return function (key) {
    return getCacheKeyMethod(cache, key);
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
 * @param {Options} options the options passed to the moize method
 * @returns {function(function, *, *): *} value just stored in cache
 */
var createSetNewCachedValue = function createSetNewCachedValue(cache, options) {
  var hasMaxAge = isFiniteAndPositiveInteger(options.maxAge);
  var hasMaxSize = isFiniteAndPositiveInteger(options.maxSize);

  var maxAge = options.maxAge,
      maxSize = options.maxSize;


  if (options.isPromise) {
    if (!isFunction(options.promiseLibrary) && !isPlainObject(options.promiseLibrary)) {
      throw new TypeError(INVALID_PROMISE_LIBRARY_ERROR);
    }

    return function (key, value) {
      var promiseResolver = createPromiseResolver(cache, key, hasMaxAge, options);
      var promiseRejecter = createPromiseRejecter(cache, key, options);
      var handler = value.then(promiseResolver, promiseRejecter);

      cache.add(key, handler);

      if (hasMaxSize && cache.size > maxSize) {
        cache.remove(cache.list[cache.list.length - 1].key);
      }

      return handler;
    };
  }

  return function (key, value) {
    cache.add(key, value);

    if (hasMaxAge) {
      cache.expireAfter(key, maxAge);
    }

    if (hasMaxSize && cache.size > maxSize) {
      cache.remove(cache.list[cache.list.length - 1].key);
    }

    return value;
  };
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
var splice = function splice(array, startingIndex) {
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
var unshift = function unshift(array, item) {
  var index = array.length;

  while (index--) {
    array[index + 1] = array[index];
  }

  return array[0] = item;
};

/**
 * @private
 *
 * @function createAddPropertiesToFunction
 *
 * @description
 * add the static properties to the moized function
 *
 * @param {Cache} cache the cache for the moized function
 * @param {function} originalFunction the function to be moized
 * @param {Options} options the options passed to the moize method
 * @returns {function(function): function} the method which will add the static properties
 */
var createAddPropertiesToFunction = function createAddPropertiesToFunction(cache, originalFunction, options) {
  var getCacheKey = createGetCacheKey(cache, options);

  return function (moizedFunction) {
    moizedFunction.cache = cache;
    moizedFunction.displayName = 'moize(' + getFunctionName(originalFunction) + ')';
    moizedFunction.isMoized = true;
    moizedFunction.options = options;
    moizedFunction.originalFunction = originalFunction;

    /**
     * @private
     *
     * @function add
     *
     * @description
     * manually add an item to cache if the key does not already exist
     *
     * @param {Array<any>} key key to use in cache
     * @param {*} value value to assign to key
     */
    moizedFunction.add = function (key, value) {
      var internalKey = getCacheKey(key);

      if (!cache.has(internalKey)) {
        cache.add(internalKey, value);
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
    moizedFunction.clear = function () {
      cache.clear();
    };

    /**
     * @private
     *
     * @function has
     *
     * @description
     * does the function have cache for the specific args passed
     *
     * @param {Array<*>} key combination of args to remove from cache
     * @returns {boolean} does the cache for the give args exist
     */
    moizedFunction.has = function (key) {
      return cache.has(getCacheKey(key));
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
    moizedFunction.keys = createPluckFromInstanceList(cache, 'key');

    /**
     * @private
     *
     * @function remove
     *
     * @description
     * remove the item from cache for the key passed for this method
     *
     * @param {Array<*>} key combination of args to remove from cache
     */
    moizedFunction.remove = function (key) {
      cache.remove(getCacheKey(key));
    };

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
    moizedFunction.values = createPluckFromInstanceList(cache, 'value');

    return addStaticPropertiesToFunction(originalFunction, moizedFunction);
  };
};

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// utils
/**
 * @private
 *
 * @class Cache
 *
 * @classdesc
 * class that is similar to the Map infrastructure, but faster and
 * more targeted to moize use cases
 */


// types

var Cache = function () {
  function Cache() {
    _classCallCheck(this, Cache);

    this.lastItem = {};
    this.list = [];
    this.size = 0;
  }

  /**
   * @function add
   * @memberof Cache
   * @instance
   *
   * @description
   * add a new item to cache
   *
   * @param {*} key the key to assign
   * @param {*} value the value to assign at key
   */
  Cache.prototype.add = function add(key, value) {
    this.lastItem = unshift(this.list, {
      key: key,
      value: value
    });

    this.size++;
  };

  /**
   * @function clear
   * @memberof Cache
   * @instance
   *
   * @description
   * clear the cache of all items
   */


  Cache.prototype.clear = function clear() {
    this.lastItem = {};
    this.list.length = this.size = 0;
  };

  /**
   * @function expireAfter
   * @memberof Cache
   * @instance
   *
   * @description
   * remove from cache after maxAge time has passed
   *
   * @param {*} key the key to remove
   * @param {number} maxAge the time in milliseconds to wait before removing key
   */


  Cache.prototype.expireAfter = function expireAfter(key, maxAge) {
    var _this = this;

    setTimeout(function () {
      _this.remove(key);
    }, maxAge);
  };

  /**
   * @function get
   * @memberof Cache
   * @instance
   *
   * @description
   * get the value of an item from cache if it exists
   *
   * @param {*} key the key to get the value of
   * @returns {*} the value at key
   */


  Cache.prototype.get = function get(key) {
    if (!this.size) {
      return;
    }

    if (key === this.lastItem.key) {
      return this.lastItem.value;
    }

    var index = findIndexAfterFirst(this.list, key);

    if (~index) {
      this.lastItem = this.list[index];

      return unshift(splice(this.list, index), this.lastItem).value;
    }
  };

  /**
   * @private
   *
   * @function has
   *
   * @description
   * does the key exist in the cache
   *
   * @param {*} key the key to find in cache
   * @returns {boolean} does the key exist in cache
   */


  Cache.prototype.has = function has(key) {
    return this.size !== 0 && (key === this.lastItem.key || !!~findIndexAfterFirst(this.list, key));
  };

  /**=
   * @function remove
   * @memberof Cache
   * @instance
   *
   * @description
   * remove the item at key from cach
   *
   * @param {*} key the key to remove from cache
   * @returns {void}
   */


  Cache.prototype.remove = function remove(key) {
    var index = findIndex(this.list, key);

    if (~index) {
      splice(this.list, index);

      if (this.size === 1) {
        return this.clear();
      }

      this.size--;

      if (!index) {
        this.lastItem = this.list[0];
      }
    }
  };

  /**
   * @function update
   * @memberof Cache
   * @instance
   *
   * @description
   * update an item in-place with a new value
   *
   * @param {*} key key to update value of
   * @param {*} value value to store in the map at key
   */


  Cache.prototype.update = function update(key, value) {
    var index = findIndex(this.list, key);

    if (~index) {
      this.list[index].value = value;

      if (this.lastItem && key === this.lastItem.key) {
        this.lastItem.value = value;
      }
    }
  };

  return Cache;
}();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// cache
// constants
// types


// utils
/**
 * @module moize
 */

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

  if (isPlainObject(functionOrComposableOptions)) {
    return function (fnOrOptions) {
      var otherOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (isPlainObject(fnOrOptions)) {
        return moize(_extends({}, functionOrComposableOptions, fnOrOptions));
      }

      return moize(fnOrOptions, _extends({}, functionOrComposableOptions, otherOptions));
    };
  }

  if (!isFunction(functionOrComposableOptions)) {
    throw new TypeError(INVALID_FIRST_PARAMETER_ERROR);
  }

  var isComposed = functionOrComposableOptions.isMoized;
  // $FlowIgnore if the function is already moized, it has an originalFunction property on it
  var fn = isComposed ? functionOrComposableOptions.originalFunction : functionOrComposableOptions;

  var options = getDefaultedOptions(!isComposed ? passedOptions : _extends({}, functionOrComposableOptions.options, passedOptions));

  var cache = new Cache();

  var addPropertiesToFunction = createAddPropertiesToFunction(cache, fn, options);
  var getCacheKey = createGetCacheKey(cache, options);
  var setNewCachedValue = createSetNewCachedValue(cache, options);

  var moizedFunction = function moizedFunction() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var key = getCacheKey(args);

    return cache.size && cache.has(key) ? cache.get(key) : setNewCachedValue(key, fn.apply(this, args));
  };

  return addPropertiesToFunction(moizedFunction);
};

moize.compose = compose;
moize.isMoized = isMoized;
moize.maxAge = createCurriableOptionMethod(moize, 'maxAge');
moize.maxArgs = createCurriableOptionMethod(moize, 'maxArgs');
moize.maxSize = createCurriableOptionMethod(moize, 'maxSize');
moize.promise = moize(PROMISE_OPTIONS);
moize.react = moize(REACT_OPTIONS);
moize.reactSimple = compose(moize.react, moize.maxSize(1));
moize.serialize = moize(SERIALIZE_OPTIONS);
moize.simple = moize.maxSize(1);

/**
 * Creates a shallow equality comparison function given an index at which to
 * start array comparison.
 *
 * @param  {Number}  index Index at which to start array comparison
 * @return {Function}      Shallow equality comparison function
 */
function createIsShallowEqualFromIndex( index ) {
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
var index = function( selector, getDependants ) {
	var memoizedSelector, lastDependants;

	memoizedSelector = moize( selector, {
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
};

return index;

}());
