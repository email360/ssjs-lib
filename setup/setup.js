<script runat="server" language="javascript">
    Platform.Load("Core", "1.1.5");
    Write('<pre>');

    try {
        var api = new Script.Util.WSProxy(),
            settings = {};

        // get folder ids
        settings.folderId = {};
        settings.folderId['Data Extensions'] = getFolderId({name: 'Data Extensions', type: 'dataextension' });
        settings.folderId.Query = getFolderId({name: 'Query', type: 'queryactivity' });
        settings.folderId.Scripts = getFolderId({name: 'Scripts', type: 'SSJSActivity' });
        settings.folderId['Content Builder'] = getFolderId({name: 'Content Builder', type: 'asset' });

        // create folder to hold all lib data
        settings.folderId['DataExtension SSJS Lib'] = createFolder('Email360 SSJS Lib', 'dataextension', settings.folderId['Data Extensions']);
        settings.folderId['Asset SSJS Lib'] = createFolder('Email360 SSJS Lib','asset', settings.folderId['Content Builder']);
        settings.folderId['Asset SSJS Lib Core'] = createFolder('Core','asset', settings.folderId['Asset SSJS Lib']);
        settings.folderId['Asset SSJS Lib CloudPages'] = createFolder('CloudPages','asset', settings.folderId['Asset SSJS Lib']);
        settings.folderId['Asset SSJS Lib CloudPages Login'] = createFolder('Login','asset', settings.folderId['Asset SSJS Lib CloudPages']);
        settings.folderId['Asset SSJS Lib CloudPages Error'] = createFolder('Error','asset', settings.folderId['Asset SSJS Lib CloudPages']);
        
        // create DataExtensions
        settings.de = {};
        settings.de.logWarning = createDataExtension('Log Warning', [
                { "Name": "EventDate", "FieldType": "Date", "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "EventId", "FieldType": "Text", "MaxLength": 254, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "Message", "FieldType": "Text", "MaxLength": 4000, "IsRequired": true },
                { "Name": "Method", "FieldType": "Text", "MaxLength": 50, "IsRequired": true },
                { "Name": "SubscriberKey", "FieldType": "Text", "MaxLength": 254 },
                { "Name": "Source", "FieldType": "Text", "MaxLength": 4000 },
                { "Name": "SourceType", "FieldType": "Text", "MaxLength": 255 },
                { "Name": "JobId", "FieldType": "Number" },
                { "Name": "ListId", "FieldType": "Number" },
                { "Name": "BatchId", "FieldType": "Number" }
            ]);
        settings.de.logError = createDataExtension('Log Error', [
                { "Name": "EventDate", "FieldType": "Date", "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "EventId", "FieldType": "Text", "MaxLength": 255, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "Message", "FieldType": "Text", "MaxLength": 4000, "IsRequired": true },
                { "Name": "Method", "FieldType": "Text", "MaxLength": 50, "IsRequired": true },
                { "Name": "SubscriberKey", "FieldType": "Text", "MaxLength": 254 },
                { "Name": "Source", "FieldType": "Text", "MaxLength": 4000 },
                { "Name": "SourceType", "FieldType": "Text", "MaxLength": 255 },
                { "Name": "JobId", "FieldType": "Number" },
                { "Name": "ListId", "FieldType": "Number" },
                { "Name": "BatchId", "FieldType": "Number" },
                { "Name": "Impersonator", "FieldType": "Text", "MaxLength": 255 },
            ]);
        settings.de.authentication = createDataExtension('Authentication', [
                { "Name": "key", "FieldType": "Text", "MaxLength": 255, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "value", "FieldType": "Text", "MaxLength": 500, "IsRequired": true },
                { "Name": "expire", "FieldType": "Date" }
            ]);
        settings.de.sfmcApiToken = createDataExtension('SFMC Api Token', [
                { "Name": "clientId", "FieldType": "Text", "MaxLength": 50, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "token", "FieldType": "Text", "MaxLength": 500, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "expire", "FieldType": "Date" }
            ]);
        settings.de.wsproxyCols = createDataExtension('WSProxy Cols', [
                { "Name": "ObjectType", "FieldType": "Text", "MaxLength": 50, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "Cols", "FieldType": "Text", "MaxLength": 4000, "IsRequired": true },
                { "Name": "Last Update", "FieldType": "Date", "IsRequired": true }
            ]);
        settings.de.authUsers = createDataExtension('Auth Users', [
                { "Name": "Username", "FieldType": "Text", "MaxLength": 254, "IsPrimaryKey": true, "IsRequired": true },
                { "Name": "Password", "FieldType": "Text", "MaxLength": 500, "IsRequired": true },
            ]);

        // add data to DE
        Write('\nAdded rows to authentication:'+Platform.Function.UpsertData(settings.de.authentication.Name,["key"],["login"],["value"],[SHA256(Platform.Function.GUID())]));
        Write('\nAdded rows to authUsers:'+Platform.Function.UpsertData(settings.de.authUsers.Name,["Username"],["admin"],["Password"],[SHA256('email360')]));

        // load library files from github
        var wrapper = '',
            libFiles = {
                sfmcapi: 'https://raw.githubusercontent.com/email360/ssjs-lib/master/core/lib_sfmcapi.js',
                polyfill: 'https://raw.githubusercontent.com/email360/ssjs-lib/master/core/lib_polyfill.js',
                core: 'https://raw.githubusercontent.com/email360/ssjs-lib/master/core/lib_core.js',
                wsproxy: 'https://raw.githubusercontent.com/email360/ssjs-lib/master/core/lib_wsproxy.js',
                amp: 'https://raw.githubusercontent.com/email360/ssjs-lib/master/core/lib_amp.js',
                cloudpage: 'https://raw.githubusercontent.com/email360/ssjs-lib/master/core/lib_cloudpage.js'
            };
        for( var name in libFiles ) {
            var res = httpRequest('GET',libFiles[name]);
            createScriptContentBlock('Email360 SSJS-Lib: '+name,'email360-lib-'+name,res.content,settings.folderId['Asset SSJS Lib Core']);
            wrapper += "\tOutput(ContentBlockByKey('email360-lib-"+name+"'));\n";
        }

        // create main lib file
        var content = '%%[\n'+wrapper+']%%';
        createScriptContentBlock('Email360 SSJS-Lib','email360-ssjs-lib',content,settings.folderId['Asset SSJS Lib Core']);

        // create demo login page code
        var res = httpRequest('GET','https://raw.githubusercontent.com/email360/ssjs-lib/master/sample/cloudpages/login/login.js');
        createHtmlContentBlock('Email360 Login Code','email360-login-code',res.content,settings.folderId['Asset SSJS Lib CloudPages Login']);
        // create demo login page html
        var res = httpRequest('GET','https://raw.githubusercontent.com/email360/ssjs-lib/master/sample/cloudpages/login/login.html');
        createHtmlContentBlock('Email360 Login HTML','email360-login-html',res.content,settings.folderId['Asset SSJS Lib CloudPages Login']);

        // create demo error page code
        var res = httpRequest('GET','https://raw.githubusercontent.com/email360/ssjs-lib/master/sample/cloudpages/error/error.js');
        createHtmlContentBlock('Email360 Error Code','email360-error-code',res.content,settings.folderId['Asset SSJS Lib CloudPages Error']);
        // create demo error page html
        var res = httpRequest('GET','https://raw.githubusercontent.com/email360/ssjs-lib/master/sample/cloudpages/error/error.html');
        createHtmlContentBlock('Email360 Error HTML','email360-error-html',res.content,settings.folderId['Asset SSJS Lib CloudPages Error']);


        // Settings: add SFMC api settings
        settings.sfmcApi = {
            authBaseURI: "https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx.auth.marketingcloudapis.com/",
            restBaseURI: "https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx.rest.marketingcloudapis.com/",
            soapBaseURI: "https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx.soap.marketingcloudapis.com/",
            clientId: "xxxxxxxxxxxxxxxxxxxxxxxx",
            clientSecret: "xxxxxxxxxxxxxxxxxxxxxxxx"
        };

        // Settings: add cloudpage ids
        settings.cp = {
            login: 0,
            error: 0
        };

        // Settings: add authentication
        settings.auth = {
            cookieName: 'email360_access_token',
            login: 'login'
        };

        // create settings file
        var content = '<script runat=server>\n\t\t\t\tfunction settings() {\n\n'+ConvertObjectIndented(settings,'\t\t\t\t\t\t\t\t')+'\n\t\t\t\t}\n</'+'script>';
        createScriptContentBlock('SSJS-Lib: Settings','email360-lib-settings',content,settings.folderId['Asset SSJS Lib Core']);
    } catch(e) {
        Write(Stringify(e));
    }

    Write('</pre>');

    /************************************************************************************************************************************************/


    function getFolderId(data) {
        var f1 = { Property: 'Name', SimpleOperator: "equals", Value: data.name },
            f2 = { Property: 'ContentType', SimpleOperator: "equals", Value: data.type },
            res = api.retrieve("DataFolder", ['ID','ContentType'], { LeftOperand:f1, LogicalOperator: "AND", RightOperand: f2 });
        Write('\nRetrieve folder ID for '+ data.name + ': '+res.Status);
        return res.Results[0].ID;
    }

    function createScriptContentBlock(name,key,content,parentFolder) {
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
        });
        Write('\nCreate script content block '+ name + ': '+res.Status);
    }

    function createHtmlContentBlock(name,key,content,parentFolder) {
        var res = api.createItem("Asset", {
            Name: name,
            AssetType: {
                Id: 197
            },
            Content: content,
            ContentType: "text/html",
            CustomerKey: key,
            Category: {
                Id: parentFolder
            }
        });
        Write('\nCreate html content block '+ name + ': '+res.Status);
    }

    function createFolder(name,type,parentFolder) {
        var res = api.createItem("DataFolder", {
            Name: name,
            Description: 'Folder for all Email360 SSJS Lib relevant data',
            ParentFolder: {
                ID : parentFolder,
                IDSpecified: true
            },
            ContentType: type,
            IsActive: true,
            IsEditable: true,
            AllowChildren: true
        });
        Write('\nCreate folder '+ name + ': '+res.Status);
        return res.Results[0].NewID;
    }

    function createDataExtension(name,fields) {
        var res = api.createItem("DataExtension", {
            CustomerKey: Platform.Function.GUID().toUpperCase(),
            Name: 'SSJS Lib - '+name,
            CategoryID: settings.folderId['DataExtension SSJS Lib'],
            Fields: fields
        });
        Write('\nCreate dataextension '+ name + ': '+res.Status);
        return { Name: res.Results[0].Object.Name, Key: res.Results[0].Object.CustomerKey };
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
                    var od = ConvertObjectIndented(value, indent + "\t\t\t\t");
                    value = "{\n" + od + "\n" + indent + "}";
                }
            }

            result += indent + '"' + property + '": ' + value + ",\n";
        }
        
        return result.replace(/,\n$/, "");
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

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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