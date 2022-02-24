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
     * Collection of wrapper functions for the usage of JWT.
     * It is recommended to use DecryptSymmetric and EncryptSymmetric if you store a secret within SFMC.
     * @see {@link https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/EncryptSymmetric.html|EncryptSymmetric}
     * @see {@link https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/DecryptSymmetric.html|DecryptSymmetric}
     *
     * NOTE: This method is using the AMPScript function GetJWT AND NOT GetJWTByKeyName
     * This allow greater flexability in the usecase but adds responsability of good key management 
     * to the developer.
     * @see {@link https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/GetJWTByKeyName.html|GetJWTByKeyName} 
     * @see {@link https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/GetJWT.html|GetJWT} 
     * 
     * @example
     * // initialise a new jwt instance
     * var jwt = new jwt();
     *
     * // create a new jwt token
     * var key = DecryptSymmetric('myEncryptedKeyWithAES', 'AES', INT_PW, null, 'INT_SALT', null, 'INT_VECTOR')
     * var token = jwt.encode({
     *      name: 'John',
     *      role: 'admin'
     *  },key);
     *
     * // create a new jwt token expires in 60 second
     * var key = DecryptSymmetric('myEncryptedKeyWithAES', 'AES', INT_PW, null, 'INT_SALT', null, 'INT_VECTOR')
     * var token = jwt.encode({
     *      name: 'John',
     *      role: 'admin'
     *  },key,60);
     *
     * // create a new jwt token expires in 24 hours but only is active in 5 hours
     * var key = DecryptSymmetric('myEncryptedKeyWithAES', 'AES', INT_PW, null, 'INT_SALT', null, 'INT_VECTOR')
     * var token = jwt.encode({
     *      name: 'John',
     *      role: 'admin'
     *  },key,60*60*24,60*60*5);
     *
     * // create a new jwt token expires in 24 hours but only is active in 5 hours and only works for the cloudpage https://***.sfmc-content.com/someCloudPage
     * var key = DecryptSymmetric('myEncryptedKeyWithAES', 'AES', INT_PW, null, 'INT_SALT', null, 'INT_VECTOR')
     * var token = jwt.encode({
     *      name: 'John',
     *      role: 'admin'
     *  },key,60*60*24,60*60*5,['https://***.sfmc-content.com/someCloudPage']);
     */
    function jwt() {

        /**
         * Decode a jwt token
         *
         * @param   {string}    token       A valid JWT token
         * @param   {string}    [key]       The private key to verify the token. If no key given
         *                                  verification will not apply. Be sure to KNOW WHAT ARE YOU DOING 
         *                                  because not verify the signature means you can't be sure that 
         *                                  someone hasn't modified the token payload
         *
         * @returns  {object}   Returns the decoded payload
         */
        this.decode = function(token, key) {

            // verify token
            if (key) {
                this.verify(token,key);
            } else {
                debug('jwt_decode\n\tWARNING: Payload has not been verified and can not be trusted.');
            }

            // get payload
            return Platform.Function.ParseJSON(Platform.Function.Base64Decode(base64pad(token.split('.')[1])));
        };

        /**
         * Encode a jwt token
         *
         * @param   {string}    alg             Name of a JWT standard hash algorithm from among HS256, HS384, or HS512.
         * @param   {string}    key             The private key to sign the token
         * @param   {object}    payload         The payload, typically a JSON object with name-value pairs. The payload isn't encrypted.
         * @param   {number}    [exp]           Expiration time in seconds.
         * @param   {number}    [nbf]           Defines when the token will be active in seconds.
         *                                      NBF must be smaller than EXP
         * @param   {array}     [acs]           Array of full website URI's to have access to. If not given, the new token will 
         *                                      have access to all page protected by any JWT.
         *
         * @returns  {string}    A new JWT token.
         */
        this.encode = function(alg, key, payload, exp, nbf, acs) {

            // Check key
            if (!alg) {
                throw({message:'Require algorithm',code:400,method:'jwt_encode'});
            }

            // Check key
            if (!key) {
                throw({message:'Require key',code:400,method:'jwt_encode'});
            }

            // Check payload
            if (!isObject(payload)) {
                throw({message:'Require payload',code:400,method:'jwt_encode'});
            }

            // build payload
            payload.iat = getUnixTimestamp();

            // check nbf
            if (Number.isInteger(exp) && Number.isInteger(nbf) && nbf > exp)  { 
                throw({message:'nbf cannot be after expiration of the token',code:400,method:'jwt_encode'});
            }

            // add expire time
            if (exp && Number.isInteger(exp))  { 
                payload.exp = (getUnixTimestamp() + exp);
            }

            // add nbf
            if (Number.isInteger(nbf))  {
                payload.nbf = (getUnixTimestamp() + nbf);
            }

            // add access
            if( acs && Array.isArray(acs) && acs.length > 0) {
                payload.acs = [];
                for (var i = 0; i < acs.length; i++) {
                    payload.acs.push(Platform.Function.MD5(acs[i].split('?')[0]));
                }
            }

            // create JWT
            return GetJWT(key,alg,Stringify(payload));
        };

        /**
         * Verify a jwt token
         *
         * @param   {string}    token   A valid JWT token
         * @param   {string}    key     The private key to sign the token
         *
         * @returns  {boolean}
         */
        this.verify = function(token, key) {

            // check token
            if (!token) {
                throw({message:'No token was supplied',code:400,method:'jwt_verify'});
            }

            // check segments
            var segments = token.split('.');
            if (segments.length !== 3) {
                throw({message:'Token structure is invalid',code:400,method:'jwt_verify'});
            }

            // verify signature
            if (!this.verifySignature(token, key)) {
                throw({message:'Signature verification failed',code:401,method:'jwt_verify'});
            }

            // base64 decode and parse JSON
            var payload = Platform.Function.ParseJSON(Platform.Function.Base64Decode(base64pad(segments[1])));

            // Support for nbf and exp claims
            if (payload.nbf) {
                // check if nbf is in miliseconds or seconds
                var unixTimestamp = (String(payload.nbf).length == 13) ? getUnixTimestamp(true) : getUnixTimestamp();
                if (unixTimestamp < payload.nbf) {
                    throw({message:'Token not yet active',code:400,method:'jwt_verify'});
                }
            }

            if (payload.exp) {
                // check if exp is in miliseconds or seconds
                var unixTimestamp = (String(payload.exp).length == 13) ? getUnixTimestamp(true) : getUnixTimestamp();
                if (unixTimestamp > payload.exp) {
                    throw({message:'Token expired',code:400,method:'jwt_verify'});
                }
            }

            // access granted for given page
            if(payload.acs && !((Array.isArray(payload.acs)) ? payload.acs.includes(Platform.Function.MD5(getPageUrl(false))) : payload.acs == Platform.Function.MD5(getPageUrl(false)))) {
                throw({message:'Access to page not allowed',code:401,method:'jwt_verify'});
            }

            return true;
        };

        /**
         * verify the jwt signature against a private secret
         *
         * @param   {string}    token   A valid JWT token
         * @param   {string}    key     The private key to sign the token
         *
         * @returns  {boolean}
         */
        this.verifySignature = function(token, key) {
            return (token.split('.')[2] === this.sign(token.split('.')[0], token.split('.')[1], key));
        };

        /**
         * Create a signature for a jwt token
         *
         * @param   {string}    header      The JWT header base64 encoded
         * @param   {string}    payload     The JWT payload base64 encoded
         * @param   {string}    key         The private secret to sign the token
         *
         * @returns  {string}   The signature
         */
        this.sign = function(header, payload, key) {
            var p = Platform.Function.ParseJSON(Platform.Function.Base64Decode(base64pad(payload))),
                h = Platform.Function.ParseJSON(Platform.Function.Base64Decode(base64pad(header))),
                alg = h.alg,
                jwt = GetJWT(key,alg,Stringify(p));

            // return signature
            return jwt.split('.')[2];
        };

    }

</script>