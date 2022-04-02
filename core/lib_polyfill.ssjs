
/* ============================================================================
                                    NUMBER
============================================================================ */ 


// ECMAScript (ECMA-262)
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

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

if (!String.prototype.substr) {
    String.prototype.substr = function(a, b) {
        var s = (!Number.isInteger(a)) ? 0 : a,
            l = (typeof b == 'undefined') ? null : (s > 0 && b > 0) ? s + b : b;
        if (s < 0) {
            s = this.length + a;
            l = (l < 0) ? 0 : s + l;
        }
        return (typeof b == 'undefined' && b != 0 && Number.isInteger(a)) ? this.substring(s) : (l <= 0 || !Number.isInteger(l)) ? "" : this.substring(s, l);
    };
}

// ECMAScript 2015 specification
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function(search, rawPos) {
            var pos = rawPos > 0 ? rawPos|0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}


// ECMAScript 2015 specification
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        'use strict';

        if (search instanceof RegExp) {
            throw TypeError('first argument must not be a RegExp');
        } 
        if (start === undefined) { start = 0; }
            return this.indexOf(search, start) !== -1;
    };
}

/**
 * String.padStart()
 * version 1.0.1
 */
if (!String.prototype.padStart) {
    Object.defineProperty(String.prototype, 'padStart', {
        configurable: true,
        writable: true,
        value: function (targetLength,padString) {
            targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
            padString = (typeof padString !== 'undefined') ? padString : ' ';
            if (this.length > targetLength) {
                return String(this);
            } else {
                targetLength = targetLength - this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
                }
                return padString.slice(0, targetLength) + String(this);
            }
        }
    });
}

/**
 * String.padEnd()
 * version 1.0.1
 */
if (!String.prototype.padEnd) {
    Object.defineProperty(String.prototype, 'padEnd', {
        configurable: true,
        writable: true,
        value: function (targetLength, padString) {
            targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
            padString = (typeof padString !== 'undefined') ? padString : ' ';
            if (this.length > targetLength) {
                return String(this);
            } else {
                targetLength = targetLength - this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
                }
                return String(this) + padString.slice(0, targetLength);
            }
        }
    });
}

/**
 * String.repeat()
 * version 0.0.0
 */
if (!String.prototype.repeat) {
    Object.defineProperty(String.prototype, 'repeat', {
        configurable: true,
        writable: true,
        value: function (count) {
            if (this == null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            var str = '' + this;
            count = +count;
            if (count != count) {
                count = 0;
            }
            if (count < 0) {
                throw new RangeError('repeat count must be non-negative');
            }
            if (count == Infinity) {
                throw new RangeError('repeat count must be less than infinity');
            }
            count = Math.floor(count);
            if (str.length == 0 || count == 0) {
                return '';
            }
            if (str.length * count >= 1 << 28) {
                throw new RangeError('repeat count must not overflow maximum string size');
            }
            var rpt = '';
            for (; ;) {
                if ((count & 1) == 1) {
                    rpt += str;
                }
                count >>>= 1;
                if (count == 0) {
                    break;
                }
                str += str;
            }
            return rpt;
        }
    });
}

/**
 * String.codePointAt()
 */
if (!String.prototype.codePointAt) {
    Object.defineProperty(String.prototype, 'codePointAt', {
        configurable: true,
        writable: true,
        value: function (position) {
            if (this == null) {
                throw TypeError();
            }
            var string = this,
                size = string.length,
                index = position ? Number(position) : 0;
            
            if (index != index) {
                index = 0;
            }
            if (index < 0 || index >= size) {
                return undefined;
            }
            var first = string.charCodeAt(index),
                second;
            if (first >= 0xd800 && first <= 0xdbff && size > index + 1) {
                second = string.charCodeAt(index + 1);
                if (second >= 0xdc00 && second <= 0xdfff) {
                    return (first - 0xd800) * 0x400 + second - 0xdc00 + 0x10000;
                }
            }
            return first;
        }
    });
}



/* ============================================================================
                                    OBJECT
============================================================================ */ 

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
        if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
        }

        var result = [], prop, i;

        for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
        }
        }

        if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
            }
        }
        }
        return result;
    };
    }());
}

