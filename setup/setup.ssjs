<script runat="server" language="javascript">
    /**
     * @version 1.0.1
     */
    var version = "1.0.1"



    /* ================================================================================= */
    Platform.Load("Core", "1.1");


    // POLYFILL
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

    var console = new console(),
        nextStep = [],
        setup = {};

    try {
        
        // get post data
        var postData = getPostData() || {};

        // get optional get DATA
        var devMode = Request.GetQueryStringParameter("devMode");
        var loadTests = Request.GetQueryStringParameter("loadTests");

        // set prefix
        var prefix = postData.prefix || 'email360';
        var brand = decodeURI(postData.brand) || 'email360'

        // git base URL
        libBaseUrl = (devMode=="1") ? '' : 'https://raw.githubusercontent.com/email360/ssjs-lib/master/';

        // init wsproxy
        api = new Script.Util.WSProxy();

        // create setup
        var setup = {
            api: false,
            keys: [],
            credentials: null,
            login: {
                fromUser: false,
                username: "admin",
                password: createPassword(24)
            },
            cloudpages: {
                login: '%%=ContentBlockByKey("'+prefix+'-login-page")=%%',
                error: '%%=ContentBlockByKey("'+prefix+'-error-page")=%%'
            },
            hasErrors: false
        };

        // create settings
        var settings = {
            sfmcApi: {
                authBaseURI: "https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx.auth.marketingcloudapis.com/",
                restBaseURI: "https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx.rest.marketingcloudapis.com/",
                credentials: "xxxxxxx"
            },
            keys: {
                general: {
                    symmetric: prefix.toUpperCase()+"_INT_PWD",
                    vector: prefix.toUpperCase()+"_INT_IV",
                    salt: prefix.toUpperCase()+"_INT_SALT"
                },
                login: {
                    symmetric: prefix.toUpperCase()+"_LOGIN_PWD"
                }
            },
            cp: {
                login: 0,
                error: 0
            },
            auth: {
                cookieName: prefix.toLowerCase()+"_access_token",
                tokenKey: "login"
            },
            folderId: {},
            de: {}
        };
        

        if (postData.submit == 'Install') {
            Variable.SetValue("@install", 1);
            var output = "",
                libKeys = settings.keys.general

            // check if we have API credentials
            if (postData.clientId.length > 0 
                && postData.clientSecret.length > 0 
                && postData.authUrl.length > 0
                && postData.restUrl.length > 0 ) {

                var credentials = {
                        "grant_type":"client_credentials",
                        "client_id":postData.clientId,
                        "client_secret":postData.clientSecret
                    },
                    credentialsBase64 = Platform.Function.Base64Encode(Stringify(credentials));
                    

                // test API crendetials
                var req = httpRequest("POST", decodeURI(postData.authUrl) + "v2/token", "application/json", credentials);

                if (req.status == 200) {
                    var token = req.content.access_token;
                    setup.api = true;
                    settings.sfmcApi.authBaseURI = decodeURI(postData.authUrl);
                    settings.sfmcApi.restBaseURI = decodeURI(postData.restUrl);

                    // create credentials code
                    setup.credentials = 
                        '<code style="margin-left:20px;">%%=</code><br/>'
                        + '<code style="margin-left:40px;">EncryptSymmetric(</code><br/>'
                        + '<code style="margin-left:60px;">Base64Decode("'+credentialsBase64+'"),</code><br/>'
                        + '<code style="margin-left:60px;">"AES","'+libKeys.symmetric+'",@null,"'+libKeys.salt+'",@null,"'+libKeys.vector+'",@null</code><br/>'
                        + '<code style="margin-left:40px;">)</code><br/>'
                        + '<code style="margin-left:20px;">=%%</code>';
                }
            }

            // generate password, salt and IV for user
            setup.keys.push("Symmetric | "+[settings.keys.login.symmetric]+ " = " + createPassword(24));
            setup.keys.push("Symmetric | "+[libKeys.symmetric]+ " = " + createPassword(24));
            setup.keys.push("Salt | "+[libKeys.salt]+ " = " + createRandomBytes(8));
            setup.keys.push("Vector | "+[libKeys.vector]+ " = " + createRandomBytes(16));

            // set username and password
            setup.login.username = decodeURIComponent(decodeURIComponent(postData.username)) || setup.login.username;
            setup.login.password = decodeURIComponent(decodeURIComponent(postData.password)) || setup.login.password
            setup.login.fromUser = (postData.password != "" && postData.username != "");

            // start output
            output += '<hr><div><ul aria-label="Retrieve Folders:">';

            // get folder ids
            settings.folderId["Data Extensions"] = getFolderId({name: 'Data Extensions', type: 'dataextension' });
            settings.folderId["Query"] = getFolderId({name: 'Query', type: 'queryactivity' });
            settings.folderId["Scripts"] = getFolderId({name: 'Scripts', type: 'SSJSActivity' });
            settings.folderId["Content Builder"] = getFolderId({name: 'Content Builder', type: 'asset' });


            output += '</ul><ul aria-label="Create Folders:">';

            // create folder to hold all lib data
            settings.folderId['DataExtension '+brand] = createFolder(brand, 'dataextension', settings.folderId['Data Extensions']);
            settings.folderId['DataExtension SSJS Lib'] = createFolder('SSJS Lib', 'dataextension', settings.folderId['DataExtension '+brand]);
            settings.folderId['DataExtension Verion '+version] = createFolder("v"+version.replace(/\./g, ''), 'dataextension', settings.folderId['DataExtension SSJS Lib']);
            settings.folderId['Asset '+brand] = createFolder(brand,'asset', settings.folderId['Content Builder']);
            settings.folderId['Asset SSJS Lib'] = createFolder('SSJS Lib','asset', settings.folderId['Asset '+brand]);
            settings.folderId['Asset SSJS Lib Version '+version] = createFolder(version,'asset', settings.folderId['Asset SSJS Lib']);
            settings.folderId['Asset SSJS Lib Lib'] = createFolder('Lib','asset', settings.folderId['Asset SSJS Lib Version '+version]);
            settings.folderId['Asset SSJS Lib CloudPages'] = createFolder('CloudPages','asset', settings.folderId['Asset SSJS Lib Version '+version]);
            settings.folderId['Asset SSJS Lib CloudPages Login'] = createFolder('Login','asset', settings.folderId['Asset SSJS Lib CloudPages']);
            settings.folderId['Asset SSJS Lib CloudPages Error'] = createFolder('Error','asset', settings.folderId['Asset SSJS Lib CloudPages']);


            output += '</ul><ul aria-label="Create DataExtensions:">';

            // create DataExtensions
            settings.de["logError"] = createDataExtension('Log Error', [
                { "Name": "EventDate", "FieldType": "Date", "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "EventId", "FieldType": "Text", "MaxLength": 255, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "Message", "FieldType": "Text", "MaxLength": 4000, "IsRequired": true },
                { "Name": "Method", "FieldType": "Text", "MaxLength": 50, "IsRequired": true },
                { "Name": "SubscriberKey", "FieldType": "Text", "MaxLength": 254 },
                { "Name": "Source", "FieldType": "Text", "MaxLength": 4000 },
                { "Name": "SourceType", "FieldType": "Text", "MaxLength": 255 },
                { "Name": "JobId", "FieldType": "Number" },
                { "Name": "ListId", "FieldType": "Number" },
                { "Name": "BatchId", "FieldType": "Number" }
            ],settings.folderId['DataExtension Verion '+version]);
            settings.de["logger"] = createDataExtension('Logger', [
                { "Name": "date", "FieldType": "Date", "IsRequired": true },
                { "Name": "timestamp", "FieldType": "Text", "MaxLength": 25, "IsRequired": true, "IsPrimaryKey": true },
                { "Name": "id", "FieldType": "Text", "MaxLength": 255, "IsRequired": true, "IsPrimaryKey": true },
                { "Name": "message", "FieldType": "Text", "MaxLength": 4000, "IsRequired": true, "IsPrimaryKey": true },
                { "Name": "level", "FieldType": "Text", "MaxLength": 50, "IsRequired": true, "IsPrimaryKey": true },
                { "Name": "category", "FieldType": "Text", "MaxLength": 254, "IsRequired": true, "IsPrimaryKey": true },
                { "Name": "subscriberKey", "FieldType": "Text", "MaxLength": 254, "IsRequired": true, "IsPrimaryKey": true }
            ],settings.folderId['DataExtension Verion '+version]);
            settings.de["sfmcApiToken"] = createDataExtension('SFMC Api Token', [
                { "Name": "clientId", "FieldType": "Text", "MaxLength": 50, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "token", "FieldType": "Text", "MaxLength": 1000, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "expire", "FieldType": "Date" }
            ],settings.folderId['DataExtension Verion '+version]);
            settings.de["wsproxyCols"] = createDataExtension('WSProxy Cols', [
                { "Name": "ObjectType", "FieldType": "Text", "MaxLength": 50, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "Cols", "FieldType": "Text", "MaxLength": 4000, "IsRequired": true },
                { "Name": "Last Update", "FieldType": "Date", "IsRequired": true }
            ],settings.folderId['DataExtension Verion '+version]);
            settings.de["authUsers"] = createDataExtension('Auth Users', [
                { "Name": "Username", "FieldType": "Text", "MaxLength": 254, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "Password", "FieldType": "Text", "MaxLength": 500, "IsRequired": true },
            ],settings.folderId['DataExtension Verion '+version]);

            output += '</ul><ul aria-label="Add DataExtension Records:">';

            // add data to DE
            upsertDataExtensionRecords(settings.de["authUsers"],[{Username:setup.login.username,Password:SHA256(setup.login.password)}]);

            output += '</ul><ul aria-label="Create Content Blocks:">';

            // load library files from github
            var wrapper = '',
                files = {
                    polyfill:   libBaseUrl + 'core/lib_polyfill.ssjs',
                    amp:        libBaseUrl + 'core/lib_amp.ssjs',
                    logger:     libBaseUrl + 'core/lib_logger.ssjs',
                    core:       libBaseUrl + 'core/lib_core.ssjs',
                    sfmcapi:    libBaseUrl + 'core/lib_sfmcapi.ssjs',
                    wsproxy:    libBaseUrl + 'core/lib_wsproxy.ssjs',
                    cloudpage:  libBaseUrl + 'core/lib_cloudpage.ssjs',
                    einstein:   libBaseUrl + 'core/lib_einstein.ssjs',
                    jwt:        libBaseUrl + 'core/lib_jwt.ssjs'
                };
            
            // build main lib file wrapper
            for( var key in files ) {
                var customerKey = prefix.toLowerCase()+'-ssjs-lib-'+key+'-'+version,
                    url = files[key],
                    folder = settings.folderId['Asset SSJS Lib Lib'];

                createScriptContentBlock('SSJS Lib - '+key, customerKey, folder, files[key]);
                wrapper += "\tTreatAsContent(Concat('<script runat=\"server\" language=\"javascript\">',ContentBlockByKey('"+customerKey+"'),'<\/script>'));\n";
            }

            // create main lib file
            var content = "%%[\n\tTreatAsContent(Concat('<script runat=\"server\" language=\"javascript\">',ContentBlockByKey('"+prefix.toLowerCase()+"-ssjs-lib-settings-"+version+"'),'<\/script>'))\n"+wrapper+"]%%";
            createScriptContentBlock('SSJS Lib', prefix.toLowerCase()+'-ssjs-lib-'+version, settings.folderId['Asset SSJS Lib Version '+version], null, content);

            // create demo login page code
            createScriptContentBlock('Login Page', prefix.toLowerCase()+'-login-page-'+version, settings.folderId['Asset SSJS Lib CloudPages Login'], libBaseUrl+'sample/cloudpages/login/login.html');

            // create demo error page code
            createScriptContentBlock('Error Page', prefix.toLowerCase()+'-error-page-'+version, settings.folderId['Asset SSJS Lib CloudPages Error'], libBaseUrl+'sample/cloudpages/error/error.html');

            // create settings file
            var content = '\nfunction lib_settings() {\n\n'+ConvertObjectIndented(settings,'        ')+'\n}\n';
            createScriptContentBlock('SSJS Lib - settings', prefix.toLowerCase()+'-ssjs-lib-settings-'+version, settings.folderId['Asset SSJS Lib Lib'], null, content);

            // build main lib test file wrapper
            if (devMode == 1 && loadTests == 1) {
                output += '</ul><ul aria-label="Create Test Files:">';
                setupDev();
            }
            output += "</ul></div>";

        }

        // build next steps
        nextStep.push('<li class="fs-subtitle" align="left">Please add the following keys to the SFMC Key Management. The passwords can be changed but are generated for your convenient<br/><code style="margin-left:20px;">'+setup.keys.join('</code><br/><code style="margin-left:20px;">')+'</code></li>')

        if (!setup.api) {
            nextStep.push('<li class="fs-subtitle" align="left">Please create a server-2-server package and add the AUTH and REST URL to the content block SSJS Lib - settings</li>');      
        }
        if (setup.credentials) {
            nextStep.push('<li class="fs-subtitle" align="left">Please exectute the following code on a cloudpage and add the output to the API credentials part of the SSJS Lib - settings content block file: <br/><code>'+setup.credentials+'</code></li>');      
        } else {
            nextStep.push(
                '<li class="fs-subtitle" align="left">Please complete and execute the following code on a cloudpage and add the output to the API credentials part of the SSJS Lib - settings content block file:<br/>'
                + '<code style="margin-left:20px;">%%[</code><br/>'
                + '<code style="margin-left:40px;">SET @client_id = "==ADD YOUR CLIENT ID=="</code><br/>'
                + '<code style="margin-left:40px;">SET @client_secret = "==ADD YOUR CLIENT SECRET=="</code><br/>'
                + '<code style="margin-left:40px;">SET @credentials = Concat(\'{"grant_type":"client_credentials","client_id":"\',@client_id,\'","client_secret":"\',@client_secret,\'"}\')</code><br/>'
                + '<code style="margin-left:40px;">Output(EncryptSymmetric(@credentials,"AES","EMAIL360_INT_PWD",@null,"EMAIL360_INT_SALT",@null,"EMAIL360_INT_IV",@null))</code><br/>'
                + '<code style="margin-left:20px;">]%%</code>'
                + '</li>'
            );
        }
        if (!setup.login.fromUser) {
            nextStep.push(
                '<li class="fs-subtitle" align="left">Please use the following credentials to login on the Login Cloudpage:<br/>'
                + '<code style="margin-left:20px;">Username: '+setup.login.username+'</code><br/>'
                + '<code style="margin-left:20px;">Password: '+setup.login.password+'</code><br/>'
            );
        }
        nextStep.push(
            '<li class="fs-subtitle" align="left">Please create two Cloudpages and add one line of the following code. When finished, please add the CloudPage ID of each page to the SSJS Lib - settings Content Block under cp.login and cp.error <br/>'
            + '<code style="margin-left:20px;">'+setup.cloudpages.login+'</code><br/>'
            + '<code style="margin-left:20px;">'+setup.cloudpages.error+'</code><br/>'
        );

        nextStep = "<hr/><br/><ol>" + nextStep.join("") + "</ol>";

        Variable.SetValue("@output", output);
        Variable.SetValue("@nextSteps", nextStep);
        Variable.SetValue("@dev", devMode);
        Variable.SetValue("@hasErrors", setup.hasErrors);

    } catch(e) {
        Variable.SetValue("@install", 1);
        Variable.SetValue("@output", "Something went wrong, please check console");
        Variable.SetValue("@error", 1);
        Variable.SetValue("@hasErrors", 1);
        console.error(e);
    }


    function setupDev() {
        var folderName = 'Asset SSJS Lib Test';
        // create folder
        settings.folderId[folderName] = createFolder('Test','asset', settings.folderId['Asset SSJS Lib Version'+version]);

        libBaseUrl += 'test/tests/';
        var wrapper = '',
            folder = settings.folderId[folderName],
            files = {
                sfmcapi: [
                    libBaseUrl + 'sfmcapi.test.ssjs',
                    libBaseUrl + 'sfmcapi/getToken.test.ssjs',
                    libBaseUrl + 'sfmcapi/retrieveJourneys.test.ssjs',
                    libBaseUrl + 'sfmcapi/retrieveUserInfo.test.ssjs',
                    libBaseUrl + 'sfmcapi/retrieveUserInfoEnterpriseName.test.ssjs'
                ],
                polyfill: [
                    libBaseUrl + 'polyfill.test.ssjs'
                ],
                core: [
                    libBaseUrl + 'core.test.ssjs'
                ],
                logger: [
                    libBaseUrl + 'logger.test.ssjs'
                ],
                wsproxy: [
                    libBaseUrl + 'wsproxy.test.ssjs'
                ],
                amp: [
                    libBaseUrl + 'amp.test.ssjs'
                ],
                cloudpage: [
                    libBaseUrl + 'cloudpage.test.ssjs'
                ],
                einstein: [
                    libBaseUrl + 'einstein.test.ssjs'
                ],
                jwt: [
                    libBaseUrl + 'jwt.test.ssjs',
                    libBaseUrl + 'jwt/encode.test.ssjs'
                ]
            };

        for( var key in files ) {
            var name = prefix+' SSJS Lib Test - '+key,
                urls = files[key],
                customerKey = prefix.toLowerCase()+'-ssjs-lib-test-'+key,
                content = [];
                
            if (isScriptContentBlock(name)) {
                output += addOutput('Skip:\tCreate content block ['+ name +']');
                continue;
            }

            // merge all tests into one file 
            for (var i = 0; i < urls.length; i++) {
                var fileContent = getGitContent(urls[i]);
                if (fileContent) {
                    content.push(fileContent);
                }
            }
            if (content.length > 0) {
                content = content.join('\n\n')+'\n';
            }
            createScriptContentBlock(name, customerKey, folder, null, content);
            wrapper += "\tTreatAsContent(Concat('<script runat=\"server\" language=\"javascript\">',ContentBlockByKey('"+customerKey+"'),'<\/script>'));\n";
        }

        // create main test lib file
        createScriptContentBlock(prefix+' SSJS Lib Test', prefix.toLowerCase()+'-ssjs-lib-test', folder, null, "%%[\n"+wrapper+"]%%");
    }

    function getGitContent(url) {
        if (devMode == "1") {
            var payload = {
                    username : postData["dev.username"],
                    token    : postData["dev.token"],
                    repoName : postData["dev.repoName"],
                    url      : 'https://api.github.com/repos/'+ postData["dev.username"] + '/' + postData["dev.repoName"] + '/contents/' + url
                },
                res = getGitHubRepoContent(payload);
            if (res.status == 200 && res.content != null) {
                return res.content.replace(/%%prefix%%/gi, prefix).replace(/%%version%%/gi, version);
            } else {
                console.error('Error: getGitContent for URL ['+payload.url+'] failed',res);
                return null;
            }
        } else {
            var res = httpRequest('GET',url);
            if (res.status == 200 && res.content != null) {
                return res.content.replace(/%%prefix%%/gi, prefix).replace(/%%version%%/gi, version);
            } else {
                console.error('Error: getGitContent for URL ['+url+'] failed',res);
                return null;
            }
        }
    }

    function isScriptContentBlock(key) {
        var req = api.retrieve("Asset", ["*"], {
            Property: "CustomerKey",
            SimpleOperator: "equals",
            Value: key
        });

        if( req.Status == 'OK' && req.Results.length > 0 ) {
            return true;
        }

        return false;
    }    

    function createScriptContentBlock(name,key,parentFolder,url,content) {
        var isExits = isScriptContentBlock(key),
            message = 'Create content block ['+ name +']';

        if( isExits ) {
            var status = 'Skip';
        } else if (!url && !content) {
            var status = 'Error';
        } else {

            if (!content && url) {
                var content = getGitContent(url);
            } 
            if (content.length > 0) {
                var res = api.createItem("Asset", {
                        Name: name,
                        AssetType: {
                            Id: 220
                        },
                        Content: content,
                        ContentType: "text/html",
                        CustomerKey: key,
                        Category: {
                            Id: parentFolder
                        }
                    }),
                    status = res.Status;
                    if (status == "Error") {
                        console.error(status+': '+message,res);
                    }
            } else {
                var status = 'Error';
                console.error(status+': Could not pull content from GitHub for content block ['+ name +']');
            }
        }
        output += addOutput(status+':\t'+message);
    }

    function getGitHubRepoContent(obj) {
        var header = {
                "Authorization": "Bearer " + obj.token,
                "User-Agent": obj.username + '/' + obj.repoName,
                "Accept": "application/vnd.github.v3.raw",
                "Cache-Control": "no-cache"
            }

        return httpRequest("GET",obj.url,null,null,header);
    }    

    function ConvertObjectIndented(obj, indent) {
        var result = "";
        
        if (indent == null) {
            indent = "";  
        } 

        for (var property in obj) {
            var value = obj[property];
            
            if (typeof value == 'string') {
                value = '"' + value + '"';
            }
            else if (typeof value == 'object') {
                if (value instanceof Array) {
                    value = "[ " + value + " ]";
                }
                else {
                    var od = ConvertObjectIndented(value, indent + "    ");
                    value = "{\n" + od + "\n" + indent + "}";
                }
            }

            var prop = (indent == "        ") ? 'this.'+property+' = ' + value + ";\n" : '"' + property + '": ' + value + ",\n";
            result += indent + prop;
        }
        
        return result.replace(/,\n$/, "");
    }

    function getFolderId(data) {
        var f1 = { Property: 'Name', SimpleOperator: "equals", Value: data.name },
            f2 = { Property: 'ContentType', SimpleOperator: "equals", Value: data.type },
            res = api.retrieve("DataFolder", ['ID','ContentType'], { LeftOperand:f1, LogicalOperator: "AND", RightOperand: f2 }),
            id = res.Results[0].ID,
            message = 'Retrieve folder ID for ['+ data.name+']: ['+id+']';

        if (res.Status == 'Error') {
            console.error(status+': '+message,res);
        }
        output += addOutput(res.Status+':\t'+message);
        return id;
    }

    function createFolder(name,type,parentFolder) {
        var id = null,
            status = null,
            message = 'Create '+type+' folder: ['+ name + ']';

        // check if folder exists otherwise create
        var res = Folder.Retrieve({
            LeftOperand: {
                Property: "Name",
                SimpleOperator: "equals",
                Value: name
            },
            LogicalOperator: "AND",
            RightOperand: {
                LeftOperand: {
                    Property: "ParentFolder.ID",
                    SimpleOperator: "equals",
                    Value: parentFolder
                },
                LogicalOperator: "AND",
                RightOperand: {
                    Property: "ContentType",
                    SimpleOperator: "equals",
                    Value: type
                }
            }
        });

        if( res.length <= 0 ) {
            res = api.createItem("DataFolder", {
                Name: name,
                Description: 'Folder for all '+prefix+' SSJS Lib relevant data',
                ParentFolder: {
                    ID : parentFolder,
                    IDSpecified: true
                },
                ContentType: type,
                IsActive: true,
                IsEditable: true,
                AllowChildren: true
            });
            id = res.Results[0].NewID;
            status = res.Status;
        } else {
            id = res[0].ID;
            status = (id) ? 'Skip' : 'Error';
        }
        output += addOutput(status+':\t'+message);
        if (status == "Error") {
            console.error(status+': '+message,res);
        }
        return id;
    }

    function createDataExtension(name,fields,parentFolder) {
        var name = "SSJS Lib - "+name+" - "+"v"+version.replace(/\./g, '')+"_"+brand.replace(/ /g, ''),
            status = "Error",
            message = 'Create dataextension: ['+ name + ']';

        // check if dataextension exists otherwise create
        var res = retrieveDataExtension(name,parentFolder);
        if( res.Status == 'OK' && res.Results.length > 0 ) {
            status = "Skip";
        } else {
            res = api.createItem("DataExtension", {
                CustomerKey: Platform.Function.GUID().toUpperCase(),
                Name: name,
                CategoryID: parentFolder,
                Fields: fields
            });
            status = res.Status,
            res.Results[0].CustomerKey = res.Results[0].Object.CustomerKey;
        }
        if (status == "Error") {
            console.error(status+': '+message, res);
        }
        output += addOutput(status+':\t'+message);
        return {Name:name, Key:res.Results[0].CustomerKey};
    }    

    function retrieveDataExtension(name) {
        var req = api.retrieve("DataExtension", ['CustomerKey'], { 
            Property: "Name", 
            SimpleOperator: "equals", 
            Value: name 
        });
        return req;
    }

    function upsertDataExtensionRecords(deObject,data) {
        var options = {SaveOptions: [{PropertyName:'*',SaveAction: 'UpdateAdd'}]},
            customerKey = deObject.Key,
            name = deObject.Name,
            message = 'Upsert to DE: ['+name+']';


        // convert object into Name-Value pair
        var payload = [];
        for (var i = 0; i < data.length; i++) {
            var props = [];
            for(var k in data[i]) {
                props.push({Name:k, Value: data[i][k]});
            }
            payload.push({ CustomerKey: customerKey, Properties: props });
        }

        var res = api.updateBatch('DataExtensionObject', payload, options);

        if( res.Status == 'OK' ) {
            output += addOutput('OK:\t'+message+'. ['+data.length+'] record added');
        } else {
            output += addOutput('Error:\t'+message);
            console.error(res.Status+': '+message,res);
        }
    }

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
        if(typeof payload !== 'undefined' && payload !== null) { req.postData = Stringify(payload); }

        try {
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

    function getPostData() {
        // get form post data
        var postData = Platform.Function.ParseJSON(Platform.Request.GetPostData('utf-8'));
        if (postData && typeof postData != 'object' && postData.indexOf('&') !== -1) {
            var postArray = postData.split('&'),
                postObject = {};
            for (var i = 0; i < postArray.length; i++) {
                var key = postArray[i].split('=')[0],
                    value = postArray[i].split('=')[1];
                postObject[key] = value;
            }
            postData = postObject;
        }
        return postData;
    }

    function createPassword( len ) {
        var length = (len)?(len):(10);
        var string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
        var numeric = '0123456789';
        var punctuation = '!#$^&%@*';
        var password = "";
        var character = "";
        var crunch = true;
        while( password.length<length ) {
            entity1 = Math.ceil(string.length * Math.random()*Math.random());
            entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
            entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
            hold = string.charAt( entity1 );
            hold = (password.length%2==0)?(hold.toUpperCase()):(hold);
            character += hold;
            character += numeric.charAt( entity2 );
            character += punctuation.charAt( entity3 );
            password = character;
        }
        password=password.split('').sort(function(){return 0.5-Math.random()}).join('');
        return password.substring(0,len);
    }

    function createRandomBytes(len,format) {
        var format = format || "h",
            req = httpRequest('GET',"https://www.random.org/cgi-bin/randbyte?nbytes="+len+"&format="+format);
        return req.content.replace(" \n","").replace(/^\s+|\s+$/g,'');
    }

    function addOutput(message) {
        return '<li><pre>'+message+'</pre></li>';
    }

    function console() {

        this.log = function() {
            Write('<script>console.log.apply(console,' + Platform.Function.Stringify(Array.from(arguments)) + ')<\/script>');
        };
        this.error = function() {
            setup.hasErrors = 1;
            Write('<script>console.error.apply(console,' + Platform.Function.Stringify(Array.from(arguments)) + ')<\/script>');
        }
    }

    function SHA256(string,encoding) {
        var varName = '@amp__SHA256';

        // AMP decleration
        var amp = "\%\%[ ";
        // function open        
        amp += "set "+varName+" = SHA256(";
        // parameters
        amp += "'" + string + "'";
        if(encoding) {
            amp += "'" + encoding + "'";
        }
        // function close
        amp += ") ";
        // output
        amp += "output(concat("+varName+")) ";
        // end of AMP
        amp += "]\%\%";

        return Platform.Function.TreatAsContent(amp);
    }
</script>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <title>Install SSJS LIB</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
    <style type="text/css">
    @import url('https://fonts.googleapis.com/css?family=Numans');

    html,
    body {
        background-image: url('https://www.email360.io/img/hero-bg.7075aa29.jpg');
        background-size: cover;
        background-repeat: no-repeat;
        height: 100%;
        font-family: 'Numans', sans-serif;
    }

    .container {
        height: 90%;
        align-content: center;
    }

    .input-group-prepend span {
        width: 50px;
        background-color: #ffc451;
        color: black;
        border: 0 !important;
    }

    .inner {
        padding-top: 100px;
    }

    input:focus {
        outline: 0 0 0 0 !important;
        box-shadow: 0 0 0 0 !important;

    }

    /*form styles*/
    #ssjs_lib {
        text-align: center;
        position: relative;
        margin-top: 30px;
    }

    /*form styles*/
    #ssjs_lib div {
        text-align: left;
        font-size: 12px;
    }

    #ssjs_lib div ul:before {
        content:attr(aria-label);
        font-size:120%;
        font-weight:bold;
        margin-left:-15px;
    }

    #ssjs_lib div ul {
      list-style: none; /* Remove default bullets */
    }

    #ssjs_lib div ul pre {
      margin-bottom: 1px;
      font-size: 12px;
    }

    #ssjs_lib fieldset {
        background: white;
        border: 0 none;
        border-radius: 0px;
        box-shadow: 0 0 15px 1px rgba(0, 0, 0, 0.4);
        padding: 20px 30px;
        box-sizing: border-box;
        width: 80%;
        margin: 0 10%;

        /*stacking fieldsets above each other*/
        position: relative;
    }

    /*Hide all except first fieldset*/
    #ssjs_lib fieldset:not(:first-of-type) {
        display: none;
    }

    #ssjs_lib div.settings {
        display:grid;
        grid-template-columns: max-content max-content;
        grid-gap:5px;
    }
    #ssjs_lib div.settings label { 
        text-align:right; 
    }
    #ssjs_lib div.settings label:after { 
        content: ":"; 
    }

    /*inputs*/
    #ssjs_lib input,
    #ssjs_lib textarea {
        padding: 15px;
        border: 1px solid #ccc;
        border-radius: 0px;
        margin-bottom: 10px;
        width: 100%;
        box-sizing: border-box;
        font-family: Numans;
        color: #2C3E50;
        font-size: 13px;
    }

    #ssjs_lib input:focus,
    #ssjs_lib textarea:focus {
        -moz-box-shadow: none !important;
        -webkit-box-shadow: none !important;
        box-shadow: none !important;
        border: 1px solid #ffc451;
        outline-width: 0;
        transition: All 0.5s ease-in;
        -webkit-transition: All 0.5s ease-in;
        -moz-transition: All 0.5s ease-in;
        -o-transition: All 0.5s ease-in;
    }

    /*buttons*/
    #ssjs_lib .action-button {
        width: 125px;
        background: #ffc451;
        color: #151515;
        border: 0 none;
        border-radius: 4px;
        cursor: pointer;
        padding: 10px 24px;
        font-weight: bold;
    }


    #ssjs_lib .action-button:hover,
    #ssjs_lib .action-button:focus {
        box-shadow: 0 0 0 2px white, 0 0 0 3px #ffc451;
    }

    #ssjs_lib .action-button-previous {
        width: 100px;
        color: #151515;
        border: 0 none;
        border-radius: 4px;
        cursor: pointer;
        padding: 10px 24px;
        font-weight: bold;

    }

    #ssjs_lib .action-button-previous:hover,
    #ssjs_lib .action-button-previous:focus {
        box-shadow: 0 0 0 2px white, 0 0 0 3px #ffc451;
    }

    /*headings*/
    .fs-title {
        font-size: 18px;
        text-transform: uppercase;
        color: #2C3E50;
        margin-bottom: 10px;
        letter-spacing: 2px;
        font-weight: bold;
    }

    .fs-subtitle {
        font-weight: normal;
        font-size: 13px;
        color: #666;
        margin-bottom: 20px;
    }

    .fs-subtitle-output {
        font-weight: bold;
        text-decoration: underline;
        font-size: 14px;
        color: #666;
    }

    .overlay {
        height: 100%;
        width: 100%;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        display: none;
        background-color: rgb(0,0,0); /* Black fallback color */
        background-color: rgba(0,0,0, 0.6); /* Black w/opacity */
        overflow-x: hidden; /* Disable horizontal scroll */
      }
  
      .overlay-content {
        position: absolute;
        margin: auto;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 142px;
        height: 100px;
      }
  
      .loader {
          width: 45px;
          height: 45px;
          border: 5px solid #FFF;
          border-bottom-color: transparent;
          border-radius: 50%;
          display: inline-block;
          position: relative;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
          top: 8px;
          left: 1px;
  
      }
  
      .loader::after {
          content: '';
          position: absolute;
          box-sizing: border-box;
          top: 30px;
          left: 1px;
          border: 7px solid transparent;
          border-right-color: #FFF;
          transform: rotate(225deg);
      }
  
      .loader:before {
          content: "";
          position: absolute;
          left: 50%;
          top: 45%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
  
      }
  
      @keyframes rotation {
          100% {
              transform: rotate(0deg);
          }
  
          0% {
              transform: rotate(360deg);
          }
  
      }
  
      .logo {
          color: #FFF;
          display: inline-block;
          position: relative;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 40px;
          background-repeat: no-repeat;
          background-image: url("https://raw.githubusercontent.com/email360/ssjs-lib/master/setup/envelope.png");
          background-size: 22px 22px;
          background-position-x: 138px;
          background-position-y: 18px;
      }
  
      .logo-o {
          color: rgb(255, 197, 80);
          font-family: 'Dosis', sans-serif;
      }

    </style>
    <link href="https://fonts.googleapis.com/css2?family=Dosis:wght@200;300&display=swap" rel="stylesheet" />
    <link rel="icon" href="https://www.email360.io/favicon.ico">
