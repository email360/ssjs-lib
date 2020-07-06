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
        cp.isPayload(['username','previousPage','tokenExpired','login']);

        // for security reason we fetch password outside the runtime storage of payload
        var password = Request.GetQueryStringParameter('password');

        // hit login button?
        if( qs.username && password ) {

            // verify login against the Data Extension
            if( SHA256(password) == Platform.Function.Lookup(settings.de.authUsers.Name,'password','username',qs.username) ) {
                var res = Platform.Function.ParseJSON(req.Response[0]),
                    payload = {
                        iss: getPageUrl(false), // issuer of the token
                        usr: qs.username
                    },
                    // generate token valid for 24h
                    token = cp.newToken(settings.auth.tokenKey,60*60*24,payload);

                // set cookie
                cp.setCookie(settings.auth.cookieName,token);

                // redirect to previous page
                Redirect((qs.previousPage) ? qs.previousPage : CloudPagesURL(settings.cp.login,{login:true}),false);

            // login failed
            } else {
                v.loginUser = qs.username;
                v.loginFailed = 1;
            }
        }

        v.tokenExpired = qs.tokenExpired;
        createAmpVariables(v);

    } catch(e){
        // redirect error page
        cp.redirectError({
            errorCode: 500,
            errorDebug: Stringify(e)
        });
    }
</script>

<!DOCTYPE html>
<html>

<head>
    <title>Login Page</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
    <style type="text/css">
    @import url('https://fonts.googleapis.com/css?family=Numans');

    html,
    body {
        background-image: url('https://images.pexels.com/photos/132037/pexels-photo-132037.jpeg');
        background-size: cover;
        background-repeat: no-repeat;
        height: 100%;
        font-family: 'Numans', sans-serif;
    }

    .container {
        height: 90%;
        align-content: center;
    }

    .card {
        height: auto;
        margin-top: auto;
        margin-bottom: auto;
        width: 400px;
        background-color: rgba(0, 0, 0, 0.5) !important;
    }


    .card-header h3 {
        color: white;
    }

    .input-group-prepend span {
        width: 50px;
        background-color: rgb(0, 163, 173);
        color: black;
        border: 0 !important;
    }

    input:focus {
        outline: 0 0 0 0 !important;
        box-shadow: 0 0 0 0 !important;

    }

    .login_btn {
        color: black;
        background-color: rgb(0, 163, 173);
        width: 100px;
    }

    .login_btn:hover {
        color: black;
        background-color: white;
    }
    </style>
</head>

<body>
    <div class="container">
        <div class="d-flex justify-content-center h-100">
            <div class="card">
                <div class="card-header">
                    <h3>Log In</h3>
                </div>
                <div class="card-body">

                    %%[IF @login == 1 THEN]%%
                        <div class="alert alert-success" role="alert">
                            Successfully logged in!
                        </div>
                    %%[ELSE]%%
                        <form action="#" method="POST">
                            %%[IF @loginFailed == 1 THEN]%%
                            <div class="alert alert-danger" role="alert">
                                Incorrect username or password!
                            </div>
                            %%[ELSEIF @tokenExpired == 1 THEN]%%
                            <div class="alert alert-danger" role="alert">
                                Session timeout - Please login again!
                            </div>
                            %%[ENDIF]%%
                            <div class="input-group form-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                                </div>
                                <input type="text" class="form-control" placeholder="email" name="username" value="%%=v(@loginUser)=%%" required>
                            </div>
                            <div class="input-group form-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"><i class="fas fa-key"></i></span>
                                </div>
                                <input type="password" class="form-control" placeholder="password" name="password" required>
                            </div>
                            <div class="form-group">
                                <input type="submit" value="Login" name="action" class="btn float-right login_btn">
                            </div>
                        </form>
                    %%[ENDIF]%%
                </div>
            </div>
        </div>
    </div>
</body>

</html>