/* ============================================================================
                                    ARRAY
============================================================================ */ 

/*
* forEach Polyfill
*
* 2015-12-27
*
* By Feifei Hang, http://feifeihang.info
* Public Domain.
* NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/
(function () {
    if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach (callback, thisArg) {
        if (typeof callback !== 'function') {
        throw callback + ' is not a function';
        }
        var array = this;
        thisArg = thisArg || this;
        for (var i = 0, l = array.length; i !== l; ++i) {
        callback.call(thisArg, array[i], i, array);
        }
    };
    }
})();

if (!Array.prototype.filter) {
    Array.prototype.filter = function(callback) {
        //Store the new array
        var result = [];
        for (var i = 0; i < this.length; i++) {
            //call the callback with the current element, index, and context.
            //if it passes the text then add the element in the new array.
            if (callback(this[i], i, this)) {
                result.push(this[i]);
            }
        }
        //return the array
        return result
    }
}

// if (!Array.prototype.splice) {
    Array.prototype.splice = function(startIndex, numItems) {
        var array = this;
        var endIndex = startIndex + numItems;

        var itemsBeforeSplice = []; // array till startIndex
        var splicedItems = []; // removed items array
        var itemsAfterSplice = []; // array from endIndex

        for (var i = 0; i < array.length; i++) {
            if (i < startIndex) { itemsBeforeSplice.push(array[i]); }
            if (i >= startIndex && i < endIndex) { splicedItems.push(array[i]); }
            if (i >= endIndex) { itemsAfterSplice.push(array[i]); }
        }

        // Insert all arguments/parameters after numItems
        for (var i = 2; i < arguments.length; i++) {
            itemsBeforeSplice.push(arguments[i]);
        }

        // Combine before/after arrays
        var remainingItems = itemsBeforeSplice.concat(itemsAfterSplice);

        // Rewrite array
        for (var i = 0, len = Math.max(array.length, remainingItems.length); i < len; i++) {
            if (remainingItems.length > i) {
                array[i] = remainingItems[i];
            } else {
                array.pop();
            }
        }
        return splicedItems;
    }
// }


// Production steps of ECMA-262, Edition 5, 15.4.4.21
// Reference: http://es5.github.io/#x15.4.4.21
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
if (!Array.prototype.reduce) {
Object.defineProperty(Array.prototype, 'reduce', {
value: function(callback /*, initialValue*/) {
    if (this === null) {
    throw new TypeError( 'Array.prototype.reduce ' + 
        'called on null or undefined' );
    }
    if (typeof callback !== 'function') {
    throw new TypeError( callback +
        ' is not a function');
    }

    // 1. Let O be ? ToObject(this value).
    var o = new Object(this);

    // 2. Let len be ? ToLength(? Get(O, "length")).
    var len = o.length >>> 0; 

    // Steps 3, 4, 5, 6, 7      
    var k = 0; 
    var value;

    if (arguments.length >= 2) {
    value = arguments[1];
    } else {
    while (k < len && !(k in o)) {
        k++; 
    }

    // 3. If len is 0 and initialValue is not present,
    //    throw a TypeError exception.
    if (k >= len) {
        throw new TypeError( 'Reduce of empty array ' +
        'with no initial value' );
    }
    value = o[k++];
    }

    // 8. Repeat, while k < len
    while (k < len) {
    // a. Let Pk be ! ToString(k).
    // b. Let kPresent be ? HasProperty(O, Pk).
    // c. If kPresent is true, then
    //    i.  Let kValue be ? Get(O, Pk).
    //    ii. Let accumulator be ? Call(
    //          callbackfn, undefined,
    //          « accumulator, kValue, k, O »).
    if (k in o) {
        value = callback(value, o[k], k, o);
    }

    // d. Increase k by 1.      
    k++;
    }

    // 9. Return accumulator.
    return value;
}
});
}


