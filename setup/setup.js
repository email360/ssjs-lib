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
    Platform.Load("Core", "1.1.5");
    var prefix = (Variable.GetValue("@prefix")) ? Variable.GetValue("@prefix") : 'email360';

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
        settings.folderId['DataExtension SSJS Lib'] = createFolder(prefix+' SSJS Lib', 'dataextension', settings.folderId['Data Extensions']);
        settings.folderId['Asset SSJS Lib'] = createFolder(prefix+' SSJS Lib','asset', settings.folderId['Content Builder']);
        settings.folderId['Asset SSJS Lib Lib'] = createFolder('Lib','asset', settings.folderId['Asset SSJS Lib']);
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
        upsertDataExtensionRecords(settings.de.authentication,[{key:'login',value:SHA256(Platform.Function.GUID())}]);
        upsertDataExtensionRecords(settings.de.authUsers,[{Username:'admin',Password:SHA256('email360')}]);

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
            var res = httpRequest('GET',libFiles[name]),
                key = prefix.toLowerCase()+'-ssjs-lib-'+name;
            createScriptContentBlock(prefix+' SSJS Lib - '+name,key,res.content,settings.folderId['Asset SSJS Lib Lib']);
            wrapper += "\tOutput(ContentBlockByKey('"+key+"'));\n";
        }

        // create main lib file
        var content = "%%[\n\tOutput(ContentBlockByKey('"+prefix.toLowerCase()+"-ssjs-lib-settings'))\n"+wrapper+"]%%";
        createScriptContentBlock(prefix+' SSJS Lib',prefix.toLowerCase()+'-ssjs-lib',content,settings.folderId['Asset SSJS Lib']);

        // create demo login page code
        var res = httpRequest('GET','https://raw.githubusercontent.com/email360/ssjs-lib/master/sample/cloudpages/login/login.js');
        createScriptContentBlock(prefix+' Login Page',prefix.toLowerCase()+'-login-page',res.content,settings.folderId['Asset SSJS Lib CloudPages Login']);

        // create demo error page code
        var res = httpRequest('GET','https://raw.githubusercontent.com/email360/ssjs-lib/master/sample/cloudpages/error/error.js');
        createScriptContentBlock(prefix+' Error Page',prefix.toLowerCase()+'-error-page',res.content,settings.folderId['Asset SSJS Lib CloudPages Error']);


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
            cookieName: prefix.toLowerCase()+'_access_token',
            tokenKey: 'login'
        };

        // create settings file
        var content = '<script runat=server>\n    function settings() {\n\n'+ConvertObjectIndented(settings,'        ')+'\n    }\n</'+'script>';
        createScriptContentBlock(prefix+' SSJS-Lib: settings',prefix.toLowerCase()+'-ssjs-lib-settings',content,settings.folderId['Asset SSJS Lib Lib']);
    } catch(e) {
        Write(Stringify(e));
    }

    Write('</pre>');

    /************************************************************************************************************************************************/


    function getFolderId(data) {
        var f1 = { Property: 'Name', SimpleOperator: "equals", Value: data.name },
            f2 = { Property: 'ContentType', SimpleOperator: "equals", Value: data.type },
            res = api.retrieve("DataFolder", ['ID','ContentType'], { LeftOperand:f1, LogicalOperator: "AND", RightOperand: f2 }),
            id = res.Results[0].ID;
        Write('\n'+res.Status+':\tRetrieve folder ID for '+ data.name+': '+id);
        return id;
    }

    function upsertDataExtensionRecords(deObject,data) {
        var options = {SaveOptions: [{PropertyName:'*',SaveAction: 'UpdateAdd'}]},
            customerKey = deObject.Key,
            name = deObject.Name;


        // convert object into Name-Value pair
        var payload = [];
        for (var i = 0; i < data.length; i++) {
            var props = [];
            for(var k in data[i]) {
                props.push({Name:k, Value: data[i][k]});
            }
            payload.push({ CustomerKey: customerKey, Properties: props });
        }

        try {
            var res = api.updateBatch('DataExtensionObject', payload, options);

            if( res.Status == 'OK' ) {
                Write('\nOK:\t'+data.length+' record has been upsert to DE: '+name);
            } else {
                Write('\nError:\t'+Stringify(res));
            }

        } catch(e) {
            Write('\nError:\t'+Stringify(e)); 
        }
    }

    function createScriptContentBlock(name,key,content,parentFolder) {
        var status = null;

        var req = api.retrieve("Asset", ['*'], {
            Property: "Name",
            SimpleOperator: "equals",
            Value: name
        });

        if( req.Status == 'OK' && req.Results.length > 0 ) {
            status = 'Skip';
        } else {
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
            status = res.Status;
        }
        Write('\n'+status+':\tCreate script content block '+ name);
    }

    function createFolder(name,type,parentFolder) {
        var id = null,
            status = null;

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
        Write('\n'+status+':\tCreate '+type+' folder: '+ name);
        return id;
    }

    function createDataExtension(name,fields) {
        var n = prefix+' SSJS Lib - '+name,
            customerKey = null,
            status = null;

        // check if dataextension exists otherwise create
        var res = DataExtension.Retrieve({Property:"Name",SimpleOperator:"equals",Value:n});

        if( res.length <= 0 ) {
            res = api.createItem("DataExtension", {
                CustomerKey: Platform.Function.GUID().toUpperCase(),
                Name: n,
                CategoryID: settings.folderId['DataExtension SSJS Lib'],
                Fields: fields
            });
            customerKey = res.Results[0].Object.CustomerKey;
            status = res.Status;
        } else {
            customerKey = res[0].CustomerKey;
            status = (customerKey) ? 'Skip' : 'Error';
        }

        Write('\n'+status+':\tCreate dataextension: '+ name);
        return { Name: n, Key: customerKey };
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