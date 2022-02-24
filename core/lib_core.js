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

    /**
     *
     * Log an error to a DataExtension
     *
     * Centralised version of error logging in SSJS script. Not recommended in batch Emails - use AMP error log 
     * for this purpose instead. On error, a record will be written to the error log DE.
     *
     * This function requires a DataExtension defined in settings.de.logError
     *
     * @param   {object}    o                       Holds the data for the error log.
     *
     * @param   {string}    o.method                The method calling the error.
     * @param   {string}    o.message               The error message for better understanding of the error.
     * @param   {string}    o.source                A detailed name of the error origin. E.g. [Email] Survey.
     * @param   {string}    [o.subscriberKey]       If given, the subscriberKey triggering the error
     * @param   {number}    [o.jobid]               The JobId if the error is caused from an email sent.
     * @param   {number}    [o.listid]              The ListId if the error is caused from an email sent.
     * @param   {number}    [o.batchid]             The BatchId if the error is caused from an email sent.
     * @param   {string}    [o.sourceType]          The SourceType. e.g. Email, Web, CRM.
     * @param   {boolean}   [o.raiseError]          Indicates whether an error should be raised to stop an email
     *                                              from sending out. Only works in Email Studio. A value of true skips the 
     *                                              send for current Subscriber and moves to next Subscriber
     *                                              A value of false stops the send and returns an error.
     *
     * @returns  {string}                           The eventId for the error.
     */
    function logError(o) {
        var settings = new settings(),
            de = settings.de.logError.Name,
            name = [],
            value = [],
            error = {
                EventDate: Platform.Function.SystemDateToLocalDate(Now()),
                EventId: Platform.Function.GUID(),
                Message: o.message,
                Method: o.method,
                JobId: (!o.jobId) ? null : o.jobId,
                ListId: (!o.listId) ? null : o.listId,
                BatchId: (!o.batchId) ? null : o.batchId,
                Source: o.source,
                SourceType: (!o.sourceType) ? null : o.sourceType,
                SubscriberKey: (!o.subscriberKey) ? null : o.subscriberKey
            };

        for( var i in error ) {
            name.push(i);
            value.push(error[i]);
        }

        // write error log to DE
       if( !Array.isArray(debugMode) ) {
            var r = Platform.Function.InsertDE(de,name,value);

            if (o.hasOwnProperty('raiseError') && typeof o.raiseError == 'boolean') {
                Platform.Function.RaiseError(o.message, o.raiseError);
            }
        }
        debug('(logError) Error:');
        debug(o);

        return error.EventId;
    }

    /**
     *
     * Log a warning to a DataExtension.
     *
     * This function requires a DataExtension defined in settings.de.logWarning.
     *
     * @param   {object}    o                       Holds the data for the warning log.
     *
     * @param   {string}    o.method                The method calling the warning.
     * @param   {string}    o.message               The warning message for better understanding of the warning.
     * @param   {string}    o.source                A detailed name of the warning origin. E.g. [Email] Survey.
     * @param   {string}    [o.subscriberKey]       If given, the subscriberKey triggering the warning
     * @param   {number}    [o.jobid]               The JobId if the warning is caused from an email sent.
     * @param   {number}    [o.listid]              The ListId if the warning is caused from an email sent.
     * @param   {number}    [o.batchid]             The BatchId if the warning is caused from an email sent.
     * @param   {string}    [o.sourceType]          The SourceType. e.g. Email, Web, CRM.
     *
     * @returns  {string}                           The eventId for the warning.
     */
    function logWarning(o) {
        var settings = new settings(),
            de = settings.de.logWarning.Name,
            name = [],
            value = [],
            warning = {
                EventDate: Platform.Function.SystemDateToLocalDate(Now()),
                EventId: Platform.Function.GUID(),
                Message: o.message,
                Method: o.method,
                JobId: (!o.jobId) ? null : o.jobId,
                ListId: (!o.listId) ? null : o.listId,
                BatchId: (!o.batchId) ? null : o.batchId,
                Source: o.source,
                SourceType: (!o.sourceType) ? null : o.sourceType,
                SubscriberKey: (!o.subscriberKey) ? null : o.subscriberKey
            };

        for( var i in warning ) {
            name.push(i);
            value.push(warning[i]);
        }

        // write warning log to DE
        if( !Array.isArray(debugMode) ) {
            var r = Platform.Function.InsertDE(de,name,value);
        }
        debug('(logWarning) Warning:');
        debug(o);

        return warning.EventId;

    }

    /**
     * Check if value is an object.
     *
     * @param {*} value The value to check.
     *
     * @returns  {boolean}
     */
    function isObject(value) {
        if (value === null) { return false; }
        return ((typeof value === 'function') || (typeof value === 'object'));
    }

    /**
     * Add units to a datetime
     *
     * @param   {date}      dt              The original date
     * @param   {number}    number          Numbers to add to the dt
     * @param   {string}    [unit=Hours]    Units to add ['Seconds','Minutes','Hours','Days','Months','Years'].
     *
     * @returns  {date}  The new date
     */
    function dateAdd(dt, number, unit) {
        var u = (unit) ? unit : 'Hours',
            validUnits = ['Seconds','Minutes','Hours','Days','Months','Years'],
            date = new Date(dt);

        if(!validUnits.includes(u)) {
            debug('(dateAdd)\n\tUnit not allowed: '+u+'. Use Hours instead' );
        }

        // convert number to integer
        number = Number(number);

        switch(u) {
            case 'Seconds':
                date.setSeconds(date.getSeconds() + number);
            break;
            case 'Minutes':
                date.setMinutes(date.getMinutes() + number);
            break;
            case 'Days':
                date.setHours(date.getHours() + (number*24));
            break;
            case 'Months':
                date.setMonth(date.getMonth() + number);
            break;
            case 'Years':
                date.setFullYear(date.getFullYear() + number);
            break;
            default:
                date.setHours(date.getHours() + number);
        }
        return date;
    }

    /**
     * Subtract units to a datetime
     *
     * @param   {date}      dt              The original date
     * @param   {number}    number          Number to subtract from the dt
     * @param   {string}    [units=Hours]   Units to subtract ['Seconds','Minutes','Hours','Days','Months','Years'].
     *
     * @returns  {date}  The new date
     */
    function dateSubtract(dt, number, unit) {
        var u = (unit) ? unit : 'Hours',
            validUnits = ['Seconds','Minutes','Hours','Days','Months','Years'],
            date = new Date(dt);

        if(!validUnits.includes(u)) {
            debug('(dateSubtract)\n\tUnit not allowed: '+u+'. Use Hours instead' );
        }

        // convert number to integer
        number = Number(number);

        switch(u) {
            case 'Seconds':
                date.setSeconds(date.getSeconds() - number);
            break;
            case 'Minutes':
                date.setMinutes(date.getMinutes() - number);
            break;
            case 'Days':
                date.setHours(date.getHours() - (number*24));
            break;
            case 'Months':
                date.setMonth(date.getMonth() - number);
            break;
            case 'Years':
                date.setFullYear(date.getFullYear() - number);
            break;
            default:
                date.setHours(date.getHours() - number);
        }
        return date;
    }

    /**
     * Remove time from given DateTime
     *
     * @param   {date}  dt  The datetime
     *
     * @returns  {date}  Date
     */
    function getDateFromDateTime(dt) {
        var d = (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + dt.getFullYear();
        return new Date(d);
    }

    /**
     * Get the current UTC Date
     *
     * @returns {date} UTC Date
     */
    function getDateUTC() {
        var utc = dateAdd(new Date(), 6, 'Hours'),
            pad = function(number) { return(number < 10) ? '0' + number : number; };

        return new Date( utc.getFullYear() +
          '-' + pad(utc.getMonth() + 1) +
          '-' + pad(utc.getDate()) +
          'T' + pad(utc.getHours()) +
          ':' + pad(utc.getMinutes()) +
          ':' + pad(utc.getSeconds()) +
          '.' + (utc.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
          'Z'
        );
    }
    
    /**
     * Get the current UnixTimestamp
     *
     * @param {boolean} ms  Return the UnixTimestamp in ms
     * 
     * @returns {number} The current UnixTimestamp in UTC
     */
    function getUnixTimestamp(ms) {
        var ts = Math.round((new Date()).valueOf()); 
        return (ms) ? ts : Math.floor(ts / 1000);
    }

    /**
     * Get the difference in hours between two datetimes
     *
     * @param   {date}  d1  Date 1
     * @param   {date}  d2  Date 2
     *
     * @returns  {number}  hours difference
     */
    function dateDiffInHours(d1, d2) { return (d1.valueOf() - d2.valueOf()) / 1000 / 60 / 60; }

    /**
     * Get the difference in days between two datetimes
     *
     * @param   {date}  d1  Date 1
     * @param   {date}  d2  Date 2
     *
     * @returns  {number}  days difference
     */
    function dateDiffInDays(d1, d2) {
        var dt1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
        var dt2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
        var millisecondsPerDay = 1000 * 60 * 60 * 24;
        var millisBetween = dt2.getTime() - dt1.getTime();
        var days = millisBetween / millisecondsPerDay;
        return Math.round(days);
    }

    /**
     * Convert minutes into a human readable form
     *
     * @param   {number}  m  Miniutes given
     *
     * @returns  {string}
     */
    function timeConvert(m) {
        var s = [];
        var r = {
                day: Math.round(m/24/60),
                hour: Math.floor(m/60%24),
                minute: Math.round(m%60)
            };

        for(var k in r) {
            if( r[k] > 0 ) {
                s.push((r[k] > 1) ? r[k]+' '+k+'s' : r[k]+' '+k);
            }
        }
        return s.join(' and ');
    }

    /**
     * Group an array of object by one property
     * 
     * @param {array} data  An array of objects
     * @param {string} key  The property or accessor
     *
     * @returns {array} the grouped array
     *
     * @see {@link https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects|StackOverflow}
     * @see {@link https://gist.github.com/robmathers/1830ce09695f759bf2c4df15c29dd22d|RobMathers Git}
     * 
     */
    function groupBy(data, key) { // `data` is an array of objects, `key` is the key (or property accessor) to group by
        // reduce runs this anonymous function on each element of `data` (the `item` parameter,
        // returning the `storage` parameter at the end
        return data.reduce(function(storage, item) {
        // get the first instance of the key by which we're grouping
        var group = item[key];

        // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
        storage[group] = storage[group] || [];

        // add this item to its group within `storage`
        storage[group].push(item);

        // return the updated storage to the reduce function, which will then loop through the next 
        return storage; 
        }, {}); // {} is the initial value of the storage
    }

    /**
     * Check if a string is in the object
     *
     * @param   {string}    needle      The string to find in the object.
     * @param   {object}    haystack    The object to search.
     *
     * @returns  {boolean}
     */
    function inObject(needle,haystack) {
       return Object.keys(haystack).some(function(k) {
            return obj[k] === needle; 
        });
    }

    /**
     * Check if a string is in the object) recursively.
     *
     * @param   {string}    needle      The string to find in the object.
     * @param   {object}    haystack    The object to search.
     *
     * @returns  {boolean}
     */
    function inObjectRecursive(needle,haystack) {
        var exists = false;
        var keys = Object.keys(haystack);
        
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var type = typeof haystack[key];
            
            if(type === 'object') {
                exists = inObjectRecursive(needle, haystack[key]);

            } else if(type === 'array') {
                for(var j = 0; j < haystack[key].length; j++) {
                    exists = inObjectRecursive(needle, haystack[key][j]);
                    if(exists) {
                        break;
                    }
                }
            } else if(type === 'string') {
                exists = haystack[key] == needle;   
            }

            if(exists) {
                break;
            }
        }
        return exists;
    }

    /**
     * Shuffles an array.
     *
     * @param {array} a Array containing the items.
     *
     * @returns {array} The suffeled array
     */
    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    /**
     * Delete item in array.
     *
     * @param {array}   array   Array containing the item.
     * @param {string}  item    The item to be deleted
     *
     * @returns {array} The new array
     */
    function deleteArrayItem(array, item) {
        for (var k = 0; k < array.length; k++) {
            if( array[k] == item ) {
                array.splice(k, 1);
            }
        }
        return array;
    }

    /**
     * Create AMP variables from an object
     *
     * @param  {object}  value  A name and value object.
     *
     * @example
     * // creates 3 AMP variables
     * createAmpVariables({
     *      email: 'info@email360.io',
     *      source: 'Email360',
     *      url: 'http://www.email360.io'
     * });
     */
    function createAmpVariables(value) {
        debug('(createAmpVariables) Create AMP Script Variable:');
        for (var i in value) {
            Variable.SetValue(i, value[i]);
            debug('\t@' + i + ' with value ' + value[i]);
        }
    }

    /**
     * Returns the current member id where this code is executed
     */
    function getMemberID() {
        return Platform.Function.AuthenticatedMemberID();
    }


    /**
     * SSJS wrorkaround to use console server side 
     */
    function console_log() {
        Platform.Response.Write('<scr' + 'ipt>');
        Platform.Response.Write('console.log.apply(null,' + Platform.Function.Stringify(Array.from(arguments)) + ')');
        Platform.Response.Write('</scr' + 'ipt>'); 
    }

    /**
     * Display the message appropriate to the Debugging Mode
     *
     * @param {string} message The message to be displayed. 
     */
    function debug(message) {

        // remove script tags from string
        var message = (typeof message === 'string') ? message.replace(/<script[\s\S]*?>/gi, '').replace(/<\/script>/gi, '') : message;

        if( Array.isArray(debugMode) ) {
            if(debugMode.includes('console')) {
                console_log(message);
            }
            if(debugMode.includes('html')) {
                var m = (typeof message == 'string') ? message.replace('\n', '<br/>').replace('\t', '&nbsp;&nbsp;&nbsp;&nbsp') : Platform.Function.Stringify(message);
                Platform.Response.Write('<pre style="margin:0.85em 0px;"><span style="font-size: 11px;">'+m+'</span></pre>');
            }
            if(debugMode.includes('text')) {
                Platform.Response.Write('{'+Platform.Function.Stringify(message)+'}\n');
            }
        }
    }

    /**
     * Wait for n Miliseconds
     *
     * @param  {number} ms Miliseconds to sleep
     */
    function wait(ms) {
        debug("(Wait)\n\tOK: "+ms+" Miliseconds");
        var s = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - s) > ms){
                break;
            }
        }   
    }

    /**
     * Validates if the contentBlock with the given key exists
     *
     * @param {string} customerKey  The ContentBlockKey
     *
     * @returns  {boolean}
     */
    function isContentBlockByKey(customerKey) {
        try {
            // Cannot use the 3rd parameter to continue on error. The 2nd parameter cannot be NULL and not every implemantion uses ImpressionRegions.
            var c = Platform.Function.ContentBlockByKey(customerKey);
            return true;
        } catch (e) {
            return false;
        }
    }    

    /**
     * Returns the current page URL optional with parameters
     *
     * @param   {boolean}    [withParam=false]  Keep parameters from the url
     *
     * @returns  {string}
     */
    function getPageUrl(withParam) {
        var p = (typeof withParam != 'boolean') ? true : withParam,
            url = Request.GetQueryStringParameter('PAGEURL');
        return (p) ? url : url.split('?')[0];
    }

    /**
     * Verify if the given string is a possible SFMC default CustomerKey
     *
     * @param {string} str The string to be tested
     *
     * @returns  {boolean}
     */
    function isCustomerKey(str) { return RegExp('^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$').test(str); }

    /**
     * Perform an HTTP request allowing the usage of API methods.
     *
     * @param {string} method           The method to use e.g: POST, GET, PUT, PATCH, and DELETE
     * @param {string} url              The url to send the request to
     * @param {string} [contentType]    The contentType to use e.g: application/json
     * @param {object} [payload]        A payload for the request body
     * @param {object} [header]         Header values as key value pair
     *
     * @returns {object} Result of the request
     */
    function httpRequest(method,url,contentType,payload,header) {
        var req = new Script.Util.HttpRequest(url);
        req.emptyContentHandling = 0;
        req.retries = 2;
        req.continueOnError = true;
        req.method = method;
        for( var k in header ) {
            req.setHeader(k, header[k]);
        }
        if(typeof contentType !== 'undefined' && contentType !== null) { req.contentType = contentType; }
        if(typeof payload !== 'undefined' && payload !== null) { req.postData = Platform.Function.Stringify(payload); }

        try {
            debug('(httpRequest)\n\tCall method '+method+' on '+url); 
            var res = req.send();

            return {
                status: Platform.Function.ParseJSON(String(res.statusCode)),
                content: Platform.Function.ParseJSON(String(res.content))
            };

        } catch(e) {
            return {
                status: '500',
                content: e
            };
        }
    }

    /**
     * Generate a random string for the given fieldType
     *
     * Allowed types: Decimal,EmailAddress,Boolean,Number
     * Date, Phone, Locale, Text.
     *
     * @param {string} fieldType  Defines the data to be generated. 
     *
     * @returns {string} The generated data string
     */
    function getRandomData(fieldType) {
        var loc;
        if(fieldType == "Decimal")       return Math.floor(Math.random() * (1000 - 100) + 100) / 100;
        if(fieldType == "EmailAddress")  return Math.floor(Math.random() * 10000000000) + "@sample.com.invalid";
        if(fieldType == "Boolean")       return (Math.random() >= 0.5);
        if(fieldType == "Number")        return Math.floor(Math.random() * 100);
        if(fieldType == "Date")          return new Date(+(new Date()) - Math.floor(Math.random() * 10000000000));
        if(fieldType == "Phone") {
            var countryCode = ['','+x','+xx','+xxx','+1-xxx','+44-xxxx'],
                length = [9,10,11],
                numberCount = length[Math.floor(Math.random() * length.length)],
                prefix = countryCode[Math.floor(Math.random() * countryCode.length)];
            if(/x/g.test(prefix)) {
                var l = ((prefix.match(/x/g) || []).length);
                // iterate to generate a random number each occurrence time.
                for (var x = 0; x < l; x++) {
                    prefix = prefix.replace('x', (Math.floor(Math.random() * 8)+1));
                }
                prefix += ' ';
            }
            var n = prefix;
            for (var i = 0; i < numberCount; i++) {
                n += Math.floor(Math.random() * 9);
            }
            return n;
        }
        if(fieldType == "Locale") {
            // Maximum character length per liner in email studio is around 768 characters.
            var l1 = ['af-za','am-et','ar-ae','ar-bh','ar-dz','ar-eg','ar-iq','ar-jo','ar-kw','ar-lb','ar-ly','ar-ma','ar-om','ar-qa','ar-sa','ar-sy','ar-tn','ar-ye','as-in','ba-ru','be-by','bg-bg','bn-bd','bn-in','bo-cn','br-fr','ca-es','co-fr','cs-cz','cy-gb','da-dk','de-at','de-ch','de-de','de-li','de-lu','dv-mv','el-gr','en-au','en-bz','ca','en-gb','en-ie','en-in','en-jm','en-my','en-nz','en-ph','en-sg','en-tt','en-us','en-za','en-zw','es-ar','es-bo','es-cl','es-co','es-cr','es-do','es-ec','es-es','es-gt','es-hn','es-mx','es-ni','es-pa','es-pe','es-pr','es-py','es-sv','es-us','es-uy','es-ve','et-ee','eu-es','fa-ir','fi-fi','fo-fo','fr-be','fr-ca','fr-ch','fr-fr','fr-lu','fr-mc','fy-nl','ga-ie','gd-gb','gl-es','gu-in','he-il','hi-in','hr-ba','hr-hr','hu-hu','hy-am'];
            var l2 = ['id-id','ig-ng','ii-cn','is-is','it-ch','it-it','ja-jp','ka-ge','kk-kz','kl-gl','km-kh','kn-in','ko-kr','ky-kg','lb-lu','lo-la','lt-lt','lv-lv','mi-nz','mk-mk','ml-in','mn-mn','mr-in','ms-bn','ms-my','mt-mt','nb-no','ne-np','nl-be','nl-nl','nn-no','oc-fr','or-in','pa-in','pl-pl','ps-af','pt-br','pt-pt','rm-ch','ro-ro','ru-ru','rw-rw','sa-in','se-fi','se-no','se-se','si-lk','sk-sk','sl-si','sq-al','sv-fi','sv-se','sw-ke','ta-in','te-in','th-th','tk-tm','tn-za','tr-tr','tt-ru','ug-cn','uk-ua','ur-pk','vi-vn','wo-sn','xh-za','yo-ng','zh-cn','zh-hk','zh-mo','zh-sg','zh-tw','zu-za'];
            var locales = l1.concat(l2);
            return locales[Math.floor(Math.random() * locales.length)].toUpperCase();
        }
        if(fieldType ==  "Text") {
            var str = "lorem ipsum dolor sit amet consectetur adipiscing elit donec vel nunc eget augue dignissim bibendum";
            arr = str.split(" ");
            var ctr = arr.length, temp, index;
            while (ctr > 0) {
                index = Math.floor(Math.random() * ctr);
                ctr--;
                temp = arr[ctr];
                arr[ctr] = arr[index];
                arr[index] = temp;
            }
            str = arr.join(" ");
            return str;
        }
    }

    /**
     * Generate amp script variables from a SSJS Object
     *
     * The SSJS object will be flatten. Object keys will retain
     * the key as name while array items will add the key position.
     *
     * Example: { "Hello": "World", "MyArray": ["one","two"], "MyNestedObject": {"name": "John"} }
     * Output: @Hello = "World"
     *         @MyArray_0 = "one"
     *         @MyArray_1 = "two"
     *         @MyNestedObject_name = "John"
     *
     * @param {object} ssjsObject       The object to be converted
     * @param {string} [prefix=null]    An optional prefix for each ampScirpt variable
     * @param {string} [delimiter=-]     THe delimiter between each nested item
     *
     * @returns {string} The generated data string
     */
    function createAmpVariablesFromObject(ssjsObject,prefix,delimiter) {
        var p = (prefix)?prefix:'',
            d = (delimiter)?delimiter:'_',
            ampObject = {};

        flatten(ssjsObject, '');

        createAmpVariables(ampObject);
        return ampObject;

        function flatten(currentObject, previousKeyName) {

            if( Array.isArray(currentObject) ) {
                for (var i = 0; i < currentObject.length; i++) {
                    flatten(currentObject[i], (previousKeyName == null || previousKeyName == '') ? i : previousKeyName + d + i );
                }

            } else {

                for (var key in currentObject) {
                    var value = currentObject[key];

                    if (!isObject(value)) {
                        if (previousKeyName == null || previousKeyName == '') {
                            ampObject[p+key] = value;
                        } else {
                            if (key == null || key == '') {
                                ampObject[p+previousKeyName] = value;
                            } else {
                                ampObject[p+previousKeyName + d + key] = value;
                            }
                        }
                    } else {
                        flatten(value, (previousKeyName == null || previousKeyName == '') ? key : previousKeyName + d + key);
                    }
                }
            }
        }
    }


    /**
     * Load a content file from any github repo
     *
     * This can be used to speed up development of cloudpages while keep the benefit of github
     *
     * @param {object} obj              The object holding the required parameters
     *
     * @param {string} obj.username     The github username
     * @param {string} obj.repoName     The name of the repository
     * @param {string} obj.filePath     The full file path including the filename inside the repo
     * @param {string} obj.token        The access token generated for the repo inside github
     *
     * @returns {string} The entire content of the github content
     *
     * @example
     * // set github parameter
     * var obj = {
     *     username : "email360-github",
     *     token    : "De0ed0b390deabBfGc30761bD535c036fbc7eAe5",
     *     repoName : "email360",
     *     fileName : "sample.js"
     *  };
     *
     * // pull the content from github
     * var githubContent = getGitHubRepoContent(obj);
     *
     * // convert the content into an AMPScript variable
     * Platform.Variable.SetValue("@githubContent", githubContent);
     * 
     * // execute the content
     * %%=TreatAsContent(@githubContent)=%%
     */
    function getGitHubRepoContent(obj){
        var resource = 'https://api.github.com/repos/'+ obj.username + '/' + obj.repoName + '/contents/' + obj.filePath;
        debug('(getGitHubRepoContent)\n\tOK: Call Github for the following resource: '+resource);
        var req = new Script.Util.HttpRequest(resource);
            req.emptyContentHandling = 0;
            req.retries = 2;
            req.continueOnError = true;
            req.setHeader("Authorization","Bearer " + obj.token);
            req.setHeader("User-Agent", obj.username + '/' + obj.repoName);
            //  This header is very important! It allows to get the file content raw version.
            req.setHeader("Accept", "application/vnd.github.v3.raw");
            req.setHeader("Cache-Control", "no-cache");
            req.method = "GET";

        var resp = req.send();

        return resp.content;
    }

    /**
     * Convert XML to JSON using XSLT
     * 
     * @param {string} xml  The xml to convert to JSON
     * 
     * @return {object} the converted JSON
     */
    function convertXMLToJSON(xml) {
        var xslt = '<?xml version="1.0" encoding="UTF-8" ?> <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:output method="text" encoding="utf-8"><xsl:template match="/"><xsl:text>{</xsl:text><xsl:apply-templates select="." mode="detect"><xsl:text>}</xsl:text></xsl:template><xsl:template match="*" mode="detect"><xsl:choose><xsl:when test="name(preceding-sibling::*[1]) = name(current()) and name(following-sibling::*[1]) != name(current())"><xsl:apply-templates select="." mode="obj-content"><xsl:text>]</xsl:text><xsl:if test="count(following-sibling::*[name() != name(current())]) &gt; 0">,</xsl:if></xsl:when><xsl:when test="name(preceding-sibling::*[1]) = name(current())"><xsl:apply-templates select="." mode="obj-content"><xsl:if test="name(following-sibling::*) = name(current())">,</xsl:if></xsl:when><xsl:when test="following-sibling::*[1][name() = name(current())]"><xsl:text>"</xsl:text><xsl:value-of select="name()"><xsl:text>" : [</xsl:text><xsl:apply-templates select="." mode="obj-content"><xsl:text>,</xsl:text></xsl:when><xsl:when test="count(./child::*) > 0 or count(@*) > 0"><xsl:text>"</xsl:text><xsl:value-of select="name()">" :<xsl:apply-templates select="." mode="obj-content"><xsl:if test="count(following-sibling::*) &gt; 0">,</xsl:if></xsl:when><xsl:when test="count(./child::*) = 0"><xsl:text>"</xsl:text><xsl:value-of select="name()">" : "<xsl:apply-templates select="."><xsl:text>"</xsl:text><xsl:if test="count(following-sibling::*) &gt; 0">,</xsl:if></xsl:when></xsl:choose></xsl:template><xsl:template match="*" mode="obj-content"><xsl:text>{</xsl:text><xsl:apply-templates select="@*" mode="attr"><xsl:if test="count(@*) &gt; 0 and (count(child::*) &gt; 0 or text())">,</xsl:if><xsl:apply-templates select="./*" mode="detect"><xsl:if test="count(child::*) = 0 and text() and not(@*)"><xsl:text>"</xsl:text><xsl:value-of select="name()">" : "<xsl:value-of select="text()"><xsl:text>"</xsl:text></xsl:if><xsl:if test="count(child::*) = 0 and text() and @*"><xsl:text>"text" : "</xsl:text><xsl:value-of select="text()"><xsl:text>"</xsl:text></xsl:if><xsl:text>}</xsl:text><xsl:if test="position() &lt; last()">,</xsl:if></xsl:template><xsl:template match="@*" mode="attr"><xsl:text>"</xsl:text><xsl:value-of select="name()">" : "<xsl:value-of select="."><xsl:text>"</xsl:text><xsl:if test="position() &lt; last()">,</xsl:if></xsl:template><xsl:template match="node/@TEXT | text()" name="removeBreaks"><xsl:param name="pText" select="normalize-space(.)"><xsl:choose><xsl:when test="not(contains($pText, \'&#xA;\'))"><xsl:copy-of select="$pText"></xsl:when><xsl:otherwise><xsl:value-of select="concat(substring-before($pText, \'&#xD;&#xA;\'), \' \')"><xsl:call-template name="removeBreaks"><xsl:with-param name="pText" select="substring-after($pText, \'&#xD;&#xA;\')"></xsl:call-template></xsl:otherwise></xsl:choose></xsl:template></xsl:stylesheet>';
        return Platform.Function.ParseJSON(TransformXML(xml,xslt));
    }


    // undocumented on purpose. Used to update the settings object with a custom setting object
    function _updateSettings(setting) {
        orgSetting = new settings();

        for(var k in setting) {
            orgSetting[k] = setting[k];
        }
        return orgSetting;
    }





</script>