</head>

<body>
    <div id="process" class="overlay">
      <div class="overlay-content">
        <div class="row">
            <span class="logo"><span class="logo-o">email</span>36<span class="loader"></span></span>
        </div>
      </div>
    </div>
    <header class="fixed-top" style="background: rgba(0, 0, 0, 0.5);">
        <div class="container">
            <nav class="navbar navbar-dark navbar-expand-lg">
                <a href="https://www.email360.io" target="_blank">
                    <img src="https://www.email360.io/img/logo.c977298e.png" alt="Email 360" width="150" class="" />
                </a>
            </nav>
        </div>
    </header>
    <div class="container">
        <div class="row">
            <div class="col"></div>
            <div class="inner col-md-10">
                %%[ IF @install == 1 THEN ]%%
                <form id="ssjs_lib" action="#" method="POST">
                    <fieldset>
                        <center><h2 class="fs-title">Installation Results %%[ IF @dev == 1 THEN ]%%(Dev Mode)%%[ ENDIF ]%%</h2></center>
                        %%=v(@output)=%%
                        <input type="button" name="next" class="next action-button" value="Final Steps" />
                    </fieldset>
                    <fieldset>
                    %%[ IF @hasErrors != 1 THEN ]%%
                        <h2 class="fs-title">Installation was successful!</h2>
                        <h3 class="fs-subtitle">In order to complete the setup, please action the following steps</h3>
                        %%=v(@nextSteps)=%%
                    %%[ ELSE ]%%
                        <h2 class="fs-title">Installation was not completed!</h2>
                        <hr/>
                        <br/>
                        <p>Something went wrong. Please review your browser console for further informations.</p>
                        <p>If you believe this is a bug, please post it on our <a href="https://github.com/email360/ssjs-lib" target="_blank">github</a></p>
                    %%[ ENDIF ]%%
                    </fieldset>
                </form>
                %%[ ELSE ]%%
                                <form id="ssjs_lib" action="#" method="POST">
                    <fieldset>
                        <h2 class="fs-title">email360 SSJS Lib - Install Wizard %%[ IF @dev == 1 THEN ]%%(Dev Mode)%%[ ENDIF ]%%</h2>
                        <h3 class="fs-subtitle">Setup the SSJS Lib on this SFMC Instance</h3>
                        <hr/><br/><p class="fs-subtitle">Welcome to install the SSJS, a free, open-source library that takes learnings from years of working with server-side Javascript and merges it in one library.</p><p class="fs-subtitle">It takes the repetitive and complex tasks and simplifies them, enabling you to get the most out of Salesforce Marketing Cloud.</p><br/>
                        <input type="button" name="next" class="next action-button" value="Start" />
                    </fieldset>
                    <fieldset>
                        <h2 class="fs-title">Brand Setup (Optional)</h2>
                        <h3 class="fs-subtitle">General settings of the Library</h3>
                        <br/>
                        <p class="fs-subtitle" align="left">The brand defines the parent folder for DataExtension and ContentBuilder in which the library will resign. By default this will be email360. DataExtension Folder name restriction apply</p>
                        <input type="text" name="brand" placeholder="Company name (No special charachters allowed ./()[]:| default: email360)" />
                        <br/><br/><br/>
                        <p class="fs-subtitle" align="left">The prefix which will be used for naming and reference in code. By default it will be email360</p>
                        <input type="text" name="prefix" placeholder="Prefix (default: email360)" maxlength=10 />
                        <br/>
                        <input type="button" name="previous" class="previous action-button-previous" value="Previous" />                                                
                        <input type="button" name="next" class="next action-button" value="Next" />
                    </fieldset>
                    <fieldset>
                        <h2 class="fs-title">API Setup (Optional)</h2>
                        <h3 class="fs-subtitle">Please use a server-2-server package and enable all permissions.<br /> This will enable the full functionality of the SSJS Library.</h3>
                        <input type="text" name="authUrl" placeholder="Auth Base URI" />
                        <input type="text" name="restUrl" placeholder="Rest Base URI" />
                        <input type="text" name="clientId" placeholder="Client Id" />
                        <input type="password" name="clientSecret" placeholder="Client Secret" />
                        %%[ IF @dev == 1 THEN ]%%
                            <h3 class="fs-subtitle"><br/>Dev mode enabled - load from private git</h3>
                            <input type="text" name="dev.username" placeholder="GIT name"/>
                            <input type="text" name="dev.token" placeholder="token"/>
                            <input type="text" name="dev.repoName" placeholder="Repo Name" />
                        %%[ ENDIF ]%%
                        <input type="button" name="previous" class="previous action-button-previous" value="Previous" />                                                
                        <input type="button" name="next" class="next action-button" value="Next" />
                    </fieldset>
                    <fieldset>
                        <h2 class="fs-title">Create a Login (Optional)</h2>
                        <h3 class="fs-subtitle">This login is used for the default Login page. It can be changed in the respective DE at anytime.</h3>
                        <input type="text" name="username" placeholder="Username" />
                        <input name="password" type="password" placeholder="Enter Password" />
                        <input type="button" name="previous" class="previous action-button-previous" value="Previous" />
                        <input type="submit" id="submit" name="submit" class="submit action-button" style="background-color:lightgreen;" value="Install" />
                    </fieldset>
                </form>
                %%[ ENDIF ]%%
            </div>
            <div class="col"></div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.3/jquery.easing.min.js'></script>
    <script type="text/javascript">
    $(function() {
        $('form[id="ssjs_lib"]').submit(function(e) {
            document.getElementById("process").style.display = "block";

            const password = $('input[name="password"]');
            password.val(encodeURIComponent(password.val()));

            const username = $('input[name="username"]');
            username.val(encodeURIComponent(username.val()));

        });
    });
    </script>
    <script type="text/javascript">
    var current_fs, next_fs, previous_fs; //fieldsets
    var left, opacity, scale; //fieldset properties which we will animate
    var animating; //flag to prevent quick multi-click glitches

    $(".next").click(function() {
        if (animating) return false;
        animating = true;

        current_fs = $(this).parent();
        next_fs = $(this).parent().next();

        //activate next step on progressbar using the index of next_fs
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

        //show the next fieldset
        next_fs.show();
        //hide the current fieldset with style
        current_fs.animate({ opacity: 0 }, {
            step: function(now, mx) {
                //as the opacity of current_fs reduces to 0 - stored in "now"
                //1. scale current_fs down to 80%
                scale = 1 - (1 - now) * 0.2;
                //2. bring next_fs from the right(50%)
                left = (now * 50) + "%";
                //3. increase opacity of next_fs to 1 as it moves in
                opacity = 1 - now;
                current_fs.css({
                    'transform': 'scale(' + scale + ')',
                    'position': 'absolute'
                });
                next_fs.css({ 'left': left, 'opacity': opacity });
            },
            duration: 800,
            complete: function() {
                current_fs.hide();
                animating = false;
            },
            //this comes from the custom easing plugin
            easing: 'easeInOutBack'
        });
    });

    $(".previous").click(function() {
        if (animating) return false;
        animating = true;

        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        //de-activate current step on progressbar
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

        //show the previous fieldset
        previous_fs.show();
        //hide the current fieldset with style
        current_fs.animate({ opacity: 0 }, {
            step: function(now, mx) {
                //as the opacity of current_fs reduces to 0 - stored in "now"
                //1. scale previous_fs from 80% to 100%
                scale = 0.8 + (1 - now) * 0.2;
                //2. take current_fs to the right(50%) - from 0%
                left = ((1 - now) * 50) + "%";
                //3. increase opacity of previous_fs to 1 as it moves in
                opacity = 1 - now;
                current_fs.css({ 'left': left });
                previous_fs.css({ 'transform': 'scale(' + scale + ')', 'opacity': opacity });
            },
            duration: 800,
            complete: function() {
                current_fs.hide();
                animating = false;
            },
            //this comes from the custom easing plugin
            easing: 'easeInOutBack'
        });
    });
    </script>
</body>

</html>
