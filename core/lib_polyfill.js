<script runat="server" language="javascript">

  //  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
  // 
  //  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
  //  NOT CONTROL.
  // 
  // Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
  // documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
  // the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
  // and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  // 
  // The above copyright notice and this permission notice shall be included in all copies or substantial portions 
  // of the Software.
  // 
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
  // TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
  // THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
  // CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
  // DEALINGS IN THE SOFTWARE.


  /************************* NUMBER *************************/


  // ECMAScript (ECMA-262)
  Number.isInteger = Number.isInteger || function(value) {
    return typeof value === 'number' && 
      isFinite(value) && 
      Math.floor(value) === value;
  };


  if (Number.parseFloat === undefined) {
      Number.parseFloat = parseFloat;
  }


  /************************* STRING *************************/


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



  /************************* Object *************************/


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



  /************************* ARRAY *************************/


  if (!Array.prototype.filter) {
      Array.prototype.filter = function(func, thisArg) {
          'use strict';
          if (!((typeof func === 'Function' || typeof func === 'function') && this))
              throw new TypeError();

          var len = this.length >>> 0,
              res = new Array(len), // preallocate array
              t = this,
              c = 0,
              i = -1;

          var kValue;
          if (thisArg === undefined) {
              while (++i !== len) {
                  // checks to see if the key was set
                  if (i in this) {
                      kValue = t[i]; // in case t is changed in callback
                      if (func(t[i], i, t)) {
                          res[c++] = kValue;
                      }
                  }
              }
          } else {
              while (++i !== len) {
                  // checks to see if the key was set
                  if (i in this) {
                      kValue = t[i];
                      if (func.call(thisArg, t[i], i, t)) {
                          res[c++] = kValue;
                      }
                  }
              }
          }

          res.length = c; // shrink down array to proper size
          return res;
      };
  }


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
    
  /************************* Date *************************/

  if (!Date.prototype.toISOString) {
    (function() {

      function pad(number) {
        if (number < 10) {
          return '0' + number;
        }
        return number;
      }

      Date.prototype.toISOString = function() {
        return this.getUTCFullYear() +
          '-' + pad(this.getUTCMonth() + 1) +
          '-' + pad(this.getUTCDate()) +
          'T' + pad(this.getUTCHours()) +
          ':' + pad(this.getUTCMinutes()) +
          ':' + pad(this.getUTCSeconds()) +
          '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
          'Z';
      };

    })();
  }

</script>