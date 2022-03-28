/**
 * @copyright   [email360](https://www.email360.io/)
 * @author      [Sascha Huwald](https://www.linkedin.com/in/sascha-huwald/) 
 * @since       2020
 * @version     2.0.0
 * @license     [MIT](https://github.com/email360/ssjs-lib/blob/master/LICENSE)
 *
 * Collection of wrapper functions for the usage of JWT.
 * It is recommended to use DecryptSymmetric and EncryptSymmetric if you store a secret within SFMC.
 * @see [EncryptSymmetric](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/EncryptSymmetric.html|EncryptSymmetric)
 * @see [DecryptSymmetric](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/DecryptSymmetric.html)
 *
 * NOTE: This method is using the AMPScript function GetJWTByKeyName AND NOT GetJWT
 * Pleae ensure to use SFMC Key Management with a symetric password
 * @see [GetJWTByKeyName](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/GetJWTByKeyName.html) 
 * @see [GetJWT](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/GetJWT.html)
 * 
 * @example
 * // initialise a new jwt instance
 * var jwt = new jwt();
 *
 * // create a new jwt token
 * var token = jwt.encode("HS256","INT_PWD",{
 *      name: "John",
 *      role: "admin"
 *  });
 *
 * // create a new jwt token expires in 60 second
 * var token = jwt.encode("HS256","INT_PWD",{
 *      name: "John",
 *      role: "admin"
 *  },60);
 *
 * // create a new jwt token expires in 24 hours but only is active in 5 hours
 * var token = jwt.encode("HS256","INT_PWD",{
 *      name: "John",
 *      role: "admin"
 *  },60*60*24,60*60*5);
 *
 */
function jwt() {

    // Do we have a logger loaded? Keep it silence otherwise
    var log = log || new logger("jwt");

    /**
     * Decode a jwt token
     *
     * @param   {string}  token  A valid JWT token
     * @param   {string}  [key]  A symmetric key belonging to that MID Key Management to verify the token. If no key given the verification will not apply. 
     *                           BE AWARE: With no verification the integrety of the payload cannot be given.
     * @returns {object}         Returns the decoded payload
     */
    this.decode = function(token, key) {
        // verify token
        if (key) {
            this.verify(token,key);
        } else {
            log.warn("[jwt_decode] - No key given. Payload has not been verified and can not be trusted.");
        }
        // get payload
        return Platform.Function.ParseJSON(Platform.Function.Base64Decode(base64pad(token.split(".")[1])));
    };

    /**
     * Encode a jwt token
     *
     * @param   {string}  alg      Name of a JWT standard hash algorithm from among HS256, HS384, or HS512.
     * @param   {string}  key      A symmetric key belonging to the MID Key Management
     * @param   {object}  payload  The payload, typically a JSON object with name-value pairs. The payload isn't encrypted.
     * @param   {number}  [exp]    Expiration time in seconds.
     * @param   {number}  [nbf]    Defines when the token will be active in seconds. NBF must be smaller than EXP
     * @returns {string}           A new JWT token.
     */
    this.encode = function(alg, key, payload, exp, nbf) {

        // Check key
        if (!alg) {
            throw({message:"Require algorithm",code:400,method:"jwt_encode"});
        }

        // Check key
        if (!key) {
            throw({message:"Require key",code:400,method:"jwt_encode"});
        }

        // Check payload
        if (!isObject(payload)) {
            throw({message:"Require payload",code:400,method:"jwt_encode"});
        }

        // build payload
        payload.iat = getUnixTimestamp();

        // check nbf
        if (Number.isInteger(exp) && Number.isInteger(nbf) && nbf > exp)  { 
            throw({message:"nbf cannot be after expiration of the token",code:400,method:"jwt_encode"});
        }

        // add expire time
        if (exp && Number.isInteger(exp))  { 
            payload.exp = (getUnixTimestamp() + exp);
        }

        // add nbf
        if (Number.isInteger(nbf))  {
            payload.nbf = (getUnixTimestamp() + nbf);
        }

        // create JWT
        var token = GetJWTByKeyName(key,alg,Stringify(payload));
        log.trace("[jwt.encode] - JWT Token has been created: "+token);
        return token;
    };

    /**
     * Verify a jwt token
     *
     * @param   {string}   token  A valid JWT token
     * @param   {string}   key    The symmetric key of which the signature has been encrypted with
     * @returns {boolean}  
     */
    this.verify = function(token, key) {

        // check token
        if (!token) {
            throw({message:"No token was supplied",code:400,method:"jwt_verify"});
        }

        // check segments
        var segments = token.split(".");
        if (segments.length !== 3) {
            throw({message:"Token structure is invalid",code:400,method:"jwt_verify"});
        }

        // verify signature
        if (!this.verifySignature(token, key)) {
            throw({message:"Signature verification failed",code:401,method:"jwt_verify"});
        }

        // base64 decode and parse JSON
        var payload = Platform.Function.ParseJSON(Platform.Function.Base64Decode(base64pad(segments[1])));

        // Support for nbf and exp claims
        if (payload.nbf) {
            // check if nbf is in miliseconds or seconds
            var unixTimestamp = (String(payload.nbf).length == 13) ? getUnixTimestamp(true) : getUnixTimestamp();
            if (unixTimestamp < payload.nbf) {
                throw({message:"Token not yet active",code:400,method:"jwt_verify"});
            }
        }

        if (payload.exp) {
            // check if exp is in miliseconds or seconds
            var unixTimestamp = (String(payload.exp).length == 13) ? getUnixTimestamp(true) : getUnixTimestamp();
            if (unixTimestamp > payload.exp) {
                throw({message:"Token expired",code:400,method:"jwt_verify"});
            }
        }

        log.trace("[jwt.verify] - JWT Token has been verified");
        return true;
    };

    /**
     * Verify the JWT signature against a private secret
     *
     * @param   {string}   token  A valid JWT token
     * @param   {string}   key    The symmetric key of which the signature has been encrypted with
     * @returns {boolean}
     */
    this.verifySignature = function(token, key) {
        return (token.split(".")[2] === this.sign(token.split(".")[0], token.split(".")[1], key));
    };

    /**
     * Create a signature for a JWT token
     *
     * @param    {string}  header   The JWT header base64 encoded
     * @param    {string}  payload  The JWT payload base64 encoded
     * @param    {string}  key      A symmetric key belonging to that MID Key Management
     * @returns  {string}           The signature
     */
    this.sign = function(header, payload, key) {
        var p = Platform.Function.ParseJSON(Platform.Function.Base64Decode(base64pad(payload))),
            h = Platform.Function.ParseJSON(Platform.Function.Base64Decode(base64pad(header))),
            alg = h.alg,
            jwt = GetJWTByKeyName(key,alg,Stringify(p));

        // return signature
        return jwt.split(".")[2];
    };
}