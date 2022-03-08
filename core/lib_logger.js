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
     *              level: "TRACE",
     *              call: {
     *                  target: ['console','text']
     *          }
     *      }
     * ]};
     * 
     * @param {string} name - The name of the script / category used to identify the log
     * 
     */
    function logger(name) {
        if (!name) {
            throw "[logger] No Logger category provided.";
        }

        this.category = name;
        this.configure = {};
        this.level = 'OFF';
        // Log4j hirachy 
        this.levels = {
            ALL: 0,
            TRACE: 10,
            DEBUG: 20,
            INFO: 30,
            WARN: 40,
            ERROR: 50,
            FATAL: 60,
            OFF: 100
        };
        this.allowedAppenders = ['DataExtension','Console','HTTP'];
        this.logId = null;

        this.trace = function() { this._appenders(arguments,'trace'); }
        this.debug = function() { this._appenders(arguments,'debug'); }
        this.info = function() { this._appenders(arguments,'info'); }
        this.warn = function() { this._appenders(arguments,'warn'); }
        this.error = function() { this._appenders(arguments,'error'); }
        this.fatal = function() { this._appenders(arguments,'fatal'); }

        /**
         * Wrapper to decide if the message should be handled by the appender
         * 
         * @param {array} message - The message itself
         * @param {string} messageLevel - The message level such as WARN,INFO,ERROR
         */
        this._appenders = function(message,messageLevel) {
            if (isObject(this.configure) && this.configure.hasOwnProperty('appenders')) {
                var appenders = (!Array.isArray(this.configure.appenders)) ? [this.configure.appenders] : this.configure.appenders;

                for (var i = 0; i < appenders.length; i++) {
                    var appender = appenders[i];

                    // check if user given level exists otherwise keep original level
                    if (appender.hasOwnProperty('level') && this.levels.hasOwnProperty(appender.level.toUpperCase())) {
                        this.level = appender.level.toUpperCase();
                    }
                    this._log(message,messageLevel,appender);
                }

            } else {
                this._log(message,messageLevel);
            }
        }

        /**
         * The actual log function to log the message based on the given
         * appender.
         * 
         * @param {string} message - The message to be log
         * @param {string} messageLevel - The message level such as WARN, INFO, ERROR
         * @param {object} appender - Appender object
         * 
         * @param {string} appender.type - The appender type name
         * @param {object} [appender.call] - Call information for each appender
         */
        this._log = function(message,messageLevel,appender) {
            var appender = (this.allowedAppenders.includes(appender.type)) ? appender : {type: 'Console'},
                logLevelNumber = this.levels[this.level],
                messageLevel = messageLevel.toUpperCase();
                messageLevelNumber = this.levels[messageLevel];

            // messagelevel must be greater or equal than log level but smaller than off
            if (messageLevelNumber >= logLevelNumber && messageLevelNumber < this.levels['OFF']) {

                this.logId = Platform.Function.GUID();

                switch (appender.type) {
                    case 'DataExtension':
                        this._appenderDataExtension(messageLevel,message,appender.call);
                    break;
                    case 'HTTP':
                        this._appenderHTTP(messageLevel,message,appender.call);
                    break;
                    case 'Console':
                        this._appenderConsole(messageLevel,message,appender.call);
                    break;
                }
            }
        }

        /**
         * Get the log time in a readable format
         * 
         * @param {boolean} inMilliseconds - The given time will include milliseconds
         * @returns {string}
         */
        this._getLogTime = function(inMilliseconds) {
            var dd = Platform.Function.SystemDateToLocalDate(new Date(getUnixTimestamp(inMilliseconds))),
                pad = function(number,dec) { var dec = dec || 2; return String(number).padStart(dec,'0') };

            return dd.getFullYear() +
              '-' + pad(dd.getMonth() + 1) +
              '-' + pad(dd.getDate()) +
              ' ' + pad(dd.getHours()) +
              ':' + pad(dd.getMinutes()) +
              ':' + pad(dd.getSeconds()) +
              '.' + pad(dd.getMilliseconds(),3);
        }

        /**
         * DataExtension appender
         * 
         * This appender will store the message in the system DataExtension
         * 
         * @param {string} level - The message level such as WARN, INFO, ERROR
         * @param {string} message - The message to log
         * @param {object} appender - Appender object
         * 
         * @param {array} [appender.name] - The name of the DataExtension to log
         */
        this._appenderDataExtension = function(level,message,appender) {
            var settings = new lib_settings(),
                de = appender.name || settings.de.log.Name,
                name = [],
                value = [];

            var logTime = this._getLogTime(true),
                logId = this.logId,
                logCategory = this.category;

            var log = {
                    date: Platform.Function.SystemDateToLocalDate(Now()),
                    timestamp: logTime,
                    id: logId,
                    level: level,
                    message: message,
                    category: logCategory
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
         * Console appender
         * 
         * This appender will display the message in the browser console
         * 
         * @param {string} level - The message level such as WARN, INFO, ERROR
         * @param {string} message - The message to log
         * @param {object} appender - Appender object
         * 
         * @param {array} [appender.target] - An array to define the output of the console
         *                                    Allowed values are 'console', 'text' and / or 'html'
         */  
        this._appenderConsole = function(level,message,appender) {
            var target = (Array.isArray(appender.target)) ? appender.target : ['console'],
                log = '['+this._getLogTime(true)+'] ['+level+'] [' + this.category + '] -',
                m = [];
            
            message = Platform.Function.ParseJSON(Stringify(Array.from(message)).replace(/<script[\s\S]*?>/gi, '').replace(/<\/script>/gi, ''));
            message.unshift(log);
            message.forEach(function (e) {(typeof e == 'object') ? m.push(Stringify(e)) : m.push(e);});
            m = m.join(' ');

            if(target.includes('console')) {
                Platform.Response.Write('<scr' + 'ipt>');
                Platform.Response.Write('console.log.apply(console,' + Platform.Function.Stringify(message) + ')');
                Platform.Response.Write('</scr' + 'ipt>'); 
            }
            if(target.includes('html')) {
                Platform.Response.Write('<pre style="margin:0.85em 0px;"><span style="font-size: 11px;">'+m.replace('\n', '<br/>').replace('\t', '&nbsp;&nbsp;&nbsp;&nbsp')+'</span></pre>');
            }
            if(target.includes('text')) {
                Platform.Response.Write('{'+m+'}\n');
            }
        }

        /**
         * Console HTTP
         * 
         * This appender will send the message via a httprequest to the appender.url
         * 
         * @param {string} level - The message level such as WARN, INFO, ERROR
         * @param {string} message - The message to log
         * @param {object} appender - Appender object
         * 
         * @param {string} appender.url - The target URL for the HTTPRequest
         * @param {string} [appender.methdod=POST] - The HTTP method
         * @param {string} [appender.header] - The HTTP header
         * @param {string} [appender.contentType=application/json] - The HTTP contentType. 
         * @param {object} [appender.paylaod] - Additional payload for the HTTP request
         */  
        this._appenderHTTP = function(level,message,appender) {
            if (!appender.url) {
                throw "[logger] No Appender URL found for appender HTTP";
            }

            // log details
            var logTime = this._getLogTime(true),
                logId = this.logId,
                logCategory = this.category;

            // HTTP parameter
            var header = appender.header || null,
                contentType = appender.contentType || "application/json",
                method = appender.method || 'POST',
                payload = {
                    Timestamp: logTime,
                    Id: logId,
                    Level: level,
                    Message: message,
                    Category: logCategory
                };

            payload = mergeObject(payload,appender.payload || {});

            var resp = httpRequest(method,appender.url,contentType,payload,header);
            if (resp.status != '200') {
                throw "[logger] Failed to log to [HTTP] on [" + appender.url + "]: "+ Stringify(resp.content);
            }
        }
    }

</script>