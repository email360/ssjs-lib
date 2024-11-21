/* ============================================================================
																		NUMBER
============================================================================ */

/**
 * Check if a value is a whole number (integer).
 * @param value 
 * @returns {boolean}
 */
function isInteger(value) {
	return typeof value === 'number' &&
		isFinite(value) &&
		Math.floor(value) === value;
}

Number.isInteger = Number.isInteger || function(value) {
	return typeof value === 'number' && 
			isFinite(value) && 
			Math.floor(value) === value;
};


if (Number.parseFloat === undefined) {
	Number.parseFloat = parseFloat;
}

/* ============================================================================
																		STRING
============================================================================ */
function trim(str) {
	return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}

function substring(str, start, end) {
	function isInteger(value) {
		return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
	}

	var s = !isInteger(start) ? 0 : start;
	var l = (typeof end === 'undefined') ? null : (s > 0 && end > 0) ? s + end : end;

	if (s < 0) {
		s = str.length + start;
		l = (l < 0) ? 0 : s + l;
	}

	if (typeof end === 'undefined' && end !== 0 && isInteger(start)) {
		return str.substring(s);
	} else if (l <= 0 || !isInteger(l)) {
		return "";
	} else {
		return str.substring(s, l);
	}
}

function substr(str, start, length) {
	return str.substring(start, start + length);
}

function startsWith(str, search, rawPos) {
	var pos = rawPos > 0 ? rawPos | 0 : 0;
	return str.substring(pos, pos + search.length) === search;
}

function endsWith(str, search) {
	var pos = str.length - search.length;
	return str.indexOf(search, pos) === pos;
}

function includes(str, search, start) {
	'use strict';

	if (search instanceof RegExp) {
		throw TypeError('first argument must not be a RegExp');
	}
	return str.indexOf(search, start) !== -1;
}

function repeat(str, count) {
	if (count < 1) {
		return '';
	}

	var result = '';
	var pattern = str.valueOf();

	while (count > 0) {
		if (count & 1) {
			result += pattern;
		}

		count >>= 1;
		pattern += pattern;
	}

	return result;
}

function padStart(str, targetLength, padString) {
	targetLength = targetLength >> 0;
	padString = String(typeof padString !== 'undefined' ? padString : ' ');

	if (str.length > targetLength) {
		return String(str);
	} else {
		targetLength = targetLength - str.length;

		if (targetLength > padString.length) {
			padString += repeat(padString, targetLength / padString.length);
		}

		return padString.slice(0, targetLength) + String(str);
	}
}

function padEnd(str, targetLength, padString) {
	targetLength = targetLength >> 0;
	padString = String(typeof padString !== 'undefined' ? padString : ' ');

	if (str.length > targetLength) {
		return String(str);
	} else {
		targetLength = targetLength - str.length;

		if (targetLength > padString.length) {
			padString += repeat(padString, targetLength / padString.length);
		}

		return String(str) + padString.slice(0, targetLength);
	}
}

function codePointAt(str, pos) {
	// adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt
	var size = str.length;
	if (pos === undefined) {
		pos = 0;
	}
	var first = str.charCodeAt(pos);
	var second;
	if (first >= 0xD800 && first <= 0xDBFF && size > pos + 1) {
		second = str.charCodeAt(pos + 1);
		if (second >= 0xDC00 && second <= 0xDFFF) {
			return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
		}
	}
	return first;
}

/* ============================================================================
																		OBJECT
============================================================================ */

function keys(arg) {
	var hasOwnProperty = Object.prototype.hasOwnProperty,
		dontEnums = [
			'toString',
			'toLocaleString',
			'valueOf',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'constructor'
		];

	if (typeof arg !== 'function' && (typeof arg !== 'object' || arg === null)) {
		throw new TypeError('Object.keys called on non-object');
	}

	var result = [],
		prop;
	for (prop in arg) {
		if (!this.includes(dontEnums, prop) && hasOwnProperty.call(arg, prop)) {
			result.push(prop);
		}
	}
	return result;
}

function values(arg) {
	var hasOwnProperty = Object.prototype.hasOwnProperty,
		dontEnums = [
			'toString',
			'toLocaleString',
			'valueOf',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'constructor'
		];

	if (typeof arg !== 'function' && (typeof arg !== 'object' || arg === null)) {
		throw new TypeError('Object.values called on non-object');
	}

	var result = [],
		prop;
	for (prop in arg) {
		if (!this.includes(dontEnums, prop) && hasOwnProperty.call(arg, prop)) {
			result.push(arg[prop]);
		}
	}
	return result;
}