// Production steps of ECMA-262,
if (!Array.isArray) {
    Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};
}


// Production steps of ECMA-262, Edition 5, 15.4.4.17
// Reference: http://es5.github.io/#x15.4.4.17
if (!Array.prototype.some) {
Array.prototype.some = function(fun, thisArg) {
'use strict';

if (this == null) {
    throw new TypeError('Array.prototype.some called on null or undefined');
}

if (typeof fun !== 'function') {
    throw new TypeError();
}

var t = new Object(this);
var len = t.length >>> 0;

for (var i = 0; i < len; i++) {
    if (i in t && fun.call(thisArg, t[i], i, t)) {
    return true;
    }
}

return false;
};
}

if (!Array.prototype.keys) {
Array.prototype.keys = function() {
    var k, a = [], nextIndex = 0, ary = this;
    k = ary.length;
    while (k > 0) a[--k] = k;
    a.next = function(){
        return nextIndex < ary.length ?
            {value: nextIndex++, done: false} :
            {done: true};
    };
return a;
};
}

if (!Array.prototype.indexOf) {
Array.prototype.indexOf = (function (Obj, max, min) {
'use strict';
return function indexOf (member, fromIndex) {
    if (this === null || this === undefined) {
    throw TypeError('Array.prototype.indexOf called on null or undefined');
    }

    var that = new Obj(this);
    var len = that.length;
    var i = min(fromIndex || 0, len);

    if (i < 0) {
    i = max(0, len + i);
    } else if (i >= len) {
    return -1;
    }

    if (member === undefined) {
    for (; i !== len; ++i) {
        if (that[i] === undefined && i in that) {
        return i; // undefined
        }
    }
    } else if (member !== member) {
    for (; i !== len; ++i) {
        if (that[i] !== that[i]) {
        return i; // NaN
        }
    }
    } else {
    for (; i !== len; ++i) {
        if (that[i] === member) {
        return i; // all else
        }
    }
    }

    return -1; // if the value was not found, then return -1
};
}(Object, Math.max, Math.min));
}


// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
Array.prototype.includes = (function (searchElement, fromIndex) {
    if (this == null) {
        throw new TypeError('"this" is null or not defined');
    }

    // 1. Let O be ? ToObject(this value).
    var o = new Object(this);

    // 2. Let len be ? ToLength(? Get(O, "length")).
    var len = o.length >>> 0;

    // 3. If len is 0, return false.
    if (len === 0) {
        return false;
    }

    // 4. Let n be ? ToInteger(fromIndex).
    //    (If fromIndex is undefined, this step produces the value 0.)
    var n = (fromIndex) ? fromIndex :0;

    // 5. If n ≥ 0, then
    //  a. Let k be n.
    // 6. Else n < 0,
    //  a. Let k be len + n.
    //  b. If k < 0, let k be 0.
    var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
    }

    // 7. Repeat, while k < len
    while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
            return true;
        }
        // c. Increase k by 1.
        k++;
    }

    // 8. Return false
    return false;
});
}


// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
    Array.from = (function() {
    var toStr = Object.prototype.toString;
    var isCallable = function(fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function(value) {
        var number = Number(value);
        if (isNaN(number)) { return 0; }
        if (number === 0 || !isFinite(number)) { return number; }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function(value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike /*, mapFn, thisArg */ ) {
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

if (!Array.prototype.map) {
    Array.prototype.map = function(callback) {
        var arr = [] // since, we need to return an array
        for (var i = 0; i < this.length; i++) {
            arr.push(callback(this[i], i, this)) // pushing currentValue, index, array
        }
        return arr // finally returning the array
    }
}

/* ============================================================================
                                    DATE
============================================================================ */ 

if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {

        var pad = function(number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        }

        return this.getUTCFullYear() +
            '-' + pad(this.getUTCMonth() + 1) +
            '-' + pad(this.getUTCDate()) +
            'T' + pad(this.getUTCHours()) +
            ':' + pad(this.getUTCMinutes()) +
            ':' + pad(this.getUTCSeconds()) +
            '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
    }
}