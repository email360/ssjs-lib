<script runat="server" language="javascript">
    Platform.Load("Core", "1.1.5");
    Platform.Function.ContentBlockByKey('email360-ssjs-lib');

    // initiate cloudpage with general access
    var cp = new cloudpage();

    try{
        var qs = cp.payload.qs,
            settings = cp.settings,
            v = {};

        // load payload (all optional)
        cp.isPayload(['login','previousPage','tokenExpired']);

        // for security reason we fetch password outside the runtime storage of payload
        var password = Request.GetQueryStringParameter('password');

        // hit login button?
        if( qs.login && password ) {

            // verify login against the Data Extension
            if( SHA256(password) == Platform.Function.Lookup(settings.de.authUsers.Name,'password','username',qs.login) ) {
                var res = Platform.Function.ParseJSON(req.Response[0]),
                    payload = {
                        iss: getPageUrl(false), // issuer of the token
                        usr: qs.login
                    },
                    // generate token valid for 24h
                    token = cp.newToken(settings.auth.login,60*60*24,payload);

                // set cookie
                cp.setCookie(settings.auth.cookieName,token);

                // redirect to previous page
                Redirect((qs.previousPage) ? qs.previousPage : getPageUrl(false),false);

            // login failed
            } else {
                v.loginUser = qs.login;
                v.loginFailed = 1;
            }
        }

        v.tokenExpired = qs.tokenExpired;
        createAmpVariables(v);

        // output html
        Write(Platform.Function.ContentBlockByKey('email360-login-html'));

    } catch(e){
        // redirect error page
        cp.redirectError({
            errorCode: 500,
            errorDebug: Stringify(e)
        });
    }
</script>