/* ============================================================================
																		ARRAY
============================================================================ */
if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

if (!Array.from) {
	Array.from = (function () {
		var toStr = Object.prototype.toString;
		var isCallable = function (fn) {
			return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
		};
		var toInteger = function (value) {
			var number = Number(value);
			if (isNaN(number)) { return 0; }
			if (number === 0 || !isFinite(number)) { return number; }
			return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
		var maxSafeInteger = Math.pow(2, 53) - 1;
		var toLength = function (value) {
			var len = toInteger(value);
			return Math.min(Math.max(len, 0), maxSafeInteger);
		};

		// The length property of the from method is 1.
		return function from(arrayLike /*, mapFn, thisArg */) {
			// 1. Let C be the this value.
			var C = this;

			// 2. Let items be ToObject(arrayLike).
			var items = arrayLike;

			// 3. ReturnIfAbrupt(items).
			if (arrayLike == null) {
				throw new TypeError('Array.from requires an array-like object - not null or undefined');
			}

			// 4. If mapfn is undefined, then let mapping be false.
			var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
			var T;
			if (typeof mapFn !== 'undefined') {
				// 5. else
				// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
				if (!isCallable(mapFn)) {
					throw new TypeError('Array.from: when provided, the second argument must be a function');
				}

				// 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
				if (arguments.length > 2) {
					T = arguments[2];
				}
			}

			// 10. Let lenValue be Get(items, "length").
			// 11. Let len be ToLength(lenValue).
			var len = toLength(items.length);

			// 13. If IsConstructor(C) is true, then
			// 13. a. Let A be the result of calling the [[Construct]] internal method 
			// of C with an argument list containing the single item len.
			// 14. a. Else, Let A be ArrayCreate(len).
			var A = isCallable(C) ? new C(len) : new Array(len);

			// 16. Let k be 0.
			var k = 0;
			// 17. Repeat, while k < len… (also steps a - h)
			var kValue;
			while (k < len) {
				kValue = items[k];
				if (mapFn) {
					A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
				} else {
					A[k] = kValue;
				}
				k += 1;
			}
			// 18. Let putStatus be Put(A, "length", len, true).
			A.length = len;
			// 20. Return A.
			return A;
		};
	}());
}

function forEach(arrToCycle, callback) {
	if (typeof callback !== 'function') {
		throw callback + ' is not a function';
	}
	for (var i = 0; i < arrToCycle.length; i++) {
		callback(arrToCycle[i], i, arrToCycle);
	}
}

function filter(arrToCycle, callback) {
	var result = [];
	for (var i = 0; i < arrToCycle.length; i++) {
		if (callback(arrToCycle[i], i, arrToCycle)) {
			result.push(arrToCycle[i]);
		}
	}
	return result;
}

function splice(arrToCycle, start, deleteCount) {
	var result = [];
	for (var i = 0; i < arrToCycle.length; i++) {
		if (i >= start && i < start + deleteCount) {
			result.push(arrToCycle[i]);
		}
	}
	return result;
}

function reduce(arrToCycle, callback, initialValue) {
	var accumulator = initialValue || arrToCycle[0];
	for (var i = initialValue ? 0 : 1; i < arrToCycle.length; i++) {
		accumulator = callback(accumulator, arrToCycle[i], i, arrToCycle);
	}
	return accumulator;
}

function some(arrToCycle, callback) {
	for (var i = 0; i < arrToCycle.length; i++) {
		if (callback(arrToCycle[i], i, arrToCycle)) {
			return true;
		}
	}
	return false;
}

function indexOf(arrToCycle, searchElement, fromIndex) {
	var start = fromIndex || 0;
	for (var i = start; i < arrToCycle.length; i++) {
		if (arrToCycle[i] === searchElement) {
			return i;
		}
	}
	return -1;
}

function includes(arrToCycle, searchElement, fromIndex) {
	var start = fromIndex || 0;
	for (var i = start; i < arrToCycle.length; i++) {
		if (arrToCycle[i] === searchElement) {
			return true;
		}
	}
	return false;
}

/* ============================================================================
                                    DATE
============================================================================ */ 

function toISOString(date) {
	function pad(number) {
		if (number < 10) {
			return '0' + number;
		}
		return number;
	}

	return date.getUTCFullYear() +
		'-' + pad(date.getUTCMonth() + 1) +
		'-' + pad(date.getUTCDate()) +
		'T' + pad(date.getUTCHours()) +
		':' + pad(date.getUTCMinutes()) +
		':' + pad(date.getUTCSeconds()) +
		'.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
		'Z';
}