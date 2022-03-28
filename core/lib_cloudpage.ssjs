/**
 * @copyright   {@link https://www.email360.io/|email360}
 * @author      {@link https://www.linkedin.com/in/sascha-huwald/|Sascha Huwald}
 * @since       2020
 * @version     2.0.0
 * @license     {@link https://github.com/email360/ssjs-lib/blob/master/LICENSE|MIT}
 *
 * Collection of wrapper functions for the usage of Cloudpages.
 *
 * @param {string|object}   [auth]      Defines if the cloudpage should be protected
 *                                      Possible values "jwt", "login".
 * @param {object}          [setting]   Used to update the settings object with a custom setting object
 *
 * @example
 * // initialise a new cloudpage instance
 * var cp = new cloudpage();
 *
 * // initialise a new cloudpage instance with a login requirement
 * var cp = new cloudpage('login');
 *
 * // initialise a new cloudpage instance with a jwt token requirement and a custom key
 * // This is used to limit the token access to only token with the given key 
 * var cp = new cloudpage({jwt:'EMAIL360_INT_PWD'});
 */
function cloudpage(auth,settings) {
    this.settings = _updateSettings(settings);

    /** JWT instance **/
    this.jwt = new jwt();

    /** Holds the payload for each call */
    this.payload = { qs:{}, jwt:{} };
    /** Get post data */
    var jsonBody = Platform.Function.ParseJSON(Platform.Request.GetPostData('utf-8'));
    // POST is different from FORM POST
    if (jsonBody && !isObject(jsonBody) && jsonBody.includes('&')) {        
        var postArray = jsonBody.split('&'),
            postObject = {};
        for (var i = 0; i < postArray.length; i++) {
            var key = postArray[i].split('=')[0],
                value = postArray[i].split('=')[1];
            postObject[key] = value;
        }
        jsonBody = postObject;
    }

    this.payload.qs = (isObject(jsonBody)) ? jsonBody : {};

    /**
     * Wrapper to use for JWT authentication. 
     * 
     * Requires a JWT token as a request parameter either as POST or GET.
     * If token is invalid or not given, a redirect to the error page
     * will occur. Required parameter name: 'jwt'
     */
    this.authJWT = function(key) {
        // validate and set the query string payload
        var authHeader = HTTPRequestHeader('Authorization'),
            token = null;

        if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7, authHeader.length);
        } else {
            var payload = this.getParameter(['jwt']);
            token = payload.jwt;
        }            

        try { 
            this.payload.jwt = this.jwt.decode(token,key);
        } catch(e) {
            this.redirectError({
                errorCode: e.code,
                errorMessage: e.message,
                errorDebug: 'Token is invalid: '+ Platform.Function.Stringify(token)
            });
        }
    };

    /**
     * Wrapper to use for LOGIN authentication. 
     *
     * Requires a cookie as a JWT token. Name of the cookie can be set in the settings.
     * Requires a login page to generate a token after successfully authenticated.
     *
     * The default login page can be set in thr config: cp.login.
     */
    this.authLogin = function(key) {
        var cookieName = this.settings.auth.cookieName,
            payload = { origin: base64urlEscape(Platform.Function.Base64Encode(getPageUrl())) },
            url = this.settings.cp.login;

        debug('(authLogin)\n\tRetrieve cookie: '+cookieName);
        token = Platform.Request.GetCookieValue(cookieName);

        // no cookie found > redirect to login
        if( !token || token == "" ) {
            url = (Number.isInteger(url)) ? CloudPagesURL(url,payload) : url +'?payload='+Platform.Function.Base64Encode(Platform.Function.Stringify(payload));
            Platform.Response.Redirect(url,false);
        }

        // cookie is not valid - destory
        try { 
            this.payload.jwt = this.jwt.decode(token,key);
            debug('(authLogin)\n\tOK: Logged in successfully');
        } catch(e) {
            this.expireCookie(cookieName);
            payload.tokenExpired = 1;
            url = (Number.isInteger(url)) ? CloudPagesURL(url,payload) : url +'?payload='+Platform.Function.Base64Encode(Platform.Function.Stringify(payload));
            Platform.Response.Redirect(url,false);
        }
    };

    /**
     * Expire a cookie.
     *
     * @param {string} cookieName The name of the cookie to expire.
     */
    this.expireCookie = function(cookieName) { Platform.Response.SetCookie(cookieName,"",new Date("Thu, 01 Jan 1970 00:00:00 GMT")); };

    /**
     * Expire cookie and redirect back to login.
     *
     * @param {string} [redirectUrl] An optional redirect URL as CloudPage ID or full URI
     */
    this.logout = function(redirectUrl) {
        this.expireCookie(this.settings.auth.cookieName);
        var payload = { origin: base64urlEscape(Platform.Function.Base64Encode(getPageUrl())) },
            url = (redirectUrl) ? (Number.isInteger(redirectUrl)) ? CloudPagesURL(redirectUrl,payload) : redirectUrl : (Number.isInteger(this.settings.cp.login)) ? CloudPagesURL(this.settings.cp.login,payload) : this.settings.cp.login +'?payload='+Platform.Function.Base64Encode(Platform.Function.Stringify(payload));

        Platform.Response.Redirect(url,false);
    };

    /**
     * Set a new cookie or overwrite an existing one.
     *
     * @param   {string}    cookieName  The name of the cookie.
     * @param   {string}    value       The content of the cookie.
     * @param   {number}    [expire]    Expiration time in seconds. By default 1 day.
     *
     */
    this.setCookie = function(cookieName,value,expire) {
        var e = (expire) ? expire : 60 * 60 * 24,
            expireDate = dateAdd(Platform.Function.SystemDateToLocalDate(Now()),e,"Seconds");

        debug('(setCookie)\n\tOK: Set cookie: '+cookieName);
        Platform.Response.SetCookie(cookieName,value,expireDate,true);
    };

    /**
     * NOTE: Depreciated
     * 
     * Validate the payload against QueryStringParameter.
     *
     * If QueryStringParameter was found it is save at runtime 
     * to cp.payload. E.g.: cp.payload.qs.subscriberKey.
     * 
     * @param {array}   data            An array of strings to be loaded.
     * @param {boolean} [isRequired]    Check if any of the given payload exists, if not redirect to the error page / redirectURL.
     * 
     * @return {object} The given payload
     */
    this.isPayload = function(data,isRequired) {
        for(var i = 0; i < data.length; i++) {
            var r = Request.GetQueryStringParameter(data[i]);
            if (!r) {
                if( isRequired === true ) {
                    this.redirectError({
                        errorCode: 400,
                        errorMessage: 'Invalid call - Access denied',
                        errorDebug: "Missing payload: "+data[i]
                    });
                }
            } else {
                this.payload.qs[data[i]] = r;
            }
        }
        return this.payload.qs;
    };


    /**
     * Validate the payload against QueryStringParameter.
     *
     * If QueryStringParameter was found it is save at runtime 
     * to cp.payload. E.g.: cp.payload.qs.subscriberKey.
     * 
     * @param {array}   data            An array of strings to be loaded.
     * @param {boolean} [isRequired]    Check if any of the given payload exists, if not redirect to the error page / redirectURL.
     * 
     * @return {object} The given payload
     */
    this.getParameter = function(data,isRequired) {
        for(var i = 0; i < data.length; i++) {
            var r = Request.GetQueryStringParameter(data[i]);
            if (!r) {
                if( isRequired === true ) {
                    this.redirectError({
                        errorCode: 400,
                        errorMessage: 'Invalid call - Access denied',
                        errorDebug: "Missing payload: "+data[i]
                    });
                }
            } else {
                this.payload.qs[data[i]] = r;
            }
        }
        return this.payload.qs;
    }

    /**
     * Get the payload from runtime
     * 
     * @param {string} [type]   Suported types are 'qs' or 'jwt'
     *                          If no type is provided, both objects will be returned
     * 
     * @return {object}         The payload
     */
    this.getPayload = function(type) {
        return (type && this.payload.hasOwnProperty(type)) ? this.payload[type] : this.payload;
    }

    /**
     * Get the payload from runtime
     * 
     * @param   {string}    token   A valid JWT token
     * @param   {string}    key     A symmetric key belonging to that MID Key Management
     * 
     * @return {boolean}
     */
    this.isTokenValid = function(token,key) {
        try {
            this.jwt.verify(token,key);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * Redirect to the error page or the given redirectUrl
     *
     * @param   {object}        [payload]               Data to pass to the error page.
     * @param   {string}        [payload.errorCode=500] The error code.
     * @param   {string}        [payload.errorMessage]  The message to be displayed to the customer.
     * @param   {string}        [payload.errorDebug]    If debug enabled, display in the console.
     */
    this.redirectError = function(payload) {
        payload.debugMode = debugMode;
        var url = (Number.isInteger(this.settings.cp.error)) ? CloudPagesURL(this.settings.cp.error,payload) : this.settings.cp.error +'?payload='+Platform.Function.Base64Encode(Platform.Function.Stringify(payload));

        Platform.Response.Redirect(url,false);
    };

    // function init
    if( auth && typeof auth == 'string' && auth == 'jwt') { this.authJWT(this.settings.keys.general.symmetric); } // backwards compatibility
    if( auth && typeof auth == 'object' && auth.hasOwnProperty('jwt')) { this.authJWT(auth.jwt); }

    if( auth && typeof auth == 'string' && auth == 'login') { this.authLogin(this.settings.keys.login.symmetric); } // backwards compatibility 
    if( auth && typeof auth == 'object' && auth.hasOwnProperty('login')) { this.authLogin(auth.login); }
}