<script runat="server" language="javascript">

    // NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    // 
    // USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    // NOT CONTROL.
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
     * Copyright:       {@link https://www.email360.io/|email360}
     * <br>Author:      {@link https://www.linkedin.com/in/sascha-huwald/|Sascha Huwald}
     * <br>Since:       2022
     * <br>Version:     1.0.0
     * <br>License:     MIT         
     * 
     * This is a mini log4ssjs version based on log4j
     * 
     * A log request of level p in a logger with level q is enabled if p >= q. This rule is 
     * at the heart of log4j. It assumes that levels are ordered. For the standard levels, 
     * we have ALL < DEBUG < INFO < WARN < ERROR < FATAL < OFF.
     * 
     * The Following example shows how we can filter all our DEBUG and INFO messages. This 
     * program uses of logger method level(X) to set a desired logging level.
     * 
     * This example would print all the messages except DEBUG and INFO:
     * 
     * @example
     * var log = new logger('myScript');
     * log.level = 'WARN'
     * 
     * log.trace("Trace Message!");
     * log.debug("Debug Message!");
     * log.info("Info Message!");
     * log.warn("Warn Message!");
     * log.error("Error Message!");
     * log.fatal("Fatal Message!");
     * 
     * @description
     * Output from the above example
     * Warn Message!
     * Error Message!
     * Fatal Message!
     * 
     * This is an example configuration.
     * @example
     * log.configure = {
     *      appenders: [
     *          { 
     *              type: "DataExtension", 
     *              level: "DEBUG",
     *              call: {
     *                  name: 'My DataExtension'
     *              }
     *          }, { 
     *              type: "HTTP", 
     *              level: "ERROR", 
     *              call: {
     *                  url: "http://www.email360.io",
     *                  method: "POST",
     *                  header: "Bearer " + token,
     *                  contentType: "application/json",
     *                  payload: {
     *                      jwt: "myToken",
     *                      extra: "Payload"
     *                  }
     *              }
     *          }, { 
     *              type: "Console", 
     *              level: "TRACE"
     *          },
     *          {
     *              type:"Browser",
     *              level:"INFO",
     *              call:{
     *                  format:"HTML"
     *              }
     *          }
     *      ]};
     * }
     * 
     * @param {string} name - The name of the script / category used to identify the log
     * 
     */
    function logger(name) {
        if (!name) {
            throw "[logger] No Logger category provided.";
        }

        this.category = name;
        this.wsproxy = null;
        this.configure = {};
        this.message = {};
        this.level = 'OFF';

        // Log4j hirachy 
        this.levels = {
            ALL: {value: 0, color: 'grey'},
            TRACE: {value: 10, color: 'blue'},
            DEBUG: {value: 20, color: 'cyan'},
            INFO: {value: 30, color: 'green'},
            WARN: {value: 40, color: 'yellow'},
            ERROR: {value: 50, color: 'red'},
            FATAL: {value: 60, color: 'magenta'},
            OFF: {value: 100, color: 'grey'}
        };
        
        /**
         * @param  {object} message - A message argument object to strip
         * @return {array}
         */
        var strip = function(message) {
            return Platform.Function.ParseJSON(Stringify(Array.from(message)).replace(/<script[\s\S]*?>/gi, '').replace(/<\/script>/gi, ''));
        };

        /**
         * @param  {array} message - A message array to convert to a string
         * @return {string}
         */
        var convert = function(message) {
            arr = [];
            message.forEach(function (s) {(typeof s == 'object') ? arr.push(Stringify(s)) : arr.push(s);});
            return arr.join(' ');
        }

        this.trace = function() { this.message = { level:'TRACE',args:arguments }; this.appenders(); }
        this.debug = function() { this.message = { level:'DEBUG',args:arguments }; this.appenders(); }
        this.info  = function() { this.message = { level:'INFO',args:arguments }; this.appenders(); }
        this.warn  = function() { this.message = { level:'WARN',args:arguments }; this.appenders(); }
        this.error = function() { this.message = { level:'ERROR',args:arguments }; this.appenders(); }
        this.fatal = function() { this.message = { level:'FATAL',args:arguments }; this.appenders(); }

        /**
         * Wrapper to decide if the message should be handled by the appender
         * 
         * @param {array} message - Message arguments
         */
        this.appenders = function() {
            var config = this.configure,
                id = this.levels[this.message.level].value,
                appenders = (Array.isArray(config.appenders)) ? config.appenders : [{type:'console'}];

            for (var i = 0; i < appenders.length; i++) {
                var appender = appenders[i];

                // check if user given level exists otherwise keep original level
                if (appender.hasOwnProperty('level') && this.levels.hasOwnProperty(appender.level.toUpperCase())) {
                    this.level = appender.level.toUpperCase();
                }

                // messagelevel must be greater or equal than log level but smaller than off
                if (id >= this.levels[this.level].value && id < this.levels['OFF'].value) {
                    this.message.id = Platform.Function.GUID();

                    switch (appender.type) {
                        case 'dataExtension':
                            this.dataExtensionAppender(appender.name);
                        break;
                        case 'http':
                            this.httpAppender(appender.url, appender.method, appender.header, appender.contentType, appender.payload);
                        break;
                        case 'console':
                            this.consoleAppender();
                        break;
                        case 'json':
                            this.jsonAppender();
                        break;
                        case 'html':
                            this.htmlAppender();
                        break;
                        case 'tds':
                            this.tdsAppender(appender.customerKey, appender.recipients);
                        break;
                        default:
                            throw "[logger] [appenders] given appender ["+appender.type+"] is not defined";
                    }
                }
            }
        }

        /**
         * Set the log time in a readable format
         * 
         * @param {boolean} inMilliseconds - The given time will include milliseconds
         * @returns {string}
         */
        this.setLogTime = function(inMilliseconds) {
            var dd = Platform.Function.SystemDateToLocalDate(new Date(getUnixTimestamp(inMilliseconds))),
                pad = function(number,dec) { var dec = dec || 2; return String(number).padStart(dec,'0') };

            return dd.getFullYear() +
              '-' + pad(dd.getMonth() + 1) +
              '-' + pad(dd.getDate()) +
              'T' + pad(dd.getHours()) +
              ':' + pad(dd.getMinutes()) +
              ':' + pad(dd.getSeconds()) +
              '.' + pad(dd.getMilliseconds(),3);
        }


        /* ============================================================================
                                            CATEGORIES
        ============================================================================ */ 
        /**
         * @todo
         */


        /* ============================================================================
                                              LAYOUT
        ============================================================================ */ 
        /**
         * @todo
         */

        /**
         * @param  {array} message - A message array to format
         * @return {array}
         */
        var format = function(message) {
            var log = '['+this.setLogTime(true)+'] ['+this.message.level+'] ' + this.category + ' -';
            message.unshift(log);
            return message;
        };


        /* ============================================================================
                                             APPENDERS
        ============================================================================ */
        
        /**
         * DataExtension appender
         * 
         * This appender will store the message in a DataExtension
         * 
         * @param {string} dataExtensionName - The name of the DataExtension to log
         */
        this.dataExtensionAppender = function(dataExtensionName) {
            var settings = new lib_settings(),
                de = dataExtensionName || settings.de.log.Name,
                name = [],
                value = [],
                fn = this;

            var log = {
                    date: Platform.Function.SystemDateToLocalDate(Now()),
                    timestamp: fn.setLogTime(true),
                    id: fn.message.id,
                    level: fn.message.level,
                    message: convert(strip(fn.message.args)),
                    category: fn.category
                };
        
            // prep the data for insert
            for( var i in log ) {
                name.push(i);
                value.push(log[i]);
            }

            // write error log to DE
            var r = Platform.Function.InsertDE(de,name,value);
        }

        /**
         * TDS appender
         *
         * Send the log message via email to the given recipient
         * Only logger level ERROR will trigger the email send to reduce overhead
         * 
         * @param {string} customerKey - The customerKey for the TriggeredSendDefinition.
         * @param {array}  recipients  - Array of objects with email addresses, subscriberkey and attributes to send the email to.
         */
        this.tdsAppender = function(customerKey,recipients) {
            if (!customerKey || !Array.isArray(recipients)) {
                throw "[logger] [tdsAppender] Missing arguments. Require {string} customerKey and {array} recipients but got: "+Stringify(arguments);
            }

            if (this.levels[this.message.level].value >= this.levels['ERROR'].value) {
                var wsproxy = (typeof this.wsproxy == 'function') ? this.wsproxy : new wsproxy();
                
                // trigger send
                if (!wsproxy.sendTriggeredSend(customerKey,recipients)) {
                    throw "[logger] [tdsAppender] Triggered send failed";
                }
            }
        }

        /**
         * Console appender
         * 
         * This appender will display the message in the browser console
         */  
        this.consoleAppender = function() {
            var message = format(strip(this.message.args)),
                colorMessage = '%c'+message[0];

            message.splice(0, 1, colorMessage);
            message.splice(1, 0, 'color:' + this.levels[this.message.level].color);

            Platform.Response.Write('<scr' + 'ipt>');
            Platform.Response.Write('console.log.apply(console,' + Platform.Function.Stringify(message) + ')');
            Platform.Response.Write('</scr' + 'ipt>');
        }

        /**
         * JSON appender
         * 
         * This appender will display the message in the browser window as JSON
         * 
         */  
        this.jsonAppender = function() {
            var message = Stringify(format(strip(this.message.args)));
            Platform.Response.Write(message+'\n');
        }

        /**
         * HTML appender
         * 
         * This appender will display the message in the browser window as HTML
         * 
         */  
        this.htmlAppender = function() {
            var message = convert(format(strip(this.message.args)));
            Platform.Response.Write('<pre style="margin:0.85em 0px;"><span style="font-size: 11px;">'+message.replace('\n', '<br/>').replace('\t', '&nbsp;&nbsp;&nbsp;&nbsp')+'</span></pre>');    
        }

        /**
         * HTTP Appender
         * 
         * This appender will send the message via a httprequest to the given url
         *
         * @param {string} url - The target URL for the HTTPRequest
         * @param {string} [methdod=POST] - The HTTP method
         * @param {string} [header] - The HTTP header
         * @param {string} [contentType=application/json] - The HTTP contentType. 
         * @param {object} [paylaod] - Additional payload for the HTTP request
         */  
        this.httpAppender = function(url,method,header,contentType,payload) {
            if (!url) {
                throw "[logger] [httpAppender] No Appender URL found";
            }

            // HTTP parameter
            var contentType = contentType || 'application/json',
                method = method || 'POST',
                fn = this,
                data = {
                    timestamp: fn.setLogTime(true),
                    id: fn.message.id,
                    level: fn.message.level,
                    message: convert(strip(fn.message.args)),
                    category: fn.category
                };

            payload = mergeObject(data,payload || {});

            var resp = httpRequest(method,url,contentType,payload,header);
            if (resp.status != '200') {
                throw "[logger] [httpAppender] Failed to log to [HTTP] on [" + url + "] with payload ["+Stringify(payload)+"]: "+ Stringify(resp.content);
            }
        }
    }

</script>