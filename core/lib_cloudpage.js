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
     * Copyright:       {@link https://www.email360.io/|email360}
     * <br>Author:      {@link https://www.linkedin.com/in/sascha-huwald/|Sascha Huwald}
     * <br>Since:       2020
     * <br>Version:     1.0.0
     * <br>License:     MIT
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
     * // initialise a new cloudpage instance with a jwt token requirement
     * var cp = new cloudpage('jwt');
     */
    function cloudpage(auth,setting) {
        this.settings = _updateSettings(setting);

        /** Holds the payload for each call */
        this.payload = { qs:{}, jwt:{} };
        jsonBody = Platform.Function.ParseJSON(Platform.Request.GetPostData('utf-8'));
        this.payload.qs = (isObject(jsonBody)) ? jsonBody : {};

        /**
         * Wrapper to use for JWT authentication. 
         * 
         * Requires a JWT token as a request parameter either as POST or GET.
         * If token is invalid or not given, a redirect to the error page
         * will occur. Required parameter name: 'jwt'
         *
         * NOTE: JWT token cannot be used in conjunction with CloudPagesURL as 
         * the function cannot handle "=" characters which are used as padding
         * in a base64 encoded string. Use a standard GET URL parameter instead.
         */
        this.authToken = function() {
            // validate and set the query string payload
            this.isPayload(['jwt']);

            var token = this.payload.qs.jwt,
                access = false;

            if( token ) {
                if( this.isTokenValid(token) ) {
                    access = true;
                }
            }
            if( !access ) {
                this.redirectError({
                    errorCode: 403,
                    errorMessage: 'Authentication failed - Access denied',
                    errorDebug: 'Token: '+ Platform.Function.Stringify(token)
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
        this.authLogin = function() {
            var cookieName = this.settings.auth.cookieName,
                payload = { origin: Platform.Function.Base64Encode(getPageUrl()).replace(/=/gi, '@') },
                url = this.settings.cp.login;

            debug('(authLogin)\n\tRetrieve cookie: '+cookieName);
            token = Platform.Request.GetCookieValue(cookieName);

            // no cookie found > redirect to login
            if( !token || token == "" ) {
                url = (Number.isInteger(url)) ? CloudPagesURL(url,payload) : url +'?payload='+Platform.Function.Base64Encode(Platform.Function.Stringify(payload));
                Platform.Response.Redirect(url,false);

            // cookie is not valid - destory
            } else if( !this.isTokenValid(token) ) {
                this.expireCookie(cookieName);
                payload.tokenExpired = 1;
                url = (Number.isInteger(url)) ? CloudPagesURL(url,payload) : url +'?payload='+Platform.Function.Base64Encode(Platform.Function.Stringify(payload));
                Platform.Response.Redirect(url,false);
            }
            debug('(authLogin)\n\tOK: Logged in successfully');
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
            var payload = { origin: Platform.Function.Base64Encode(getPageUrl()).replace(/=/gi, '@') },
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
         * Validate the payload against QueryStringParameter.
         *
         * If QueryStringParameter was found it is save at runtime 
         * to cp.payload. E.g.: cp.payload.qs.subscriberKey.
         * 
         * @param {array}   data            An array of strings to be loaded.
         * @param {boolean} [isRequired]    Check if any of the given payload exists, if not redirect to the error page / redirectURL.
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
        };

        /**
         * Generate a new JWT token.
         * 
         * @param   {string}    pid             Page ID (KEY) inside the Authentication DataExtension to fetch the salt.
         * @param   {number}    [expire]        Expiration time in seconds.
         * @param   {object}    [payload]       Additional payload added to the token.
         * @param   {array}     [access]        Array of full website URI's to have access to. If not given, the new token will 
         *                                      have access to all page protected by JWT.
         * @returns  {string}    A new JWT token.
         */
        this.newToken = function(pid,expire,payload,access) {
            var payload = (payload && isObject(payload)) ? payload : {},
                header = { alg: "HS256", typ: "JWT" };

            payload.pid = pid;
            payload.iat = getUnixTimestamp();

            if( expire )  { 
                payload.exp = (getUnixTimestamp() + expire);
            }

            if( access && Array.isArray(access) ) {
                for (var i = 0; i < access.length; i++) {
                    access[i] = Platform.Function.MD5(access[i].split('?')[0]);
                }
                payload.acs = access;
            }

            var secret = Platform.Function.Lookup(this.settings.de.authentication.Name, 'value', 'key', pid);
            if( secret === null ) {
                debug( '(newToken)\n\tError while generating new token');
                throw 'Cannot find pid: '+pid+' inside '+this.settings.de.authentication.Name;
            }

            var signature = SHA256(
                Platform.Function.Base64Encode(Platform.Function.Stringify(header)) +
                Platform.Function.Base64Encode(Platform.Function.Stringify(payload)) +
                secret
            );

            var token = Platform.Function.Base64Encode(Platform.Function.Stringify(header))+'.'+Platform.Function.Base64Encode(Platform.Function.Stringify(payload))+'.'+signature;
            debug('(newToken)\n\tOK: Token created: '+token);
            return token;
        };

        /**
         * Decode a JWT token from base64.
         *
         * @param {string} token The token itself to decode.
         *
         * @returns {object} JWT Header, payload and signature.
         */
        this.readToken = function(token) {
            if( !token || typeof token !== 'string' ) {
                debug( '(readToken) No token given');
                return null;
            }
            var parts = token.split('.');
            if( parts.length != 3 ) {
                debug( '(readToken) Wrong token format');
                return null;
            }
            try{
                return {
                    header: Platform.Function.ParseJSON(Platform.Function.Base64Decode(parts[0])),
                    payload: Platform.Function.ParseJSON(Platform.Function.Base64Decode(parts[1])),
                    signature: parts[2]
                };
            } catch(e) {
                debug( '(readToken) Error while reading token');
                return null;
            }
        };

        /**
         * Validate a JWT token signature
         *
         * @param {string} token The JWT token to validate.
         *
         * @returns  {boolean}
         * 
         */
        this.isTokenValid = function(token) {
            var t = this.readToken(token);

            // already expired ?
            if( (t.payload.exp && getUnixTimestamp() > t.payload.exp) || !t ) {
                debug('(isTokenValid) Token expired');
                return false;
            }

            // access granted for given page?
            if( t.payload.iss != CloudPagesURL(this.settings.cp.login) && t.payload.acs ) {
                if(!((Array.isArray(t.payload.acs)) ? t.payload.acs.includes(Platform.Function.MD5(getPageUrl(false))) : t.payload.acs == Platform.Function.MD5(getPageUrl(false)))) {
                    debug('(isTokenValid) Access to page not allowed');
                    return false;
                }
            }

            var s = SHA256(
                    token.split('.')[0] + 
                    token.split('.')[1] +
                    Platform.Function.Lookup(this.settings.de.authentication.Name, 'value', 'key', t.payload.pid)
                );

            // save token data to runtime
            this.payload.jwt = t.payload;
            this.payload.role = t.payload.rol;

            // token valid?
            if(s != t.signature){
                debug('(isTokenValid) Token signature invalid');
                return false;
            }
            return true;
        };

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
        if( auth == 'jwt' ) { this.authToken(); }
        if( auth == 'login' ) { this.authLogin(); }

    }
    
</script>