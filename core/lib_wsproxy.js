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
     * Collection of wrapper functions for the usage of WSProxy.
     * <br>
     * <br>WSProxy functions library in server-side Javascript for
     * <br>Salesforce Marketing Cloud (SFMC).
     * <br>
     * <br><b>Note:</b> WSProxy can only be used in non sending enviroment.
     *
     * @param {number}  [mid]       The BuisnessUnit MID for enterprise integrations.
     *                              In order to access other business units, the
     *                              library must be added to the master Business Unit.
     * @param {object}  [setting]   Used to update the settings object with a custom setting object
     *
     * @example
     * // initialise a new wsproxy instance
     * var prox = new wsproxy();
     *
     */
    function wsproxy(mid,setting) {
        this.settings = _updateSettings(setting);
        // https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/base-asset-types.htm
        this.assetTypes = { ai: 16, psd: 17, pdd: 18, eps: 19, gif: 20, jpe: 21, jpeg: 22, jpg: 23, jp2: 24, jpx: 25, pict: 26, pct: 27, png: 28, tif: 29, tiff: 30, tga: 31, bmp: 32, wmf: 33, vsd: 34, pnm: 35, pgm: 36, pbm: 37, ppm: 38, svg: 39, "3fr": 40, ari: 41, arw: 42, bay: 43, cap: 44, crw: 45, cr2: 46, dcr: 47, dcs: 48, dng: 49, drf: 50, eip: 51, erf: 52, fff: 53, iiq: 54, k25: 55, kdc: 56, mef: 57, mos: 58, mrw: 59, nef: 60, nrw: 61, orf: 62, pef: 63, ptx: 64, pxn: 65, raf: 66, raw: 67, rw2: 68, rwl: 69, rwz: 70, srf: 71, sr2: 72, srw: 73, x3f: 74, "3gp": 75, "3gpp": 76, "3g2": 77, "3gp2": 78, asf: 79, avi: 80, m2ts: 81, mts: 82, dif: 83, dv: 84, mkv: 85, mpg: 86, f4v: 87, flv: 88, mjpg: 89, mjpeg: 90, mxf: 91, mpeg: 92, mp4: 93, m4v: 94, mp4v: 95, mov: 96, swf: 97, wmv: 98, rm: 99, ogv: 100, indd: 101, indt: 102, incx: 103, wwcx: 104, doc: 105, docx: 106, dot: 107, dotx: 108, mdb: 109, mpp: 110, ics: 111, xls: 112, xlsx: 113, xlk: 114, xlsm: 115, xlt: 116, xltm: 117, csv: 118, tsv: 119, tab: 120, pps: 121, ppsx: 122, ppt: 123, pptx: 124, pot: 125, thmx: 126, pdf: 127, ps: 128, qxd: 129, rtf: 130, sxc: 131, sxi: 132, sxw: 133, odt: 134, ods: 135, ots: 136, odp: 137, otp: 138, epub: 139, dvi: 140, key: 141, keynote: 142, pez: 143, aac: 144, m4a: 145, au: 146, aif: 147, aiff: 148, aifc: 149, mp3: 150, wav: 151, wma: 152, midi: 153, oga: 154, ogg: 155, ra: 156, vox: 157, voc: 158, "7z": 159, arj: 160, bz2: 161, cab: 162, gz: 163, gzip: 164, iso: 165, lha: 166, sit: 167, tgz: 168, jar: 169, rar: 170, tar: 171, zip: 172, gpg: 173, htm: 174, html: 175, xhtml: 176, xht: 177, css: 178, less: 179, sass: 180, js: 181, json: 182, atom: 183, rss: 184, xml: 185, xsl: 186, xslt: 187, md: 188, markdown: 189, as: 190, fla: 191, eml: 192, text: 193, txt: 194, freeformblock: 195, textblock: 196, htmlblock: 197, textplusimageblock: 198, imageblock: 199, abtestblock: 200, dynamicblock: 201, stylingblock: 202, einsteincontentblock: 203, webpage: 205, webtemplate: 206, templatebasedemail: 207, htmlemail: 208, textonlyemail: 209, socialshareblock: 210, socialfollowblock: 211, buttonblock: 212, layoutblock: 213, defaulttemplate: 214, smartcaptureblock: 215, smartcaptureformfieldblock: 216, smartcapturesubmitoptionsblock: 217, slotpropertiesblock: 218, externalcontentblock: 219, codesnippetblock: 220, rssfeedblock: 221, formstylingblock: 222, referenceblock: 223, imagecarouselblock: 224, customblock: 225, liveimageblock: 226, livesettingblock: 227, contentmap: 228, jsonmessage: 230 };
        this.cols = {};
        this.colsDE = null;
        this.previousDebugMode = null;


        /** 
         * The WSProxy API instance.
         *
         * @example
         * this.api.retrieveItem()
         */
        this.api = null;
        
        // init WSProxy
        this.api = new Script.Util.WSProxy();
        if (mid != null) { 
            this.api.setClientId({ "ID": mid });
            debug('(WSProxy)\n\tOK: Init WSProxy on BusinessUnit '+ mid);
        } else {
            debug('(WSProxy)\n\tOK: Init WSProxy');
        }
        

        this._toogleDebugMode = function() {
            if (typeof debugMode !== 'undefined') {
                if(debugMode) {
                    this.previousDebugMode = debugMode;
                    debugMode = null;
                } else if( debugMode != this.previousDebugMode ) {
                    debugMode = this.previousDebugMode;
                } else {
                    debugMode = null;
                }
            }
        };

        this._toogleMid = function(mid) {
            if( Number.isInteger(mid) ) {
                this.api.setClientId({ "ID": mid });
                debug('(WSProxy)\n\tOK: Impersonation BusinessUnit: '+mid);
            } else {
                this.api.resetClientIds();
                debug('(WSProxy)\n\tOK: Clear all set ClientId objects');
            }
        };

        /** 
         * Retrieves all retrievable columns for the given object.
         * 
         * @param {string} objectType The SFMC Object to retrieve cols from.
         *
         * @returns {array} A list of al retrievable columns.
         *
         * @example
         * // retrieve cols for DataExtension
         * var cols = prox.retrievableCols('DataExtension');
         *
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/getting_the_fields_available_for_retrieval.htm|Get the Fields Available for Retrieval}
         */
        this.retrievableCols = function(objectType) {
            var c = this.cols[objectType];
            if (!c) {

                // check if Cols DataExtension has been initialised already
                if( this.colsDE == null ) {
                    // get DataExtension for Cols
                    var de_wsproxyCols = this.settings.de.wsproxyCols.Name;
                    if( de_wsproxyCols ) {
                        var res = this.api.retrieve("DataExtension", ['Name'], { 
                            Property: 'Name', 
                            SimpleOperator: "equals", 
                            Value: de_wsproxyCols 
                        });
                        if( res.Status == 'OK' && res.Results.length > 0 ) {
                            this.colsDE = de_wsproxyCols;
                        } else {
                            debug('(retrievableCols)\n\tInfo: Check the settings for de.wsproxyCols as DataExtension '+de_wsproxyCols+' does not exist');
                        }
                    } else {
                        debug('(retrievableCols)\n\tInfo: For better usage and performance, please add a DataExtension for cols storage and add it to the setting de.wsproxyCols with fields: \n\t\t(PK) ObjectType: Text 50\n\t\tCols: Text 4000\n\t\tLast Update: Date');
                    }
                }

                // try to use DataExtension values if exist
                if( this.colsDE !== null ) {
                    var deCols = Platform.Function.Lookup(this.colsDE,'Cols','ObjectType',objectType),
                        deColsLastUpdate = Platform.Function.Lookup(this.colsDE,'Last Update','ObjectType',objectType);

                    // return DataExtension value but only if it is less than 7 days old
                    if( deCols.length > 0 && dateDiffInDays(new Date(deColsLastUpdate), getDateUTC()) < 7 ) {
                        debug('(retrievableCols)\n\tInfo: Use DataExtension data for objectType: '+objectType);
                        return deCols.split(',');
                    }
                }

                this.cols[objectType] = [];

                // Automation cols retrieve is bugged
                if( objectType == 'Automation' ) {
                    debug('(retrievableCols)\n\tInfo: Using retrievableCols on Automation results in cols which are not retrievable. ObjectID must be ProgrammID, Client. and Schedule. are also invalid. Using Wildcard(*) instead'); 
                    this.cols[objectType] = ['*'];
                } else {

                    var req = this.api.describe(objectType);
                    var props = req.Results[0].Properties;
                    if( props.length > 0 ) {
                        for(var i=0; i<props.length; i++) {
                            if( props[i].IsRetrievable ) {
                                this.cols[objectType].push(props[i].Name);
                            }
                        }
                    }
                }

                // update DataExtension if DataExtension exist
                if( this.colsDE !== null ) {
                    var colsArray = this.cols[objectType];
                    debug('(retrievableCols)\n\tInfo: Renew DataExtension data for objectType: '+objectType);
                    this.upsertDataExtensionRecords(this.colsDE,[{
                        ObjectType: objectType,
                        Cols: colsArray.join(),
                        "Last Update": getDateUTC()
                    }]);
                }

                return this.cols[objectType];
            } else {
                return c;
            }
        };

        /**
         * Match cols with request result of a retrieve
         *
         * A retrieve request result is returning many informations which are not
         * useable if the same object will be used to create or update informations.
         * This function takes the retrieveable cols and match the values against
         * the original request result. 
         *
         * @param {array} cols  Array of retrievebale cols. E.g.: this.retrievableCols('asset')
         * @param {array} req   A retrieve request result
         *
         * @returns {array}     A modified retrieve request
         */
        this.retrievableColsValues = function(cols,req) {
            var obj = {};

            var getVal = function(props) {
                return props.reduce(function(a, b) { return a[b]; }, req);
            };
          
            for (var n = 0; n < cols.length; n++) {    
                var props = cols[n].split("."),
                    x = obj;

                for(var i = 0; i < props.length-1; i++) {
                    if (x[props[i]]) {
                      x = x[props[i]];
                    } else {
                      x = x[props[i]] = {};
                    }
                }
                if( getVal(props) != null ) {
                    x[props[i]] = getVal(props);
                }
            }

            return obj;
        };

        

        // ============================== DATAEXENSION ==============================


        /**
         * Create a DataExtension within SFMC.
         *
         * Sample list of the field array required to generate the DataExtension
         * <pre>
         * [
         *    {
         *        "Name": "Text",
         *        "FieldType": "Text",
         *        "MaxLength": 50,
         *        "DefaultValue": "Hellow world"
         *    },
         *    {
         *        "Name": "Number",
         *        "FieldType": "Number"
         *    },
         *    {
         *        "Name": "Date",
         *        "FieldType": "Date"
         *    },
         *    {
         *        "Name": "Boolean",
         *        "FieldType": "Boolean",
         *        "DefaultValue": false
         *    },
         *    {
         *        "Name": "Email",
         *        "FieldType": "EmailAddress"
         *    },
         *    {
         *        "Name": "Phone",
         *        "FieldType": "Phone"
         *    },
         *    {
         *        "Name": "Decimal",
         *        "FieldType": "Decimal",
         *        "MaxLength": 18,
         *        "Scale": 2
         *    },
         *    {
         *        "Name": "Locale",
         *        "FieldType": "Locale"
         *    }
         * ]
         * </pre>
         * For a full and up to date list of available field types, 
         * visit Salesforce Marketing Cloud documantation.
         * 
         * @param   {string}    name            Name of the new DataExtension.
         * @param   {array}     fields          Fields to be created within the DataExtension.
         * @param   {number}    [folderId=0]    Folder ID within SFMC to place the DataExtension.
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * // Create a new DataExtension inside the folder DataExtensions
         * var prox = new wsproxy();
         * var resp = prox.createDataExtension('MyNewDataExtension', [{
         *        "Name": "Text",
         *        "FieldType": "Text",
         *        "MaxLength": 50,
         *        "DefaultValue": "Hellow world"
         *    }]);
         */   
        this.createDataExtension = function(name,fields,folderId) {
            var categoryID = (Number.isInteger(folderId) && this.isDataExtensionFolder(folderId)) ? folderId : this.settings.folderId['Data Extensions'],
                req = null;

            // data extension exist?
            if( this.isDataExtension(name) !== true ) {
                req = this.api.createItem("DataExtension", {
                    "CustomerKey": Platform.Function.GUID().toUpperCase(),
                    "Name": name,
                    "CategoryID": categoryID,
                    "Fields": fields
                });
                if( req.Status == 'OK' ) {
                    debug('(createDataExtension)\n\tOK: Data Extension "'+name+'" has been created');
                    debug('\tCustomerKey: '+req.Results[0].Object.CustomerKey+'\n\tObjectId: '+req.Results[0].NewObjectID);
                    return req;
                } else {
                    debug('(createDataExtension)\n\tError: '+Stringify(req));
                    return req;
                }
            } else {
                debug('(createDataExtension)\n\tError: DataExtension already exists with name ' +name);
                return req;
            }
        };

        /**
         * Create a DataExtension with "num" random records.
         * 
         * @param {string}  name            The name of the new DataExtension
         * @param {number}  num             Amount of random records
         * @param {number}  [folderId=0]    Folder ID within SFMC to place the DataExtension.
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * // Create a new demo DataExtension inside the folder DataExtensions with 100 random records
         * var prox = new wsproxy();
         * var resp = prox.createDataExtensionDemo('MyNewDataExtension', 100);
         */   
        this.createDataExtensionDemo = function(name,num,folderId) {
            var fields = [
                {
                    "Name": "Primary",
                    "FieldType": "Text",
                    "IsPrimaryKey": true,
                    "IsRequired": true,
                    "MaxLength": 50
                },
                {
                    "Name": "Text_with_Default",
                    "FieldType": "Text",
                    "MaxLength": 50,
                    "DefaultValue": "Hellow world"
                },
                {
                    "Name": "Number",
                    "FieldType": "Number"
                },
                {
                    "Name": "Date",
                    "FieldType": "Date"
                },
                {
                    "Name": "Boolean",
                    "FieldType": "Boolean",
                    "DefaultValue": false
                },
                {
                    "Name": "Email",
                    "FieldType": "EmailAddress"
                },
                {
                    "Name": "Phone",
                    "FieldType": "Phone"
                },
                {
                    "Name": "Decimal",
                    "FieldType": "Decimal",
                    "MaxLength": 18,
                    "Scale": 2
                },
                {
                    "Name": "Locale",
                    "FieldType": "Locale"
                },
                {
                    "Name": "Text_required",
                    "FieldType": "Text",
                    "MaxLength": 50,
                    "IsRequired": true
                }
            ];
            // create the empty data extension
            var req = this.createDataExtension(name,fields,folderId),
                payload = [];
            
            if (req.Status != 'OK' || req.Results.length <= 0) {
                return req;
            }

            var customerKey = req.Results[0].Object.CustomerKey;
            if( customerKey ) {
                         
                // create num of rows           
                for (var i = 0; i < num; i++) {
                    var props = [];
                    for (var k = 0; k < fields.length; k++) {

                        var fieldName = fields[k].Name,
                            fieldValue = (fields[k].FieldType == "Text" && fields[k].IsPrimaryKey == true) ? Platform.Function.GUID() : getRandomData(fields[k].FieldType);
                        
                        if( fields[k].MaxLength && fields[k].FieldType == "Text") {
                            fieldValue = fieldValue.substring(0,fields[k].MaxLength);
                        }
                        props.push({Name: fieldName, Value: fieldValue});
                    }
                    payload.push({ CustomerKey: customerKey, Properties: props });
                }

                req = this.api.createBatch('DataExtensionObject', payload);

                if (req.Status != 'OK' || req.Results.length <= 0) {
                    debug("(createDataExtensionDemo)\n\t"+req.Status);
                } else {
                    debug("(createDataExtensionDemo)\n\tOK: Rows added: " + payload.length); 
                }
                return req;

            } else {
                debug("(createDataExtensionDemo)\n\tError: Cannot find CustomerKey for DataExtension: " +name);
                return req;
            }
        };

        /**
         * Retrieve informations about a single DataExtension.
         * 
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey.
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * // Retrieve informations about a sepcific DataExtension
         * var prox = new wsproxy();
         * var resp = prox.retrieveDataExtension('MySampleDataExtension');
         *
         * // using a customerKey
         * var resp = prox.retrieveDataExtension('53b54b8a-b604-4fc2-90x9-33eec99c8a93');
         */
        this.retrieveDataExtension = function(id) {
            var cols = this.retrievableCols('DataExtension'),
                property = ['Name','CustomerKey'],
                req = {};

            for (var i = 0; i < 2; i++) {
                req = this.api.retrieve("DataExtension", cols, { 
                    Property: property[i], 
                    SimpleOperator: "equals", 
                    Value: id 
                });

                if( req.Status == 'OK' && req.Results.length > 0 ) {
                    debug('(retrieveDataExtension)\n\tOK: Retrieve DataExtension with '+property[i]+': '+id);
                    return req;
                }
            }
            debug('(retrieveDataExtension)\n\t' + req.Status);
            return req;
        };

        /**
         * Retrieve a list of all DataExtension(s) in the business unit.
         *
         * @param {object}      [filter]            SFMC filter.
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         *
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-programmatic-content.meta/mc-programmatic-content/ssjs_WSProxy_basic_retrieve.htm|Filters}
         *
         * @example
         * // Retrieve all DataExtensions
         * var prox = new wsproxy();
         * var resp = prox.retrieveDataExtensions(NULL,true);
         */
        this.retrieveDataExtensions = function(filter,retrieveAll) {
            var cols = this.retrievableCols('DataExtension'),
                a = [],
                f = {Property:"CustomerKey", SimpleOperator:"isNotNull", Value:" "},
                moreData = true,
                reqID = null,
                req = null;

            // additional filter rules?
            f = (filter) ? { LeftOperand: f, LogicalOperator: "AND", RightOperand: filter } : f;

            while (moreData) {

                moreData = false;

                req = (reqID == null) ? req = this.api.retrieve("DataExtension", cols, f) : req = this.api.getNextBatch("DataExtension", reqID);

                if( req.Status == 'OK' || req.Status == 'MoreDataAvailable' ) {
                    moreData = (retrieveAll) ? req.HasMoreRows : false;
                    reqID = req.RequestID;
                    var r = req.Results;
                    for (var i = 0; i < r.length; i++) {
                        a.push(this.retrievableColsValues(cols,r[i]));
                    }
                } else {
                    debug('(retrieveDataExtensions)\n\tError: '+req);
                    return req;
                }
            }
            debug('(retrieveDataExtensions)\n\tOK: Retrieved '+a.length+' DataExtensions');
            req.Results = a;
            return req;
        };

        /**
         * Retrieves a property of a DataExtension.
         *
         * @param {string}  id          The identifier for the DataExtension. Name or customerKey.
         * @param {string}  property    The property name to retrieve.
         *
         * @returns {string|NULL}  The DataExtension property or NULL
         */
        this.retrieveDataExtensionProperty = function(id,property) {
            var req = this.retrieveDataExtension(id),
                prop = req.Results[0][property];

            if( req.Status == 'OK' && req.Results.length == 1 && prop ) {
                debug('(retrieveDataExtension'+property+')\n\tOK: '+property+' for DataExtension '+id+': '+prop );
                return prop;
            } else {
                debug('(retrieveDataExtension'+property+')\n\tError: Cannot retrieve '+property+' for DataExtension: '+id);
                return null;
            }
        };

        /**
         * Retrieve the CustomerKey of the given DataExtension.
         * 
         * @param {string}  id  The name of the DataExtension.
         *
         * @returns {string|NULL}  The CustomerKey of the DataExtension or NULL
         */
        this.retrieveDataExtensionCustomerKey = function(id) { return (isCustomerKey(id)) ? id : this.retrieveDataExtensionProperty(id,'CustomerKey'); };

        /**
         * Retrieve the Name of the given DataExtension.
         * 
         * @param {string}  id  The customerKey of the DataExtension.
         *
         * @returns {string|NULL}  The Name of the DataExtension or NULL
         */
        this.retrieveDataExtensionName = function(id) { return this.retrieveDataExtensionProperty(id,'Name'); };

        /**
         * Retrieve the ObjectID of the given DataExtension.
         * 
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey.
         *
         * @returns {string|NULL}  The ObjectID of the DataExtension or NULL
         */
        this.retrieveDataExtensionObjectID = function(id) { return this.retrieveDataExtensionProperty(id,'ObjectID'); };

        /**
         * Retrieve the CategoryID of the given DataExtension.
         * 
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey.
         *
         * @returns {string|NULL}  The CategoryID of the DataExtension or NULL
         */
        this.retrieveDataExtensionCategoryID = function(id) { return this.retrieveDataExtensionProperty(id,'CategoryID'); };

        /**
         * Retrieve the ModifiedDate of the given DataExtension.
         *
         * <b>Note:</b> ModifiedDate is the the last modification of the properties for the given DataExtension. This does not apply 
         * to changes of the data within the DataExtension.
         * 
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey.
         *
         * @returns {string|NULL}  The ModifiedDate of the DataExtension or NULL
         */
        this.retrieveDataExtensionModifiedDate = function(id) { return this.retrieveDataExtensionProperty(id,'ModifiedDate'); };

        /**
         * Retrieve a list of all DataExtension Names.
         * 
         * @param {object}  [filter]            SFMC filter.
         * @param {boolean} [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {string|NULL}  Array of all DataExtension Names or NULL.
         */
        this.retrieveDataExtensionNames = function(filter,retrieveAll) {
            var res = [],
                req = this.retrieveDataExtensions(filter,retrieveAll),
                r = req.Results;

            if( req.Status == 'OK' && r.length > 0) {
                for (var k = 0; k < r.length; k++) {
                    res.push(r[k].Name);
                }
                return res;
            }
            return null;
        };

        /**
         * Retrieve a list of all DataExtension CustomerKeys.
         * 
         * @param {object}  [filter]            SFMC filter.
         * @param {boolean} [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {string|NULL}  Array of all DataExtension CustomerKeys or NULL.
         */
        this.retrieveDataExtensionCustomerKeys = function(filter,retrieveAll) {
            var res = [],
                req = this.retrieveDataExtensions(filter,retrieveAll),
                r = req.Results;

            if( req.Status == 'OK' && r.length > 0 ) {
                for (var k = 0; k < r.length; k++) {
                    res.push(r[k].CustomerKey);
                }
                return res;
            }
            return null;
        };

        /**
         * Find DataExtension(s) which have no folder allocation
         * 
         * If a folder has been deleted and it contained any DataExtension, 
         * these DataExtension will no longer be visible in the UI 
         * as their shared CategoryID is referring to a non-existing folder.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveDataExtensionWithNoFolder = function() {
            var req = this.retrieveDataExtensions(null,true),
                res = {Status:'OK',Results:[]},
                count = 0,
                orgDebugMode = debugMode;

            if( req.Status == 'OK' ) {
                var r = req.Results;
                debugMode = false;
                for (var k = 0; k < r.length; k++) {
                    var o = {
                        name: r[k].Name,
                        customerKey: r[k].CustomerKey,
                        categoryID: r[k].CategoryID
                    };

                    if( this.retrieveDataFolderObjectID(o.categoryID) == null ) {
                        count++;
                        res.Results.push(o);
                    }
                }
                debugMode = orgDebugMode;
                debug('(retrieveDataExtensionWithNoFolder)\n\tOK: Found '+count+' DataExtensions with deleted dataFolder allocation');
                return res;
            } else {
                return req;
            }
        };

        /**
         * Retrieves the folder path for a DataExtension.
         *
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey.
         *
         * @returns {string|NULL}  The DataExtension folder path or NULL
         */
        this.retrieveDataExtensionFolderPath = function(id) {
            var customerKey = this.retrieveDataExtensionCustomerKey(id);
            if( customerKey ) {
                return this.retrieveDataFolderPath(customerKey,'DataExtension');
            } else {
                return null;
            }
        };

        /**
         * Check if a DataExtension with the given id already exists.
         * 
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey.
         *
         * @returns {boolean}
         */
        this.isDataExtension = function(id) {
            this._toogleDebugMode();
            var req = this.retrieveDataExtension(id);
            this._toogleDebugMode();
            return (req.Status == 'OK' && req.Results.length > 0) ? true : false;
        };

        /**
         * Check if folder is a ContentType of DataExtension
         *
         * @param {string|number}   id  The identifier for the folder. Name or Folder Id
         *
         * @returns {boolean}
         */
        this.isDataExtensionFolder = function(folderId) { return (this.retrieveDataFolderContentType(folderId) == 'dataextension' ) ? true : false; };

        /**
         * Move a DataExtension.
         *
         * Moving a DataExtension from one folder to another requires the
         * change of it’s CategoryID attribute.
         * 
         * @param {string}          id          The identifier for the DataExtension. Name or customerKey.
         * @param {string|number}   folderId    The identifier for the target folder. Name as string or folder ID as number
         *
         * @return {boolean}
         */
        this.moveDataExtension = function(id,folderId) {
            var customerKey = this.retrieveDataExtensionCustomerKey(id),
                categoryID = this.retrieveDataFolderID(folderId);

            if( !categoryID || !customerKey ) { 
                return false; 
            }

            try {
                var req = this.api.updateItem("DataExtension", { "CustomerKey": customerKey, "CategoryID": categoryID });
                if( req.Status == 'OK' ) {
                    debug('(moveDataExtension)\n\tOK: DataExtension '+customerKey+' moved to folder '+categoryID);
                    return true;
                } else {
                    debug('(moveDataExtension)\n\tError: '+Stringify(req));
                    return false;
                }
            } catch(e) {
                debug('(deleteDataExtension)\n\t'+Stringify(e));
                return false;     
            }
        };

        /**
         * Delete a DataExtension
         * 
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey.
         *
         * @returns {boolean}
         */
        this.deleteDataExtension = function(id) {
            var req = this.retrieveDataExtension(id);

            if( req.Status == 'OK' && req.Results.length > 0 ) {

                try {   
                    var objectID = req.Results[0].ObjectID,
                        name = req.Results[0].Name,
                        res = this.api.deleteItem("DataExtension", { "ObjectID": objectID });

                    if( res.Status == 'OK' ) { 
                        debug('(deleteDataExtension)\n\tOK: DataExtension '+name+' deleted');
                        return true;
                    } else {
                        debug('(deleteDataExtension)\n\tError: '+Stringify(res));
                        return false;
                    }
                } catch(e) {
                    debug('(deleteDataExtension)\n\t'+Stringify(e));
                    return false;     
                }
            }
            return false;
        };

        /**
         * Copy a DataExtension
         *
         * @param {string}          id                      The identifier for the DataExtension. Name or customerKey.
         * @param {string}          [newName]               The new name for the copied DataExtension. If null, the original name will be 
         *                                                  used and extended by the word  "Copy_"
         * @param {boolean}         [withRecords=false]     Set to copy all records. Attention: Depending on the amount of records this process 
         *                                                  can take a while and may timeout.
         * @param {string|number}   newFolderId             The identifier for the folder. Name or Folder Id
         *
         * @returns {boolean}
         */
        this.copyDataExtension = function(id,newName,withRecords,newFolderId) {
            

            // === RETRIEVE ORIGINAL DATAEXTENSION === //

            // dataextension cols
            var cols = this.retrievableCols('DataExtension'),
            // retrieve DataExtensipon failed
                req = this.retrieveDataExtension(id),
                r = req.Results[0];
            // retrieve failed
            if( req.Status != 'OK' || req.Results.length <= 0 ) { return false; }
            // save data for future use
            var customerKey = r.CustomerKey,
                name = r.Name;



            // === PREPARE NEW DATAEXTENSION === //

            // SendableDataExtensionField.FieldType is set but not retrievable...
            if( r.IsSendable && typeof r.SendableDataExtensionField.FieldType != 'string') {
                debug('(copyDataExtension)\n\tError: Cannot find settings for IsSendable. Expected a FieldType in SendableDataExtensionField.FieldType.');
                return false;
            } else {
                cols = cols.concat('SendableDataExtensionField.FieldType');
            }
            // prepare new DataExtension settings
            var deSettings = this.retrievableColsValues(cols,r);
            // reset SendableSubscriberField.Name
            deSettings.SendableSubscriberField.Name = (deSettings.SendableSubscriberField.Name == '_SubscriberKey') ? 'Subscriber Key' : deSettings.SendableSubscriberField.Name;
            // set new name customerKey and parent folder
            deSettings.Name = (newName) ? newName : 'Copy_'+deSettings.Name;
            deSettings.CategoryID = (newFolderId) ? newFolderId : deSettings.CategoryID;
            deSettings.CustomerKey = Platform.Function.GUID().toUpperCase();
            // delete fields which need to be auto generated
            delete deSettings.ObjectID;
            delete deSettings.Status;
            // managing retention
            if( deSettings.RetainUntil && deSettings.DataRetentionPeriodLength == 0 ) { // fixed date retention
                delete deSettings.DataRetentionPeriodLength;
                delete deSettings.DataRetentionPeriod;
                delete deSettings.DeleteAtEndOfRetentionPeriod;
                // retrieved date format is DD/MM/YYYY 12:00:00 but need to be YYYY-MM-DD
                var dt = new Date(deSettings.RetainUntil);
                deSettings.RetainUntil = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate();
            }
            else if( deSettings.DataRetentionPeriodLength && deSettings.DataRetentionPeriodLength > 0 ) { // period retention
                delete deSettings.RetainUntil;
            } else { // no retention
                delete deSettings.RetainUntil;
                delete deSettings.DataRetentionPeriodLength;
                delete deSettings.DataRetentionPeriod;
                delete deSettings.DeleteAtEndOfRetentionPeriod;
                delete deSettings.RowBasedRetention;
                delete deSettings.ResetRetentionPeriodOnImport;
                delete deSettings.DataRetentionPeriodUnitOfMeasure;
            }

            // check if target folder exists
            if( !this.isDataExtensionFolder(deSettings.CategoryID) ) {
                debug('(copyDataExtension)\n\tError: new folder id: '+deSettings.CategoryID+' is not a contentType of dataextension.');
                return false;
            }



            // === RETRIEVE DATAEXTENSION FIELDS === //

            // get all dataextension fields
            req = this.retrieveDataExtensionFields(id);
            // get fields failed
            if( req.Status != 'OK' || req.Results.length <= 0 ) { return false; }
            // iterate over each field and its respective property
            cols = ["CustomerKey","Name","FieldType","IsPrimaryKey","MaxLength","Ordinal","DefaultValue","IsRequired"];
            var fields = [];
            for (var i = 0; i < req.Results.length; i++) {
                var field = {};
                for (var n = 0; n < cols.length; n++) {
                    if (req.Results[i].hasOwnProperty(cols[n])) {
                        // skip empty or MaxLength with 0
                        if(cols[n] == 'MaxLength' && ( req.Results[i][cols[n]] == 0 || req.Results[i][cols[n]] == '') ) {
                            continue;
                        }
                        if(cols[n] == 'MinLength' && ( req.Results[i][cols[n]] == 0 || req.Results[i][cols[n]] == '') ) {
                            continue;
                        }
                        field[cols[n]] = req.Results[i][cols[n]]; 
                    }
                }
                fields.push(field);
            }
            /* order each field by ordinal 
             * Note: in case oridnal is not given: The polyfill Array.sort used, cannot handle undefined comparison -> handle each case itself
             * @todo update polyfill Array.sort to hanlde undefined comparison
             */
            fields.sort(function(a,b) { return (a.Ordinal && b.Ordinal) ? a.Ordinal - b.Ordinal : ( (a.Ordinal) ? a.Ordinal-0 : 0-b.Ordinal); });
            // add fields to deSettings
            deSettings.Fields = fields;



            // === CREATE NEW DATAEXTENSION === //


            // data extension exist?
            if( this.isDataExtension(deSettings.Name) !== true ) {
                req = this.api.createItem("DataExtension", deSettings);
                if( req.Status == 'OK' ) {
                    debug('(copyDataExtension)\n\tOK: Data Extension "'+deSettings.Name+'" has been created');
                    debug('\tCustomerKey: '+deSettings.CustomerKey+'\n\tObjectId: '+req.Results[0].NewObjectID);
                } else {
                    debug('(copyDataExtension)\n\tError: '+Stringify(req));
                    return false;
                }
            } else {
                debug('(copyDataExtension)\n\tError: DataExtension already exists with name ' +deSettings.Name);
                return false;
            }



            // === COPY RECORDS === //

            if(withRecords === true) {
                req = this.retrieveDataExtensionRecords(customerKey,null,true);

                // retrieve records failed
                if( req.Status != 'OK' || req.Results.length <= 0 ) { return false; }

                if( this.createDataExtensionRecords(deSettings.CustomerKey,req.Results) == true) {
                    debug('(copyDataExtension)\n\tOK: DataExtension: '+name+' has been copied as '+deSettings.Name+' with '+req.Results.length+' records');
                    return true;
                } else {
                    return false;
                }
            } 
            debug('(copyDataExtension)\n\tOK: DataExtension: '+name+' has been copied as '+deSettings.Name);
            return true;
        };

        /**
         * Clear all records inside a DataExtension.
         * 
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey.
         *
         * @returns {boolean}
         */
        this.clearDataExtension = function(id) {
            var customerKey = this.retrieveDataExtensionCustomerKey(id);
            if( customerKey ) {

                try {
                    var req = this.api.performItem("DataExtension", { CustomerKey: customerKey }, "ClearData");

                    if( req.Status == 'OK' ) { 
                        debug('(clearDataExtension)\n\tOK: DataExtension '+id+' has been cleared');
                        return true;
                    } else {
                        debug('(clearDataExtension)\n\t'+Stringify(req));
                        return false;
                    }
                } catch(e) {
                    debug('(clearDataExtension)\n\t'+Stringify(e));
                    return false;     
                }
            }
            return false;
        };

        /**
         * Rename a DataExtension
         *
         * @param {string}  id          The identifier for the DataExtension. Name or customerKey.
         * @param {string}  newName     The new DataExtension name
         *
         * returns {boolean}
         */
        this.renameDataExtension = function(id, newName) {
            var props = {Name: newName};
            return this.updateDataExtension(id,props);
        };

        /**
         * Update the properties of a DataExtenion
         *
         * @param {string} id           The identifier for the DataExtension. Name or customerKey.
         * @param {object} properties   Object of properties to change. 
         *
         * @returns {boolean}
         *
         * @example
         * // changing the name of a DataExtension
         * var prox = new wsproxy();
         * var prop = { Name: "MyNewDataExtensionName" }
         * var resp = prox.updateDataExtension('MyNewDataExtension',prop);
         *
         * // change the DataExtension to be sendable
         * var prop = { 
         *     IsSendable: "true",
         *     SendableDataExtensionField: {
         *         Name: "email", //Provide the name of the field used to establish a data relationship
         *         DataType: "EmailAddress"
         *     },
         *     SendableSubscriberField: {
         *         Name: "Subscriber Key"
         *     } //Use "Subscriber Key" or "Email Address" depending on whether the SUBSCRIBER_KEY business rule has been turned on.
         * }
         * var resp = prox.updateDataExtension('MyNewDataExtension',prop);
         */
        this.updateDataExtension = function(id, properties) {
            var customerKey = this.retrieveDataExtensionCustomerKey(id);
            if( customerKey ) {

                properties.CustomerKey = customerKey;
                try {
                    var req = this.api.updateItem("DataExtension", properties);

                    if( req.Status == 'OK' ) { 
                        debug('(updateDataExtension)\n\tOK: DataExtension '+id+' has been updated');
                        return true;
                    } else {
                        debug('(updateDataExtension)\n\t'+Stringify(req));
                        return false;
                    }
                } catch(e) {
                    debug('(updateDataExtension)\n\t'+Stringify(e));
                    return false;     
                }
            }
            return false;
        };



        // ============================== DATAEXENSION TEMPLATE ==============================

        /**
         * Retrieve informations about a single DataExtentionTemplate.
         * 
         * @param {string}  id  The identifier for the DataExtentionTemplate. Name or customerKey.
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * // Retrieve informations about a sepcific DataExtentionTemplate
         * var prox = new wsproxy();
         * var resp = prox.retrieveDataExtentionTemplate('MySampleDataExtension');
         *
         * // using a customerKey
         * var resp = prox.retrieveDataExtentionTemplate('53b54b8a-b604-4fc2-90x9-33eec99c8a93');
         */
        this.retrieveDataExtentionTemplate = function(id) {
            var cols = this.retrievableCols('DataExtentionTemplate'),
                property = ['Name','CustomerKey'],
                req = {};

            for (var i = 0; i < 2; i++) {
                req = this.api.retrieve("DataExtentionTemplate", cols, { 
                    Property: property[i], 
                    SimpleOperator: "equals", 
                    Value: id 
                });

                if( req.Status == 'OK' && req.Results.length > 0 ) {
                    debug('(retrieveDataExtentionTemplate)\n\tOK: Retrieve DataExtentionTemplate with '+property[i]+': '+id);
                    return req;
                }
            }
            debug('(retrieveDataExtentionTemplate)\n\t' + req.Status);
            return req;
        };

        /**
         * Retrieve a list of all DataExtentionTemplate(s) in the business unit.
         *
         * @param {object}      [filter]            SFMC filter.
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveDataExtentionTemplates = function(filter,retrieveAll) {
            var cols = this.retrievableCols('DataExtentionTemplate'),
                a = [],
                f = {Property:"CustomerKey", SimpleOperator:"isNotNull", Value:" "},
                moreData = true,
                reqID = null,
                req = null;

            // additional filter rules?
            f = (filter) ? { LeftOperand: f, LogicalOperator: "AND", RightOperand: filter } : f;

            while (moreData) {

                moreData = false;

                req = (reqID == null) ? req = this.api.retrieve("DataExtentionTemplate", cols, f) : req = this.api.getNextBatch("DataExtentionTemplate", reqID);

                if( req.Status == 'OK' || req.Status == 'MoreDataAvailable' ) {
                    moreData = (retrieveAll) ? req.HasMoreRows : false;
                    reqID = req.RequestID;
                    var r = req.Results;
                    for (var k = 0; k < r.length; k++) {
                        a.push(r[k]);
                    }
                } else {
                    debug('(retrieveDataExtentionTemplates)\n\tError: '+req);
                    return req;
                }
            }
            debug('(retrieveDataExtentionTemplates)\n\tOK: Retrieved '+a.length+' DataExtentionTemplates');
            req.Results = a;
            return req;
        };

        /**
         * Retrieves a property of a DataExtentionTemplate.
         *
         * @param {string}  id          The identifier for the DataExtentionTemplate. Name or customerKey.
         * @param {string}  property    The property name to retrieve.
         *
         * @returns {string|NULL}  The DataExtentionTemplate property or NULL
         */
        this.retrieveDataExtentionTemplateProperty = function(id,property) {
            var req = this.retrieveDataExtentionTemplate(id),
                prop = req.Results[0][property];

            if( req.Status == 'OK' && req.Results.length == 1 && prop ) {
                debug('(retrieveDataExtentionTemplate'+property+')\n\tOK: '+property+' for DataExtentionTemplate '+id+': '+prop );
                return prop;
            } else {
                debug('(retrieveDataExtentionTemplate'+property+')\n\tError: Cannot retrieve '+property+' for DataExtentionTemplate: '+id);
                return null;
            }
        };

        /**
         * Retrieve the CustomerKey of the given DataExtentionTemplate.
         * 
         * @param {string}  id  The name of the DataExtentionTemplate.
         *
         * @returns {string|NULL}  The CustomerKey of the DataExtentionTemplate or NULL
         */
        this.retrieveDataExtentionTemplateCustomerKey = function(id) { return (isCustomerKey(id)) ? id : this.retrieveDataExtentionTemplateProperty(id,'CustomerKey'); };

        /**
         * Retrieve the Name of the given DataExtentionTemplate.
         * 
         * @param {string}  id  The customerKey of the DataExtentionTemplate.
         *
         * @returns {string|NULL}  The Name of the DataExtentionTemplate or NULL
         */
        this.retrieveDataExtentionTemplateName = function(id) { return this.retrieveDataExtentionTemplateProperty(id,'Name'); };

        /**
         * Retrieve the ObjectID of the given DataExtentionTemplate.
         * 
         * @param {string}  id  The identifier for the DataExtentionTemplate. Name or customerKey.
         *
         * @returns {string|NULL}  The ObjectID of the DataExtentionTemplate or NULL
         */
        this.retrieveDataExtentionTemplateObjectID = function(id) { return this.retrieveDataExtentionTemplateProperty(id,'ObjectID'); };

        /**
         * Retrieve the CategoryID of the given DataExtentionTemplate.
         * 
         * @param {string}  id  The identifier for the DataExtentionTemplate. Name or customerKey.
         *
         * @returns {string|NULL}  The CategoryID of the DataExtentionTemplate or NULL
         */
        this.retrieveDataExtentionTemplateCategoryID = function(id) { return this.retrieveDataExtentionTemplateProperty(id,'CategoryID'); };

        /**
         * Retrieve the ModifiedDate of the given DataExtentionTemplate.
         *
         * <b>Note:</b> ModifiedDate is the the last modification of the properties for the given DataExtentionTemplate. This does not apply 
         * to changes of the data within the DataExtentionTemplate.
         * 
         * @param {string}  id  The identifier for the DataExtentionTemplate. Name or customerKey.
         *
         * @returns {string|NULL}  The ModifiedDate of the DataExtentionTemplate or NULL
         */
        this.retrieveDataExtentionTemplateModifiedDate = function(id) { return this.retrieveDataExtentionTemplateProperty(id,'ModifiedDate'); };

        /**
         * Retrieve a list of all DataExtentionTemplate Names.
         * 
         * @param {object}  [filter]            SFMC filter.
         * @param {boolean} [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {string|NULL}  Array of all DataExtentionTemplate Names or NULL.
         */
        this.retrieveDataExtentionTemplateNames = function(filter,retrieveAll) {
            var res = [],
                req = this.retrieveDataExtentionTemplates(filter,retrieveAll),
                r = req.Results;

            if( req.Status == 'OK' && r.length > 0) {
                for (var k = 0; k < r.length; k++) {
                    res.push(r[k].Name);
                }
                return res;
            }
            return null;
        };

        /**
         * Check if a DataExtentionTemplate with the given id already exists.
         * 
         * @param {string}  id  The identifier for the DataExtentionTemplate. Name or customerKey.
         *
         * @returns {boolean}
         */
        this.isDataExtentionTemplate = function(id) {
            this._toogleDebugMode();
            var req = this.retrieveDataExtentionTemplate(id);
            this._toogleDebugMode();
            return (req.Status == 'OK' && req.Results.length > 0) ? true : false;
        };

        /**
         * Delete a DataExtentionTemplate
         * 
         * @param {string}  id  The identifier for the DataExtentionTemplate. Name or customerKey.
         *
         * @returns {boolean}
         */
        this.deleteDataExtentionTemplate = function(id) {
            var req = this.retrieveDataExtentionTemplate(id);

            if( req.Status == 'OK' && req.Results.length > 0 ) {

                try {   
                    var objectID = req.Results[0].ObjectID,
                        name = req.Results[0].Name,
                        res = this.api.deleteItem("DataExtentionTemplate", { "ObjectID": objectID });

                    if( res.Status == 'OK' ) { 
                        debug('(deleteDataExtentionTemplate)\n\tOK: DataExtentionTemplate '+name+' deleted');
                        return true;
                    } else {
                        debug('(deleteDataExtentionTemplate)\n\tError: '+Stringify(res));
                        return false;
                    }
                } catch(e) {
                    debug('(deleteDataExtentionTemplate)\n\t'+Stringify(e));
                    return false;     
                }
            }
            return false;
        };



        // ============================== RECORDS ==============================


        /**
         * Create new records inside the given DataExtension.
         *
         * To avoid the cumbersome Name-Value pair structure, the data 
         * object will be converted. Expecting the following sample object:
         * <pre>
         * {
         *      Firstname: "John",
         *      Lastname: "Peter"
         * }
         * </pre>
         *
         * @param {string}  id      The identifier for the DataExtension. Name or customerKey.
         * @param {array}   data    Array of objects to add.
         *
         * @returns {boolean}
         *
         * @example
         * // create 1 record in DataExtension with name "MyDataExtension"
         * var prox = new wsproxy();
         * var resp = prox.createDataExtensionRecords('MyDataExtension',[{SubscriberKey:"123-345-123",Firstname:"John",Lastname:"Smith"}]);
         * 
         * // create 2 records in DataExtension with name "MyDataExtension"
         * var resp = prox.createDataExtensionRecords('MyDataExtension',[
         *            {SubscriberKey:"123-345-123",Firstname:"John",Lastname:"Smith"},
         *            {SubscriberKey:"456-654-321",Firstname:"Mike",Lastname:"Do"}
         * ]);
         */
        this.createDataExtensionRecords = function(id,data) {
            var customerKey = this.retrieveDataExtensionCustomerKey(id);
            if( customerKey ) {

                var payload = [];
                for (var i = 0; i < data.length; i++) {
                    var props = [];
                    for(var k in data[i]) {
                        props.push({Name:k, Value: data[i][k]});
                    }
                    payload.push({ CustomerKey: customerKey, Properties: props });
                }

                try {
                    var req = this.api.createBatch('DataExtensionObject', payload);

                    if( req.Status == 'OK' && req.Results.length > 0 ) {
                        debug('(createRecords)\n\tOK: '+payload.length+' Record(s) were added to the DataExtension '+id);
                        return true;     
                    } else {
                        debug('(createRecords)\n\t'+Stringify(req));
                        return false;
                    }
                } catch(e) {
                    debug('(createRecords)\n\t'+Stringify(e));
                    return false;     
                }
            }
            return false;
        };

        /**
         * Retrieve records inside a DataExtension.
         *
         * In order to select all data from a DataExtension, the DataExtension field names
         * need to be collected. After retrieving the field names, all
         * data can be retrieved. Optional, the selection of the data can
         * be filtered or only the first 2,500 records can be retrieved. 
         *
         * @param {string}      id                  The identifier for the DataExtension. Name or customerKey
         * @param {object}      [filter=NULL]       SFMC filter object
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * // retrieve all records from 'MyDataExtension' where 'Number' is larger than 10
         * var prox = new wsproxy();
         * var filter = {
         *     Property: "Number",
         *     SimpleOperator: "greaterThan",
         *     Value: 10
         * };
         * var resp = prox.retrieveDataExtensionRecords('MyDataExtension', filter, true)
         */
        this.retrieveDataExtensionRecords = function(id,filter,retrieveAll) {
            var customerKey = this.retrieveDataExtensionCustomerKey(id);
            if( customerKey != null ) {
                var a           = [],
                    moreData    = true,
                    reqID       = null,
                    req         = null,        
                    cols        = ['_CustomObjectKey'].concat(this.retrieveDataExtensionFieldNames(customerKey));

                if(cols != null) {
            
                    while (moreData) {

                        moreData = false;

                        req = (reqID == null) ? this.api.retrieve('DataExtensionObject['+customerKey+']', cols, filter) : this.api.getNextBatch('DataExtensionObject['+customerKey+']', reqID);

                        if( req.Status == 'OK' || req.Status == 'MoreDataAvailable' ) {
                            moreData = (retrieveAll) ? req.HasMoreRows : false;
                            reqID = req.RequestID;
                            var r = req.Results;
                            for (k = 0; k < r.length; k++) {
                                var o = {};
                                var p = r[k].Properties;
                                for (var i = 0; i < p.length; i++) {
                                    var n = p[i].Name;
                                    var v = p[i].Value;
                                    o[n] = v;
                                }
                                a.push(o);
                            }
                        } else {
                            debug('(retrieveDataExtensionRecords)\n\tError: '+req);
                            return req;
                        }
                    }
                    debug('(retrieveDataExtensionRecords)\n\tOK: Retrieved '+a.length+' records');
                    req.Results = a;
                    return req;
                } else {
                    return {Status: 'Error: Cannot find DataExtension field names with id: '+id, Results: []};
                }
            } else {
                return {Status: 'Error: Cannot find DataExtension with id: '+id, Results: []};
            }
        };

        /** 
         * Update or Add one or multiple records inside a DataExtension.
         *
         * Update only works with a Primary Key (PK) on the given DataExtension.
         * To avoid the cumbersome Name-Value pair structure, the data 
         * object will be converted.
         * Expecting the following sample object:
         * <pre>
         * {
         *      Firstname: "John",
         *      Lastname: "Peter"
         * }.
         * </pre>
         *
         * @param {string}  id      The identifier for the DataExtension. Name or customerKey.
         * @param {array}   data    An array of Objects with data to add.
         *
         * @returns {boolean}
         *
         * @example
         * // update or add 1 record in DataExtension with name "MyDataExtension"
         * var prox = new wsproxy();
         * var resp = prox.upsertDataExtensionRecords('MyDataExtension',[
         *     {SubscriberKey:"123-345-123",Firstname:"John",Lastname:"Smith"}
         * ]);
         */
        this.upsertDataExtensionRecords = function(id,data) {
            var customerKey = this.retrieveDataExtensionCustomerKey(id);
            if( customerKey ) {

                var options = {SaveOptions: [{PropertyName:'*',SaveAction: 'UpdateAdd'}]};

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
                    var req = this.api.updateBatch('DataExtensionObject', payload, options);

                    if( req.Status == 'OK' ) {
                        debug('(upsertDataExtensionRecord)\n\tOK: '+data.length+' Record has been updated / added in DataExtension '+id);
                        return true;
                    } else {
                        debug('(upsertDataExtensionRecord)\n\tError: '+Stringify(req));
                        return false;
                    }

                } catch(e) {
                    debug('(upsertDataExtensionRecord)\n\t'+Stringify(e));
                    return false;     
                }

            } else {
                return false;
            }
        };

        /**
         * Delete one or multiple records inside a DataExtension. 
         *
         * To avoid the cumbersome Name-Value pair structure, the data 
         * object will be converted. Expecting the following sample object:
         * <pre>
         * {
         *      PrimaryKey: "john.peter@gmail.com"
         * }.
         * </pre>
         * 
         * @param {string}  id      The identifier for the DataExtension. Name or customerKey.
         * @param {array}   data    An array of objects with primary keys to identifier the records to delete.
         *
         * @returns {boolean}
         *
         * @example
         * // delete one record in 'MyDataExtension' with the PrimaryKey: 'SubscrinberKey' equals '123-345-123' 
         * var prox = new wsproxy();
         * var resp = prox.deleteDataExtensionRecords('MyDataExtension', [{ SubscriberKey: "123-345-123" }] )
         */
        this.deleteDataExtensionRecords = function(id,data) {
            var customerKey = this.retrieveDataExtensionCustomerKey(id);
            if( customerKey ) {

                var payload = [];
                for (var i = 0; i < data.length; i++) {
                    var keys = [];
                    for(var k in data[i]) {
                        keys.push({Name:k, Value: data[i][k]});
                    }
                    payload.push({ CustomerKey: customerKey, Keys: keys });
                }

                var req = this.api.deleteBatch("DataExtensionObject", payload);

                if( req.Status == 'OK' ) {
                    debug('(deleteDataExtensionRecord)\n\tOK: '+data.length+' Record(s) have been deleted in DataExtension '+id );
                    return true;
                } else {
                    debug('(deleteDataExtensionRecord)\n\tError: '+Stringify(req));
                    return false;
                }
            } else {
                return false;
            }
        };



        // ============================== FIELDS ==============================


        /**
         * Create DataExtension fields within the DataExtension.
         *
         * A sampe field array required to generate the new field within the DataExtension
         * <pre>
         * [
         *    {
         *        "Name": "Text",
         *        "FieldType": "Text",
         *        "MaxLength": 50,
         *        "DefaultValue": "Hellow world"
         *    }
         * ]
         * </pre>
         *
         * For a full and up to date list of available field types, 
         * visit Salesforce Marketing Cloud documantation.
         * 
         * @param {string}  id      The identifier for the DataExtension. Name or customerKey
         * @param {array}   fields  Fields to be created within the DataExtension.
         *
         * @returns {boolean}
         *
         * @example
         * // create a field in the DataExtension 'MyDataExtension'
         * var prox = new wsproxy();
         * var fields = [{
         *          Name: "Firstname",
         *          FieldType: "Text",
         *          MaxLength: 100
         *      }];
         * var resp = prox.createDataExtensionFields('MyDataExtension', fields);
         */
        this.createDataExtensionFields = function(id,fields) {
            var customerKey = this.retrieveDataExtensionCustomerKey(id);
            if( customerKey != null ) {

                var req = this.api.updateItem('DataExtension', {
                    "CustomerKey": customerKey,
                    "Fields": fields
                });
                
                if( req.Status == 'OK' && req.Results.length > 0) {
                    debug('(createDataExtensionFields)\n\tFields created for DataExtension '+customerKey);
                } else {
                    debug('(createDataExtensionFields)\n\tError: '+ Stringify(req));
                }
                return req;

            } else {
                return {Status: 'Error: Cannot find DataExtension with id: '+id, Results: []};
            }
        };

        /**
         * Retrieve a list of all Fields for the given DataExtension.
         *
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveDataExtensionFields = function(id) {
            var cols = this.retrievableCols('DataExtensionField'),
                customerKey = this.retrieveDataExtensionCustomerKey(id);
            if( customerKey != null ) {

                var req = this.api.retrieve("DataExtensionField", cols, {
                    Property: "DataExtension.CustomerKey",
                    SimpleOperator: "equals",
                    Value: customerKey
                });

                if( req.Status == 'OK' && req.Results.length > 0) {
                    debug('(retrieveFields)\n\tOK: Retrieved fields for DataExtension '+customerKey);
                } else {
                    debug('(retrieveFields)\n\tError: '+ Stringify(req));
                }
                return req;
            } else {
                return {Status: 'Error: Cannot find DataExtension with id: '+id, Results: []};
            }
        };

        /**
         * Retrieve the field names of a DataExtension.
         * 
         * @param {string}  id  The identifier for the DataExtension. Name or customerKey
         *
         * @returns {array|NULL}  An array of field names or NULL
         */
        this.retrieveDataExtensionFieldNames = function(id) {
            var req = this.retrieveDataExtensionFields(id),
                res = [];

            if( req.Status == 'OK' && req.Results.length > 0 ) {
                for (var i = 0; i < req.Results.length; i++) {
                    res.push(req.Results[i].Name);
                }
                debug('(retrieveDataExtensionFieldNames))\n\tOK: Retrieved field names for DataExtension '+id);
                return res;
            } else {
                debug('(retrieveDataExtensionFieldNames)\n\tError: Cannot retrieve field names for DataExtension '+id);
                return null;
            }
        };

        /**
         * Retrieves a single field property of a DataExtension.
         *
         * @param {string}  id          The identifier for the DataExtension. Name or customerKey
         * @param {string}  fieldName   The field name to retrieve the property for
         * @param {string}  property    The property to retrieve
         *
         * @returns {string|NULL} The porperty value for the given field name inside the DataExtension
         */
        this.retrieveDataExtensionFieldProperty = function(id,fieldName,property) {
            var req = this.retrieveDataExtensionFields(id);

            if( req.Status == 'OK' && req.Results.length > 0 && property ) {
                for (var i = 0; i < req.Results.length; i++) {
                    if( req.Results[i].Name == fieldName && req.Results[i].hasOwnProperty(property) ) {
                        debug('(retrieveDataExtensionFieldProperty'+property+')\n\tOK: Retrieved field '+property+' for field '+fieldName+' in DataExtension '+id);
                        return req.Results[i][property];
                    }
                }
            }
            debug('(retrieveDataExtensionFieldProperty'+property+')\n\tError: Cannot retrieve Field '+property+' for field '+fieldName+' in DataExtension '+id);
            return null;
        };

        /**
         * Retrieve the CustomerKey of the given DataExtension and field name.
         * 
         * @param {string}  id          The identifier for the DataExtension. Name or customerKey
         * @param {string}  fieldName   The field name to retrieve the CustomerKey for
         *
         * @returns {string|NULL}  The CustomerKey or NULL
         */
        this.retrieveDataExtensionFieldCustomerKey = function(id,fieldName) { return this.retrieveDataExtensionFieldProperty(id,fieldName,'CustomerKey'); };

        /**
         * Retrieve the ObjectID of the given DataExtension and field name.
         * 
         * @param {string}  id          The identifier for the DataExtension. Name or customerKey
         * @param {string}  fieldName   The field name to retrieve the ObjectID for
         *
         * @returns {string|NULL}  The ObjectID or NULL
         */
        this.retrieveDataExtensionFieldObjectID = function(id,fieldName) { return this.retrieveDataExtensionFieldProperty(id,fieldName,'ObjectID'); };

        /** future release */
        this.deleteDataExtensionField = function() {};

        /** future release */
        this.updateDataExtensionField = function() {};



        // ============================== FOLDERS ==============================


        /**
         * Create a folder under a parent folder.
         *
         * @param {string}          name                Name of the new folder.
         * @param {string}          description         Brief description of the new folder
         * @param {string|number}   [parentFolderId=0]  Name or ID of the parent folder. The parentFolderId determines
         *                                              the contentType of the folder. Default is DataExtension.
         *
         * @returns {object} Result set of the request.
         */
        this.createDataFolder = function(name,description,parentFolderId) {
            var parentFolderId = (typeof parentFolderId != 'string' && !Number.isInteger(parentFolderId)) ? this.settings.folderId['Data Extensions'] : parentFolderId,
                req = this.retrieveDataFolder(parentFolderId);

            if( req.Status == 'OK' && req.Results.length == 1 ) {
                parentFolderId = req.Results[0].ID;
                var contentType = req.Results[0].ContentType,
                    parentFolderName = req.Results[0].Name;
                
                if( parentFolderId != null && contentType != null ) {
                    req = this.api.createItem("DataFolder", {
                        Name: name,
                        Description: description,
                        ParentFolder: {
                            ID : parentFolderId,
                            IDSpecified: true
                        },
                        ContentType: contentType,
                        IsActive: true,
                        IsEditable: true,
                        AllowChildren: true
                    });  

                    if( req.Status == 'OK' && req.Results[0].length > 0) {
                        debug('(createDataFolder)\n\tOK: '+contentType.charAt(0).toUpperCase() + contentType.slice(1) + ' folder '+name+' has been created in '+parentFolderName+'\n\t\tNewID: '+req.Results[0].NewID+'\n\t\tNewObjectID: '+req.Results[0].NewObjectID);
                    } else {
                        if( req.Results[0].StatusMessage) {
                            debug('(createDataFolder)\n\t'+req.Results[0].StatusCode +': '+ req.Results[0].StatusMessage);    
                        } else {
                            debug('(createDataFolder)\n\t'+req.Status);
                        }                    
                    }
                    return req;
                } else {
                    req.Status = 'Error: Failed to retrieve parent folder informations for: '+parentFolderId;
                    debug('(createDataFolder)\n\t'+req.Status);
                    return req;
                }
            } else {
                if(req.Results.length > 1) {
                    req.Status = 'Error: There are more than one folders with the parentFolderId '+parentFolderId+'. Cannot retrieve parentFolderContentType';
                } else {
                    req.Status = 'Error: Cannot retrieve parent folder '+parentFolderId;
                }
                debug('(createDataFolder)\n\t'+req.Status);
                return req;
            }
        };

        /**
         * Retrieve folder informations.
         *
         * <b>Attention:</b> Folder names are not unique. If multiple folder were found, 
         * resp.Status returns OK. Each folder will create an array entry in the resp.Result set.
         * To identify multiple folders use resp.Result.length > 1 and act accordantly.
         * This will not occur when passing the folder id as parameter.
         *
         * @param {string|number}  id  The identifier for the folder. Name or Folder Id
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * // retrive data folder information for the folder id 'Data Extensions'
         * var prox = new wsproxy();
         * var resp = prox.retrieveDataFolder('Data Extensions');
         */
        this.retrieveDataFolder = function(id) {
            var cols = this.retrievableCols('DataFolder'),
                property = ( Number.isInteger(id) ) ? "ID" : "Name",
                req = this.api.retrieve("DataFolder", cols, { Property: property, SimpleOperator: "equals", Value: id }),
                msg = '',
                res = req.Results;

            // more than 1 dataFolder?
            if( res.length > 1 ) {
                debug('(retrieveDataFolder)\n\tOK: Found multiple folders with the same name: '+id);
                for(var k=0; k<res.length; k++) {
                    debug('\tFolder #'+k+'\n\t\tParentFolder ID: '+res[k].ParentFolder.ID+'\n\t\tParentFolder Name: '+res[k].ParentFolder.Name+'\n\t\tId: '+res[k].ID+'\n\t\tObjectId: '+res[k].ObjectID+'\n\t\tContentType: '+res[k].ContentType);
                }

            // no result = no folder
            } else if( res.length <= 0 ) {
                req = {Status: 'Error: Cannot find folder '+property+': '+id, Results: []};
                debug('(retrieveDataFolder)\n\t' + req.Status);
                
            // all OK
            } else {
                debug('(retrieveDataFolder)\n\tOK: Retrieved folder '+id);
            }
            return req;
        };

        /**
         * Retrieves all DataFolders for a given contentType.
         *
         * @param {object}      [filter]                    SFMC filter.
         * @param {object}      [opts]                      Specifies the properties on the RetrieveOptions on the request.
         * @param {object}      [props]                     Specifies any remaining properties to set on the request. These 
         *                                                  properties include “QueryAllAccounts”, “RepeatLastResult”, “RepeatAllSinceLastBatch”, and so on.
         * @param {boolean}     [retrieveAll=false]         Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         * 
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/datafolder.htm|DataFolders}
         *
         * @example
         * // Retrieve every DataFolder with a parent folder ID is equal to 123 and limit the result by 2
         * var prox = new wsproxy();
         * var resp = prox.retrieveDataFolders(
         *     {
         *         Property:"ParentFolder.ID", 
         *         SimpleOperator: "equals", 
         *         Value: 123
         *     },{BatchSize:2}
         * );
         */
        this.retrieveDataFolders = function(filter,opts,props,retrieveAll) {
            var cols = this.retrievableCols('DataFolder'),
                a = [],
                moreData = true,
                reqID = null,
                req = null;

            // more than 2,500 records?
            while (moreData) {

                moreData = false;

                // first call? Otherwise use next batch
                req = (reqID == null) ? req = this.api.retrieve("DataFolder", cols, filter, opts, props) : req = this.api.getNextBatch("DataFolder", reqID);

                // request has data returned
                if( req.Status == 'OK' || req.Status == 'MoreDataAvailable' ) {
                    moreData = (retrieveAll == true) ? req.HasMoreRows : false;
                    reqID = req.RequestID;
                    var r = req.Results;
                    for(var k=0; k<r.length; k++) {
                        a.push(r[k]);
                    }

                } else {
                    debug('(retrieveDataFolders)\n\tError: '+req);
                    return req;
                }
            }
            req.Results = a;
            return req;
        };

        /**
         * Retrieves the folder path for the requested object.
         *
         * @param {string}      customerKey                 The CustomerKey for the object to retrieve the folder path for.
         * @param {string}      [objectType=DataExtension]  The SOAP ObjectType.
         *
         * @returns {string|NULL} The folder path or NULL.
         *
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/web_service_guide.htm|SOAP Objects}
         */
        this.retrieveDataFolderPath = function(customerKey,objectType) {
            var object = (typeof objectType == 'string') ? objectType : 'DataExtension',
                cols = this.retrievableCols(object);

            var req = this.api.retrieve(object, cols, {
                Property: "CustomerKey",
                SimpleOperator: "equals",
                Value: customerKey
            });

            // retrieve can return 0 Results with Status OK or Status Error
            if( req.Results[0].CategoryID != null ) {
                var name = req.Results[0].Name,
                    id = req.Results[0].CategoryID,
                    list = [];

                while(id > 0) {
                    // this should never fail as it is based of the SFMC folder hierarchy
                    var r = this.retrieveDataFolder(id);
                    list.unshift(r.Results[0].Name);
                    id = r.Results[0].ParentFolder.ID;
                }
                var folderPath = list.join("/");
                debug('(retrieveDataFolderPath)\n\tOK: Folder path for '+object+' '+customerKey+': '+folderPath);
                return folderPath;

            } else {
                if( req.Status == 'Error' ) {
                    debug('(retrieveDataFolderPath)\n\t'+req.Status);
                } else {
                    debug('(retrieveDataFolderPath)\n\tError: '+object+' with CustomerKey '+customerKey+' could not be found');
                }
            }
            return null;
        };

        /**
         * Retrieves a property for a folder.
         *
         * @param {string|number}   id          The identifier for the folder. Name or FolderId
         * @param {string}          property    The property to retrieve
         *
         * @return {string|NULL}  The folder property or NULL
         */
        this.retrieveDataFolderProperty = function(id,property) {
            var req = this.retrieveDataFolder(id),
                propertyValue = req.Results[0][property];

            // result must be exact 1 otherwise multiple folders were found
            if( req.Status == 'OK' && req.Results.length == 1 && propertyValue ) {
                debug('(retrieveDataFolderProperty'+property+')\n\tOK: Folder '+property+' for folder '+id+': '+propertyValue );
                return propertyValue;
            } else {
                if(req.Results.length > 1) {
                    debug('(retrieveDataFolderProperty)\n\tError: There are more than one folder with the same name '+id+'. Cannot retrieve Folder '+property);
                } else {
                    debug('(retrieveDataFolderProperty'+property+')\n\tError: Cannot retrieve Folder '+property+' for folder '+id);   
                }
                return null;
            }
        };

        /**
         * Retrieves the folderId.
         *
         * @param {string}  name    Name of the folder.
         *
         * @return {number|NULL}  The folderId or null
         */
        this.retrieveDataFolderID = function(name) { return this.retrieveDataFolderProperty(name,'ID'); };

        /**
         * Retrieves the folder Name.
         *
         * @param {string|number}  id  The identifier for the folder. Name or folderId
         *
         * @return {string|NULL}  The folder name or NULL
         */
        this.retrieveDataFolderName = function(id) { return this.retrieveDataFolderProperty(id,'Name'); };

        /**
         * Retrieves the folder ObjectID.
         *
         * @param {string|number}  id  The identifier for the folder. Name or folderId
         *
         * @return {string|NULL}  The ObjectID or NULL
         */
        this.retrieveDataFolderObjectID = function(id) { return this.retrieveDataFolderProperty(id,'ObjectID'); };

        /**
         * Retrieves the folder ContentType.
         *
         * @param {string|number}  id  The identifier for the folder. Name or folderId
         *
         * @return {string|NULL}  The ContentType or NULL
         */
        this.retrieveDataFolderContentType = function(id) { return this.retrieveDataFolderProperty(id,'ContentType'); };

        /**
         * Retrieves the folder CustomerKey.
         *
         * @param {string|number}  id  The identifier for the folder. Name or folderId
         *
         * @return {string|NULL}  The CustomerKey or NULL
         */
        this.retrieveDataFolderCustomerKey = function(id) { return (isCustomerKey(id)) ? id : this.retrieveDataFolderProperty(id,'CustomerKey'); };

        /**
         * Delete a folder.
         *
         * @param {string|number}  id  The identifier for the folder. Name as string or folder ID as integer.
         *
         * @returns {boolean}
         */
        this.deleteDataFolder = function(id) {
            var objectId = this.retrieveDataFolderObjectID(id);

            // if object id cannot be found - stop delete process.
            if( objectId == null ) {
                return false;
            }

            // is folder empty?
            if( !this.isDataFolderEmpty(id) ) {
                debug('(deleteDataFolder)\n\tError: Folder is not empty: '+id);
                return false;
            }

            // execute delete
            var req = this.api.deleteItem("DataFolder", { "ObjectID": objectId });
            if (req.Status == 'OK') {
                debug('(deleteDataFolder)\n\tOK: Delete DataFolder folder '+id);
                return true;
            } else {
                debug('(deleteDataFolder)\n\t'+req.Status);
                return false;
            }
        };

        /**
         * Check if a folder exists
         *
         * @param {string|number}  id  The identifier for the folder. Name or folderId
         *
         * @returns {boolean}
         */
        this.isDataFolder = function(id){
            var req = this.retrieveDataFolder(id);
            return (req.Status == 'OK' || ( req.Status == 'Error' && req.Results[0].length > 0 )) ? true : false;
        };

        /**
         * Check if a folder is empty based on contentType.
         *
         * In order to determine if a data folder is empty, it is necessary to retrieve
         * all objects with the same parent folderId as the requested folderId.
         * This requires an allocation between the contentType of the folder and the required
         * object. There is no such allocation and an object map has been created inside this method.
         * 
         * @todo Extend 'contentTypeObjectMap' with more dataFolderContentType and object allocation.
         * @todo Problem with contentType Asset as search for asset objects cannot be based soley on CategoryId but requires valuetType.
         *
         * @param {string|number}  id  The identifier for the folder. Name or folderId.
         *
         * @returns {boolean}
         *
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/datafolder.htm|DataFolders}
         */
        this.isDataFolderEmpty = function(id) {
            var contentTypeObjectMap = {
                dataextension: 'DataExtension',
                triggered_send: 'TriggeredSendDefinition',
                queryactivity: 'QueryDefinition',
                asset: 'Asset',
                automations: 'Automation',
                email: 'Email',
                ABTest: '',
                automated_email: '',
                BuildAudienceActivity: '',
                campaign: '',
                condensedlpview: '',
                content: '',
                contextual_suppression_list: '',
                document: '',
                ELTactivity: '',
                email_hidden_messagemodel: '',
                filteractivity: '',
                filterdefinition: '',
                global_email: '',
                global_email_sub: '',
                group: '',
                Hidden: '',
                image: '',
                job: '',
                list: '',
                livecontent: '',
                measure: '',
                media: '',
                message: '',
                microsite: '',
                micrositelayout: '',
                mysubs: '',
                organization: '',
                playbooks: '',
                programs2: '',
                publication: '',
                salesforcedataextension: '',
                salesforcesends: '',
                salesforcesendsv5: '',
                shared_content: '',
                shared_contextual_suppression_list: '',
                shared_data: '',
                shared_dataextension: '',
                shared_email: '',
                shared_item: '',
                shared_portfolio: '',
                shared_publication: '',
                shared_salesforcedataextension: '',
                shared_suppression_list: '',
                shared_survey: '',
                shared_template: '',
                ssjsactivity: '',
                suppression_list: '',
                survey: '',
                synchronizeddataextension: '',
                template: '',
                triggered_send_journeybuilder: '',
                userinitiatedsends: '' 
            };

            var req = this.retrieveDataFolder(id);

            // is there more than one folder with the same ID?
            if( req.Results.length > 1 ) {
                debug('(isDataFolderEmpty)\n\tInfo: There are more than one folder with the same name '+id+'. Cannot determine if folder is empty.');
                return false;
            }

            var categoryID = req.Results[0].ID,
                contentType = req.Results[0].ContentType,
                name = (res.Results[0].Name) ? (res.Results[0].Name) : id,
                retrieveObject = contentTypeObjectMap[contentType];

            // if categoryID is not an integer, folder does not exits ergo it is empty
            if( !Number.isInteger(categoryID)) {
                debug('(isDataFolderEmpty)\n\tInfo: Cannot retrieve Folder categoryID for id: '+id);
                return true;
            }

            // find subfolder with same contentType
            req = this.retrieveDataFolders({
                Property:"ParentFolder.ID", 
                SimpleOperator: "equals", 
                Value: categoryID
            },{BatchSize:2});

            if( req.Results.length > 0  ) {
                debug('(isDataFolderEmpty)\n\tInfo: Folder '+name+' contains subfolders');
                return false;
            } else {
                debug('(isDataFolderEmpty)\n\tInfo: Folder '+name+' has no subfolders');
            }

            // verify that we have a respective object to call
            if( !retrieveObject) {
                throw '(isDataFolderEmpty)\n\tError: Unknown retrieveObject for contentType: '+contentType+ '. Cannot determine if folder is empty';
            }

            // search for objects in folder
            debug('(isDataFolderEmpty)\n\tInfo: Retrieve '+retrieveObject+'s for folder '+name);
            req = this.api.retrieve(retrieveObject,['ObjectID'],{ 
                Property:"CategoryID", 
                SimpleOperator: "equals", 
                Value: categoryID
            });
            
            if( req.Status == 'OK' && req.Results.length <= 0  ) {
                debug('(isDataFolderEmpty)\n\tInfo: Folder '+name+' is empty');
                return true;
            } else if( req.Status == 'OK' && req.Results.length > 0  ) {
                debug('(isDataFolderEmpty)\n\tInfo: Folder '+name+' is not empty');
                return false;
            } else {
                // @todo: find workaround for this problem
                if( contentType == 'asset' ) {
                    throw '(isDataFolderEmpty)\n\tError: Cannot search object inside folder of contentType: '+contentType+'. Requires workaround: '+Stringify(req);    
                } else {
                    throw '(isDataFolderEmpty)\n\tError: Something went wrong for folder '+name+'. Cannot determine if folder is empty: '+Stringify(req);    
                }
            }
        };

        /**
         * Rename a folder
         *
         * @param {string|number}   id          The identifier for the folder. Name or folderId.
         * @param {string}          newName     The new folder name
         *
         * returns {boolean}
         */
        this.renameDataFolder = function(id, newName) {
            var objectId = this.retrieveDataFolderObjectID(id);
            if( typeof objectId == 'string' ) {
                var req = this.api.updateItem("DataFolder", { 
                    ObjectID: objectId, 
                    Name: newName 
                });

                if( req.Status == 'OK' && req.Results.length > 0 ) {
                    debug('(renameDataFolder)\n\tOK: Sucessfully renamed DataFolder '+id+' to '+newName);
                    return true;
                } else {
                    debug('(renameDataFolder)\n\t'+req.Status);
                    return false;
                }
            } else {
                return false;
            }
        };
        
        /** future release */
        this.moveDataFolder = function() {};



        // ============================== SUBSCRIBER ==============================


        /**
         * Retrieve Subscriber records.
         *
         * By retrieving a subscriber, you can view the applicable information for that subscriber. 
         * You can include this information in a profile center or in your own application as part 
         * of a screen that displays subscriber information
         *
         * @param {object}      [filter=NULL]       SFMC filter object
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * // retrieve all Subscriber records where 'CreatedDate' is after '4th of January 2012'
         * var prox = new wsproxy();
         * var filter = {
         *     Property: "CreatedDate",
         *     SimpleOperator: "greaterThan",
         *     Value: "2012-01-04T10:19:00"
         * };
         * var resp = prox.retrieveSubscribers(filter, true)
         */
        this.retrieveSubscribers = function(filter,retrieveAll) {
            var a           = [],
                moreData    = true,
                reqID       = null,
                req         = null,        
                cols        = this.retrievableCols('Subscriber');

            while (moreData) {

                moreData = false;

                req = (reqID == null) ? this.api.retrieve('Subscriber', cols, filter) : this.api.getNextBatch('Subscriber', reqID);

                if( req.Status == 'OK' || req.Status == 'MoreDataAvailable' ) {
                    moreData = (retrieveAll) ? req.HasMoreRows : false;
                    reqID = req.RequestID;
                    var r = req.Results;
                    for (var i = 0; i < r.length; i++) {
                        a.push(r[i]);
                    }
                } else {
                    debug('(retrieveSubscribers)\n\tError: '+req);
                    return req;
                }
            }
            debug('(retrieveSubscribers)\n\tOK: Retrieved '+a.length+' records');
            req.Results = a;
            return req;
        };

        /**
         * Update a Subscriber record
         *
         * Updating an existing subscriber via the WSProxy allows you to 
         * better maintain your subscriber information while utilizing a 
         * tight integration with your system or development environment.
         *
         * @param {array} records   An array of objects with subscriber information.
         *
         * @returns {boolean}
         *
         * @example
         * // update a record
         * var prox = new wsproxy();
         * var resp = prox.upsertSubscriberRecords([
         *      {
         *          Email: 'info@email360.io',
         *          SubscriberKey: 'SomeUniqueKey',
         *              Attributes: {
         *                  "First Name": 'John',
         *                  "Last Name": 'Doe'
         *              }
         *      }
         * ]);
         */
        this.upsertSubscriberRecords = function(records) {
            var options = {SaveOptions: [{PropertyName:'*',SaveAction: 'UpdateAdd'}]};

            // convert object into Name-Value pair
            var payload = [];
            // iterate over each redcord
            for (var i = 0; i < records.length; i++) {
                if( !records[i].SubscriberKey || !records[i].EmailAddress ) {
                    continue;
                }
                var atr = [];
                // add attributes if given
                for(var k in records[i].Attributes) {
                    atr.push({Name:k, Value: records[i].Attributes[k]});
                }
                payload.push({ EmailAddress: records[i].EmailAddress, SubscriberKey: records[i].SubscriberKey, Attributes: atr });
            }

            try {
                var req = this.api.updateBatch('Subscriber', payload, options);

                if( req.Status == 'OK' ) {
                    debug('(upsertSubscriberRecords)\n\tOK: '+records.length+' Records has been updated / added in Subscriber');
                    return true;
                } else {
                    debug('(upsertSubscriberRecords)\n\t'+Stringify(req));
                    return false;
                }

            } catch(e) {
                debug('(upsertSubscriberRecords)\n\t'+Stringify(e));
                return false;     
            }
        };

        /**
         * Delete one or multiple records from Subscribers.
         *
         * If you wish to entirely remove a subscriber from your account, you can 
         * use this call to delete the subscriber's information.
         * 
         * You don't need to delete a subscriber's information from your account in 
         * order to unsubscribe that subscriber from an email list. Use this call only 
         * when you wish to totally remove a subscriber's information from your account.
         * 
         * When you delete a subscriber, your account also loses all tracking information 
         * related to that subscriber and a new instance of that subscriber could be added 
         * to lists from which that subscriber has previously unsubscribed. For this reason, 
         * Marketing Cloud recommends editing subscribers to an unsubscribed status rather 
         * than deleting that subscriber.
         *
         * @param {array}  records   An array of objects to identify the Subscriber. EmailAddress or SubscriberKey
         *
         * @returns {boolean}
         *
         * @sample
         * // delete two record inside Subscribers using SubscriberKey
         * var prox = new wsproxy();
         * var resp = prox.deleteSubscriberRecords([
         *     { SubscriberKey: 'UniqueKeyIfFeatureIsEnabled' },
         *     { SubscriberKey: 'info@email360.io' }       
         * ]);
         *
         * // deleting one record inside Subscriber using EmailAddress as unique identifier
         * var resp = prox.deleteSubscriberRecords([
         *     { EmailAddress: 'info@email360.io' }       
         * ]);
         */
        this.deleteSubscriberRecords = function(records) {
            var req = this.api.deleteBatch("Subscriber", records);

            if( req.Status == 'OK' ) {
                debug('(deleteSubscriberRecords)\n\tOK: '+records.length+' Record(s) have been deleted in Subscriber' );
                return true;
            } else {
                debug('(deleteSubscriberRecords)\n\t'+Stringify(req));
                return false;
            }
        };



        // ============================== TRACKING EVENTS ==============================


        /**
         * Retrieve Tracking Data
         *
         * In most production implementations, data volume in the account requires you to include specific JobIDs in the filter criteria of the request. 
         * If requests that don’t specify a JobID time out during processing, add a JobID in the filter. If specifying a JobID is not possible, 
         * or if your implementation requires a broad range of JobIDs, use a data extract-based procedure instead.
         * 
         * @param {string}      [trackingEvent=SentEvent]   The event type: SentEvent, OpenEvent, ClickEvent, BounceEvent or UnsubEvent.
         * @param {object}      [filter]                    SFMC filter.
         * @param {boolean}     [retrieveAll=false]         Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveTrackingEvent = function(trackingEvent,filter,retrieveAll) {
            var cols = this.retrievableCols(trackingEvent),
                a = [],
                moreData = true,
                reqID = null,
                req = null;

            while (moreData) {

                moreData = false;

                req = (reqID == null) ? req = this.api.retrieve(trackingEvent, cols, filter) : req = this.api.getNextBatch(trackingEvent, reqID);

                if( req.Status == 'OK' || req.Status == 'MoreDataAvailable' ) {
                    moreData = (retrieveAll) ? req.HasMoreRows : false;
                    reqID = req.RequestID;
                    var r = req.Results;
                    for (var k = 0; k < r.length; k++) {
                        a.push(r[k]);
                    }
                } else {
                    debug('(retrieveTrackingEvent)\n\tError: '+req);
                    return req;
                }
            }
            debug('(retrieveTrackingEvent)\n\tOK: Retrieved '+a.length+' '+trackingEvent+' rows');
            req.Results = a;
            return req;
        };

        /**
         * Retrieve Tracking Data for the OpenEvent
         *
         * @param {object}      [filter]            SFMC filter.
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveOpenEvent = function(filter,retrieveAll) { return this.retrieveTrackingEvent('OpenEvent',filter,retrieveAll); };

        /**
         * Retrieve Tracking Data for the ClickEvent
         *
         * @param {object}      [filter]            SFMC filter.
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveClickEvent = function(filter,retrieveAll) { return this.retrieveTrackingEvent('ClickEvent',filter,retrieveAll); };

        /**
         * Retrieve Tracking Data for the BounceEvent
         *
         * @param {object}      [filter]            SFMC filter.
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveBounceEvent = function(filter,retrieveAll) { return this.retrieveTrackingEvent('BounceEvent',filter,retrieveAll); };

        /**
         * Retrieve Tracking Data for the UnsubEvent
         *
         * @param {object}      [filter]            SFMC filter.
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveUnsubEvent = function(filter,retrieveAll) { return this.retrieveTrackingEvent('UnsubEvent',filter,retrieveAll); };    



        // ============================== AUTOMATION ==============================


        /**
         * Retrieve information about an Automation
         *
         * @param {string}  id  The identifier for the Automation. Name or CustomerKey.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveAutomation = function(id) {
            var cols =  this.retrievableCols('Automation'),
                property = ['Name','CustomerKey'],
                req = {};

            for (var i = 0; i < 2; i++) {
                req = this.api.retrieve("Automation", ['*'], { 
                    Property: property[i], 
                    SimpleOperator: "equals", 
                    Value: id
                });

                // found the automation
                if( req.Status == 'OK' && req.Results.length > 0 && req.Results[0].ObjectID !== null ) {
                    
                    // get the automation tasks. @see: https://salesforce.stackexchange.com/questions/251844/retrieve-multiple-tasks-in-an-automation-via-api/
                    var res = this.api.retrieve("Activity", this.retrievableCols('Activity'), { 
                            Property: "Program.ObjectID", 
                            SimpleOperator: "equals", 
                            Value: req.Results[0].ObjectID 
                        });

                    if( res.Status == 'OK' && res.Results.length > 0 ) {
                        req.Results[0].AutomationTasks = [];
                        for (var n = 0; n < res.Results.length; n++) {
                            req.Results[0].AutomationTasks.push(this.retrievableColsValues(this.retrievableCols('Activity'),res.Results[i]));
                        }
                    }

                    debug('(retrieveAutomation)\n\tOK: Retrieve Automation with '+property[i]+': '+id);
                    return req;
                }
            }
            req.Status = 'Error: Failed to retrieve Automation: '+id;
            debug('(retrieveAutomation)\n\t' + req.Status);
            return req;
        };

        /**
         * Retrieve a list of all Automation(s) in the business unit.
         *
         * @param {object}      [filter]            SFMC filter.
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveAutomations = function(filter,retrieveAll) {
            var cols = this.retrievableCols('Automation'),
                a = [],
                // The only supported operators for the Automation object are: IN, EQUALS. Complex filter is not supported.
                // https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/automation.htm
                f = {Property:"Status", SimpleOperator:"IN", Value:[-1,0,1,2,3,4,5,6,7,8]},
                moreData = true,
                reqID = null,
                req = null;

            // additional filter rules?
            f = (filter) ? { LeftOperand: f, LogicalOperator: "AND", RightOperand: filter } : f;

            while (moreData) {

                moreData = false;

                req = (reqID == null) ? req = this.api.retrieve("Automation", cols, f) : req = this.api.getNextBatch("Automation", reqID);

                if( (req.Status == 'OK' || req.Status == 'MoreDataAvailable') && req.Results[0].ObjectID !== null ) {
                    moreData = (retrieveAll) ? req.HasMoreRows : false;
                    reqID = req.RequestID;
                    var r = req.Results;

                    // get the automation tasks. @see: https://salesforce.stackexchange.com/questions/251844/retrieve-multiple-tasks-in-an-automation-via-api/
                    var res = this.api.retrieve("Activity", this.retrievableCols('Activity'), { 
                            Property: "Program.ObjectID", 
                            SimpleOperator: "equals", 
                            Value: req.Results[0].ObjectID 
                        });

                    if( res.Status == 'OK' && res.Results.length > 0 ) {
                        req.Results[0].AutomationTasks = [];
                        for (var n = 0; n < res.Results.length; n++) {
                            req.Results[0].AutomationTasks.push(this.retrievableColsValues(this.retrievableCols('Activity'),res.Results[n]));
                        }
                    }

                } else {
                    debug('(retrieveAutomations)\n\tError: '+req);
                    return req;
                }
            }

            debug('(retrieveAutomation)\n\tOK: Retrieve Automations');
            return req;
        };

        /**
         * Trigger an automation
         *
         * @param {string}  id  The identifier for the Automation. Name or CustomerKey.
         *
         * @return {boolean}
         */
        this.triggerAutomation = function(id) {
            var req = this. retrieveAutomation(id);
            
            if( req.Status == 'OK' && req.Results.length > 0 ) {

                var objectID = req.Results[0].ObjectID,
                    statusCode = req.Results[0].Status,
                    name = req.Results[0].Name;

                switch (statusCode) {
                    case 2:
                        req = this.api.performItem("Automation", { ObjectID: objectID }, "Start");
                        if( req.Status == 'OK' && req.Results.length > 0 ) {
                            debug('(triggerAutomation)\n\t Automation '+name+' successfully started');
                            return true;
                        } else {
                            debug('(triggerAutomation)\n\t'+req.Status);
                            return false;
                        }
                        break;
                    case 3:
                        debug('(triggerAutomation)\n\tError: Failed to start Automation '+name+' as it is already running');
                        return false;
                    default:
                        debug('(triggerAutomation)\n\tError: Failed to start Automation '+name+' with status code: ' + statusCode);
                        return false;
                }
            } else {
                debug('(triggerAutomation)\n\tError: Failed to start Automation '+id+'. Automation not found');
                return false;
            }
        };

        /**
         * Trigger an automation with a wait timer
         *
         * This call is helpful if you want to trigger an automation which may already be in progress,
         * but you need to ensure it starts as soon as it has finished.
         * If the automation already runs, the script will wait n milliseconds (sleep) and retry it
         * for the duration of x repetitions (repeat).
         *
         * The maximum duration is sleep * repeat.
         *
         * @param {string}  id      The identifier for the Automation. Name or CustomerKey.
         * @param {number}  repeat  A number of how many repetitions
         * @param {number}  sleep   A number in milliseconds of how long the script should wait.
         *
         * @return {boolean}
         *
         * @sample
         * // try to trigger the automation for 30 minutes (6 repeats times 5 minute sleep)
         * var prox = new wsproxy();
         * var resp = prox.triggerAutomationWait('MyAutomation',6,300000);
         */
        this.triggerAutomationWait = function(id,repeat,sleep) {
            // iterate as long as repeat
            for (var i = 1; i<repeat; i++) {

                this._toogleDebugMode();
                var req = this.retrieveAutomation(id),
                    objectID = req.Results[0].ObjectID,
                    statusCode = req.Results[0].Status,
                    name = req.Results[0].Name;
                this._toogleDebugMode();

                if( req.Status == 'OK' && req.Results.length > 0 ) {

                    switch (statusCode) {
                        case 2:
                            req = this.api.performItem("Automation", { ObjectID: objectID }, "Start");
                            if( req.Status == 'OK' && req.Results.length > 0 ) {
                                debug('(triggerAutomationWait)\n\t Automation '+name+' successfully started');
                                return true;
                            } else {
                                debug('(triggerAutomationWait)\n\t'+req.Status);
                                return false;
                            }
                            break;
                        case 3:
                            wait(sleep);
                            break;
                        default:
                            req.Status = 'Error: Failed to start Automation '+name+' with status code: ' + statusCode;
                            debug('(triggerAutomationWait)\n\t'+req.Status);
                            return false;
                    }

                } else {
                    req.Status = 'Error: Failed to start Automation '+id+'. Automation not found';
                    debug('(triggerAutomationWait)\n\t'+req.Status);
                    return false;
                }
            }
            debug('(triggerAutomationWait)\n\tError: Failed to start Automation '+id+'. as maximum time to execute has passed');
            return false;
        };

        /** future release */
        this.createAutomation = function() {};



        // ============================== QUERY DEFINITION ==============================


        /**
         * Creates a TSQL Query
         *
         * @param {string}          queryName           Name of the query
         * @param {string}          queryText           A valid TSQL statement
         * @param {string}          [updateType=Update] Update, Overwrite, Add
         * @param {string}          targetId            The identifier for the target DataExtension. Name or customerKey.
         * @param {string|number}   [folderId=Query]    The identifier for the folder. Name or Folder Id. Must be type of queryactivity
         *
         * @returns {object} Result set of the request.
         */
        this.createQueryDefinition = function(queryName,queryText,updateType,targetId,folderId) {
            var targetUpdateType = (updateType) ? updateType : 'Update',
                categoryId =(folderId) ? this.retrieveDataFolderID(folderId) : this.settings.folderId.Query;

            // folder must exists and be a type of "queryactivity"
            if( this.retrieveDataFolderContentType(categoryId) !== "queryactivity" ) {
                var r = {Status: 'Error: ContentType of Folder with folderId '+folderId+' is not a type of queryactivity', Results: []};
                debug('(createQueryDefinition)\n\t'+r.Status);
                return r;
            }

            // is target DataExtension
            var req = this.retrieveDataExtension(targetId);
            if( req.Status != 'OK' || req.Results[0].length <= 0 ) {
                return req;
            }

            var targetCustomerKey = req.Results[0].CustomerKey,
                targetName = req.Results[0].Name,
                def = {
                    Name: queryName,
                    CategoryID : categoryId,
                    CustomerKey: Platform.Function.GUID().toUpperCase(),
                    TargetUpdateType: targetUpdateType,
                    TargetType: "DE",
                    DataExtensionTarget: {
                        CustomerKey: targetCustomerKey,
                        Name: targetName
                    },
                    QueryText: queryText
                };

            // create query
            req = this.api.createItem("QueryDefinition", def);

            if( req.Status != 'OK' || req.Results[0].length <= 0 ) {
                debug('(createQueryDefinition)\n\t'+req.Results[0].StatusCode+': '+req.Results[0].StatusMessage);
            } else {
                debug('(createQueryDefinition)\n\tOK: Query Definition successfully created.\n\t\tObjectId: '+req.Results[0].Object.ObjectID+'\n\t\tCustomerKey: '+req.Results[0].Object.CustomerKey+'\n\t\tQuery Text: '+req.Results[0].Object.QueryText);
            }
            return req;
        };

        /**
         * Retrieve informations about a single QueryDefinition.
         * 
         * @param {string}  id  The identifier for the QueryDefinition. Name or CustomerKey.
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * // Retrieve informations about a sepcific QueryDefinition
         * var prox = new wsproxy();
         * var resp = prox.retrieveQueryDefinition('MySample');
         *
         * // using a customerKey
         * var resp = prox.retrieveQueryDefinition('53b54b8a-b604-4fc2-90x9-33eec99c8a93');
         */
        this.retrieveQueryDefinition = function(id) {
            var cols = this.retrievableCols('QueryDefinition'),
                property = ['Name','CustomerKey'],
                req = {};

            for (var i = 0; i < 2; i++) {
                req = this.api.retrieve("QueryDefinition", cols, { 
                    Property: property[i], 
                    SimpleOperator: "equals", 
                    Value: id 
                });

                if( req.Status == 'OK' && req.Results.length > 0 ) {
                    debug('(retrieveQueryDefinition)\n\tOK: Retrieve QueryDefinition with '+property[i]+': '+id);
                    return req;
                }
            }
            debug('(retrieveQueryDefinition)\n\t' + req.Status);
            return req;
        };

        /**
         * Retrieve a list of all QueryDefinition(s) in the business unit.
         *
         * @param {object}      [filter]            SFMC filter.
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveQueryDefinitions = function(filter,retrieveAll) {
            var cols = this.retrievableCols('QueryDefinition'),
                a = [],
                f = {Property:"CustomerKey", SimpleOperator:"isNotNull", Value:" "},
                moreData = true,
                reqID = null,
                req = null;

            // additional filter rules?
            f = (filter) ? { LeftOperand: f, LogicalOperator: "AND", RightOperand: filter } : f;

            while (moreData) {

                moreData = false;

                req = (reqID == null) ? req = this.api.retrieve("QueryDefinition", cols, f) : req = this.api.getNextBatch("QueryDefinition", reqID);

                if( req.Status == 'OK' || req.Status == 'MoreDataAvailable' ) {
                    moreData = (retrieveAll) ? req.HasMoreRows : false;
                    reqID = req.RequestID;
                    var r = req.Results;

                    for (var k = 0; k < r.length; k++) {
                        var o = {};
                        for (var i = 0; i < cols.length; i++) {
                            var v = cols[i];
                            o[v] = r[k][v];
                        }
                        a.push(o);
                    }
                } else {
                    debug('(retrieveQueryDefinitions)\n\tError: '+req);
                    return req;
                }
            }
            debug('(retrieveQueryDefinitions)\n\tOK: Retrieved '+a.length+' QueryDefinition');
            req.Results = a;
            return req;
        };

        /**
         * Retrieves a property of a QueryDefinition.
         *
         * @param {string}  id          The identifier for the QueryDefinition. Name or customerKey.
         * @param {string}  property    The property name to retrieve.
         *
         * @returns {string|NULL}  The QueryDefinition property or NULL
         */
        this.retrieveQueryDefinitionProperty = function(id,property) {
            var req = this.retrieveQueryDefinition(id),
                prop = req.Results[0][property];

            if( req.Status == 'OK' && req.Results.length == 1 && prop ) {
                debug('(retrieveQueryDefinition'+property+')\n\tOK: '+property+' for QueryDefinition '+id+': '+prop );
                return prop;
            } else {
                debug('(retrieveQueryDefinition'+property+')\n\tError: Cannot retrieve '+property+' for QueryDefinition: '+id);
                return null;
            }
        };

        /**
         * Retrieve the CustomerKey of the given QueryDefinition.
         * 
         * @param {string}  id  The name of the QueryDefinition.
         *
         * @returns {string|NULL}  The CustomerKey of the QueryDefinition or NULL
         */
        this.retrieveQueryDefinitionCustomerKey = function(id) { return (isCustomerKey(id)) ? id : this.retrieveQueryDefinitionProperty(id,'CustomerKey'); };

        /**
         * Retrieve the Name of the given QueryDefinition.
         * 
         * @param {string}  id  The customerKey of the QueryDefinition.
         *
         * @returns {string|NULL}  The Name of the QueryDefinition or NULL
         */
        this.retrieveQueryDefinitionName = function(id) { return this.retrieveQueryDefinitionProperty(id,'Name'); };

        /**
         * Retrieve the ObjectID of the given QueryDefinition.
         * 
         * @param {string}  id  The identifier for the QueryDefinition. Name or customerKey.
         *
         * @returns {string|NULL}  The ObjectID of the QueryDefinition or NULL
         */
        this.retrieveQueryDefinitionObjectID = function(id) { return this.retrieveQueryDefinitionProperty(id,'ObjectID'); };

        /**
         * Retrieve the CategoryID of the given QueryDefinition.
         * 
         * @param {string}  id  The identifier for the QueryDefinition. Name or customerKey.
         *
         * @returns {string|NULL}  The CategoryID of the QueryDefinition or NULL
         */
        this.retrieveQueryDefinitionCategoryID = function(id) { return this.retrieveQueryDefinitionProperty(id,'CategoryID'); };

        /**
         * Retrieve a list of all QueryDefinition Names.
         * 
         * @param {boolean} [retrieveAll=false]     Retrieve more than 2,500 records.
         *
         * @returns {string|NULL}  Array of all QueryDefinition Names or NULL.
         */
        this.retrieveQueryDefinitionNames = function(retrieveAll) {
            var res = [],
                req = this.retrieveQueryDefinitions(null,retrieveAll),
                r = req.Results;

            if( req.Status == 'OK' && r.length > 0) {
                for (var k = 0; k < r.length; k++) {
                    res.push(r[k].Name);
                }
                return res;
            }
            return null;
        };

        /**
         * Delete a QueryDefinition
         * 
         * @param {string}  id  The identifier for the QueryDefinition. Name or customerKey.
         *
         * @returns {boolean}
         */
        this.deleteQueryDefinition = function(id) {
            var req = this.retrieveQueryDefinition(id);

            if( req.Status == 'OK' && req.Results.length > 0 ) {

                try {   
                    var objectID = req.Results[0].ObjectID,
                        name = req.Results[0].Name,
                        res = this.api.deleteItem("QueryDefinition", { "ObjectID": objectID });

                    if( res.Status == 'OK' ) { 
                        debug('(deleteQueryDefinition)\n\tOK: QueryDefinition '+name+' deleted');
                        return true;
                    } else {
                        debug('(deleteQueryDefinition)\n\tError: '+Stringify(res));
                        return false;
                    }
                } catch(e) {
                    debug('(deleteQueryDefinition)\n\t'+Stringify(e));
                    return false;     
                }
            }
            return false;
        };

        /**
         * Execute a TSQL Query
         *
         * @param {string}  id  The identifier for the QueryDefinition. Name or customerKey.
         *
         * @returns {number|NULL} The task ID on success
         */
        this.performQueryDefinition = function(id) {
            var objectId = this.retrieveQueryDefinitionObjectID(id);

            if( typeof objectId !== 'string') {
                return null;
            }

            // execute QueryDefinition
            req = this.api.performItem("QueryDefinition",{ ObjectID: objectId },"Start");
        
            // QueryDefinition triggered failed
            if( req.Status != 'OK' && req.Results.length <= 0 ) {
                debug('(performQueryDefinition)\n\t'+req.Results[0].StatusCode+': '+req.Results[0].StatusMessage);
                return null;
            }

            if( req.Results[0].Task.StatusCode == 'OK' ) {
                var taskId = req.Results[0].Task.ID;
                debug('(performQueryDefinition)\n\tOK: Query triggered successfully with taskdid: '+taskId);
                return taskId;
            } else {
                debug('(performQueryDefinition)\n\t'+req.Results[0].Task.StatusCode+': '+req.Results[0].Task.StatusMessage);
                return null;
            }
        };

        /** 
         * Retrieve the status of a TSQL query after it has been executed
         *
         * @param {number} taskId   The taskId from a perfomQueryDefinition call
         * 
         * @returns {string|NULL} The task status on success
         */
        this.retrieveQueryDefinitionStatus = function(taskId) {
            var cols = this.retrievableCols('AsyncActivityStatus'),
                status = null,
                filter = {
                    Property: "TaskID",
                    SimpleOperator: "equals",
                    Value: taskId
                };

            var req = this.api.retrieve("AsyncActivityStatus", cols, filter),
                props = req.Results[0].Properties;

            /*
             * The position of the status value in the result object is determine 
             * by the position in the request cols array. As cols array can be dynamic,
             * the position value should not be hardcode but programatically retrieved.
             */
            for (var i = 0; i < props.length; i++) {
                if( props[i].Name == 'Status' ) {
                    status = props[i].Value;
                    break;
                }
            }
            
            if( typeof status == 'string' ) {
                debug('(retrieveQueryDefinitionStatus)\n\tOK: Status for QueryDefinition taskId '+taskId+': '+status);
                return status;
            } else {
                debug('(retrieveQueryDefinitionStatus)\n\tError: Status for QueryDefinition taskId '+taskId+' is unknown');
                return null;   
            }
        };

        /**
         * Check if a QueryDefinition has status complete.
         *
         * This function reapeats itself as long as the status is complete or timedout.
         *
         * @param {number} taskId   The taskId from a triggerQueryDefinition call
         *
         * @returns {boolean}
         */
        this.isQueryDefinitionComplete = function(taskId) {
            var complete = false;

            // listen to status change
            while(!complete) {

                complete = true;

                // retrieve the status
                this._toogleDebugMode();
                var status = this.retrieveQueryDefinitionStatus(taskId);
                this._toogleDebugMode();

                // keep listen, or status is compelte return true, otherwise status unknown / retrieve failed retrun false
                if( status == 'Queued' || status == 'Processing' ) {
                    complete = false;
                } else if ( status == 'Complete' ) {
                    return true;
                } else {
                    return false;
                }
            }
        };



        // ============================== ASSET ==============================


        /**
         * Retrieve informations about an asset.
         *
         * This usage of this function is limited as the retrievebale cols are 
         * not fully supported for WSProxy at this time. Only ObjectID, CustomerKey 
         * ID and Name are retrieveable but no information about the file itself.
         * In order to retrieve more informations about the asset, use the REST API.
         *
         * @param {string}  id  The identifier for the Asset. Name or customerKey.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveAsset = function(id) {
            var cols = this.retrievableCols('Asset'),
                property = ['Name','CustomerKey'],
                req = {};

            for (var i = 0; i < 2; i++) {
                req = this.api.retrieve("Asset", ['*'], { 
                    Property: property[i], 
                    SimpleOperator: "equals", 
                    Value: id 
                });

                if( req.Status == 'OK' && req.Results.length > 0 ) {
                    debug('(retrieveAsset)\n\tOK: Retrieve Asset with '+property[i]+': '+id);
                    return req;
                }
            }
            req.Status = 'Error: Failed to retrieve Asset: '+id;
            debug('(retrieveAsset)\n\t' + req.Status);
            return req;
        };

        /**
         * Create an image asset
         *
         * Note: This function will create an image but the return object does not hold
         * any informations about the image itself. This may change in a later stage 
         * when SFMC is adding these informations. If these informations are required,
         * use the REST API function instead.
         * 
         * @param {string}          imageBase64     A base64 encoded image file
         * @param {string}          imageName       The name of the image
         * @param {string}          imageType       The image type e.g.: jpg, png
         * @param {string|number}   folderId        The identifier for the folder. Name or folderId.
         * @param {string}          description     A brief description about the file
         *
         * @returns {object} Result set of the request.
         */
        this.createAssetImage = function(imageBase64,imageName,imageType,folderId,description) {
            var res = null,
                assetId = this.assetTypes[imageType];

            // asset type not supporterd
            if( typeof assetId == 'undefined' ) {
                res = {Status: 'Error: assetType '+assetType+' is not supporterd'};
                debug('(createAssetImage)\n\t'+res.Status);
                return res;
            }

            // folderId must be given
            if( !folderId ) {
                res = {Status: 'Error: folderId is required'};
                debug('(createAssetImage)\n\t'+res.Status);
                return res;
            }

            var req = this.retrieveDataFolder(folderId),
                id = req.Results[0].ID,
                folderName = req.Results[0].Name,
                contentType = req.Results[0].ContentType;

            // asset folder does not exist
            if( req.Status != 'OK' || req.Results.length != 1) {
                return (req.Status != 'OK') ? req : {Status: 'Error: Multiple folders with folderId "'+folderId+'" where found.'};
            }
                    
            // asset folder is not type of assert
            if( contentType != 'asset' ) {
                req = {Status: 'Error: folderId '+folderId+' is not an asset contentType'};
                debug('(createAssetImage)\n\t'+res.Status);
                return req;
            }

            var setting = {
                Name: imageName,
                AssetType: {
                    Id: assetId,
                    Name: imageType
                },
                File: imageBase64,
                Category: {
                    Id: folderId
                },
                Description: description
            };

            req = this.api.createItem("Asset", setting);

            if( req.Status == "OK" && req.Results.length > 0 ) {
                debug('(createAssetImage)\n\tOK: Image '+imageName+' successfully uploaded to folder '+folderName);
            } else {
                debug('(createAssetImage)\n\t'+req.Results[0].StatusCode+' '+req.Results[0].StatusMessage);
            }
            return req;
        };


        // ============================== LOG UNSUB EVENT ==============================


        /**
         * Unsuscribe a recipient
         *
         * The LogUnsubEvent api call allows you to unsubscribe a subscriber and log an ‘UnsubEvent’ 
         * that is tracked against a specific job. This is mostly used for custom preference centers 
         * or unsubscribe pages.
         *
         * By using this call, you are able to track back the unsubscribe to the job that the email was 
         * sent, instead of just a general non-trackable unsubscribe.
         *
         *
         * @param {string} subscriberKey    The client supplied ID that uniquely identifies a subscriber
         * @param {string} emailAddress     The email address of the subscriber
         * @param {string} jobId            The ID of the Job that sent the message.
         * @param {string} listId           The ID of the List that the subscriber belonged to. You can use 
         *                                  subscriber or publication lists (not suppression lists).
         * @param {string} btachId          The ID of the Batch within the Job.
         * @param {string} [unsubReason]    The reason the subscriber is being unsubscribed.
         *
         * @returns {object} Result set of the request.
         */
        this.logUnsubEvent = function(subscriberKey,emailAddress,jobId,listId,btachId,unsubReason) {
            var props = [
                { Name: "SubscriberKey", Value: subscriberKey },
                { Name: "EmailAddress", Value: emailAddress },
                { Name: "JobID", Value: jobId },
                { Name: "ListID", Value: listId },
                { Name: "BatchID", Value: btachId },
                { Name: "Reason", Value: unsubReason }
            ];

            var req = this.api.execute(props, "LogUnsubEvent");

            if( req.Status == 'OK' && req.Results.length > 0) {
                debug('(logUnsubEvent)\n\tOK: Subscriber '+emailAddress+' has been successfully unsubscribed');
            } else {
                debug('(logUnsubEvent)\n\t'+Stringify(req));
            }
            return req;
        };


        // ========================== EMAIL SEND DEFINITION ==========================

        /** future release */
        this.createEmailSendDefinition = function() {};

        /** future release */
        this.sendTestEmail = function() {};


        // ========================== TRIGGERED SEND DEFINITION ==========================


        /**
         * Retrieve informations about a single TriggeredSendDefinition.
         * 
         * @param {string}  id  The identifier for the TriggeredSendDefinition. Name or CustomerKey.
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * // Retrieve informations about a sepcific TriggeredSendDefinition
         * var prox = new wsproxy();
         * var resp = prox.retrieveTriggeredSendDefinition('MySample');
         *
         * // using a customerKey
         * var resp = prox.retrieveTriggeredSendDefinition('53b54b8a-b604-4fc2-90x9-33eec99c8a93');
         */
        this.retrieveTriggeredSendDefinition = function(id) {
            var cols = this.retrievableCols('TriggeredSendDefinition'),
                property = ['Name','CustomerKey'],
                req = {};

            for (var i = 0; i < 2; i++) {
                req = this.api.retrieve("TriggeredSendDefinition", cols, { 
                    Property: property[i], 
                    SimpleOperator: "equals", 
                    Value: id 
                });

                if( req.Status == 'OK' && req.Results.length > 0 ) {
                    debug('(retrieveTriggeredSendDefinition)\n\tOK: Retrieve TriggeredSendDefinition with '+property[i]+': '+id);
                    return req;
                }
            }
            debug('(retrieveTriggeredSendDefinition)\n\t' + req.Status);
            return req;
        };

        /**
         * Retrieve a list of all TriggeredSendDefinition(s) in the business unit.
         *
         * @param {object}      [filter]            SFMC filter.
         * @param {boolean}     [retrieveAll=false] Retrieve more than 2,500 records.
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveTriggeredSendDefinitions = function(filter,retrieveAll) {
            var cols = this.retrievableCols('TriggeredSendDefinition'),
                a = [],
                f = {Property:"CustomerKey", SimpleOperator:"isNotNull", Value:" "},
                moreData = true,
                reqID = null,
                req = null;

            // additional filter rules?
            f = (filter) ? { LeftOperand: f, LogicalOperator: "AND", RightOperand: filter } : f;

            while (moreData) {

                moreData = false;

                req = (reqID == null) ? req = this.api.retrieve("TriggeredSendDefinition", cols, f) : req = this.api.getNextBatch("TriggeredSendDefinition", reqID);

                if( req.Status == 'OK' || req.Status == 'MoreDataAvailable' ) {
                    moreData = (retrieveAll) ? req.HasMoreRows : false;
                    reqID = req.RequestID;
                    var r = req.Results;

                    for (var k = 0; k < r.length; k++) {
                        var o = {};
                        for (var i = 0; i < cols.length; i++) {
                            var v = cols[i];
                            o[v] = r[k][v];
                        }
                        a.push(o);
                    }
                } else {
                    debug('(retrieveTriggeredSendDefinitions)\n\tError: '+req);
                    return req;
                }
            }
            debug('(retrieveTriggeredSendDefinitions)\n\tOK: Retrieved '+a.length+' TriggeredSendDefinition');
            req.Results = a;
            return req;
        };

        /**
         * Retrieves a property of a TriggeredSendDefinition.
         *
         * @param {string}  id          The identifier for the TriggeredSendDefinition. Name or customerKey.
         * @param {string}  property    The property name to retrieve.
         *
         * @returns {string|NULL}  The TriggeredSendDefinition property or NULL
         */
        this.retrieveTriggeredSendDefinitionProperty = function(id,property) {
            var req = this.retrieveTriggeredSendDefinition(id),
                prop = req.Results[0][property];

            if( req.Status == 'OK' && req.Results.length == 1 && prop ) {
                debug('(retrieveTriggeredSendDefinition'+property+')\n\tOK: '+property+' for TriggeredSendDefinition '+id+': '+prop );
                return prop;
            } else {
                debug('(retrieveTriggeredSendDefinition'+property+')\n\tError: Cannot retrieve '+property+' for TriggeredSendDefinition: '+id);
                return null;
            }
        };

        /**
         * Retrieve the CustomerKey of the given TriggeredSendDefinition.
         * 
         * @param {string}  id  The name of the TriggeredSendDefinition.
         *
         * @returns {string|NULL}  The CustomerKey of the TriggeredSendDefinition or NULL
         */
        this.retrieveTriggeredSendDefinitionCustomerKey = function(id) { return (isCustomerKey(id)) ? id : this.retrieveTriggeredSendDefinitionProperty(id,'CustomerKey'); };

        /**
         * Retrieve the Name of the given TriggeredSendDefinition.
         * 
         * @param {string}  id  The customerKey of the TriggeredSendDefinition.
         *
         * @returns {string|NULL}  The Name of the TriggeredSendDefinition or NULL
         */
        this.retrieveTriggeredSendDefinitionName = function(id) { return this.retrieveTriggeredSendDefinitionProperty(id,'Name'); };

        /**
         * Retrieve the ObjectID of the given TriggeredSendDefinition.
         * 
         * @param {string}  id  The identifier for the TriggeredSendDefinition. Name or customerKey.
         *
         * @returns {string|NULL}  The ObjectID of the TriggeredSendDefinition or NULL
         */
        this.retrieveTriggeredSendDefinitionObjectID = function(id) { return this.retrieveTriggeredSendDefinitionProperty(id,'ObjectID'); };

        /**
         * Retrieve the CategoryID of the given TriggeredSendDefinition.
         * 
         * @param {string}  id  The identifier for the TriggeredSendDefinition. Name or customerKey.
         *
         * @returns {string|NULL}  The CategoryID of the TriggeredSendDefinition or NULL
         */
        this.retrieveTriggeredSendDefinitionCategoryID = function(id) { return this.retrieveTriggeredSendDefinitionProperty(id,'CategoryID'); };

        /**
         * Retrieve the TriggeredSendStatus of the given TriggeredSendDefinition.
         * 
         * @param {string}  id  The identifier for the TriggeredSendDefinition. Name or customerKey.
         *
         * @returns {string|NULL}  The TriggeredSendStatus of the TriggeredSendDefinition or NULL
         */
        this.retrieveTriggeredSendDefinitionStatus = function(id) { return this.retrieveTriggeredSendDefinitionProperty(id,'TriggeredSendStatus'); };

        /**
         * Retrieve a list of all TriggeredSendDefinition Names.
         * 
         * @param {boolean} [retrieveAll=false]     Retrieve more than 2,500 records.
         *
         * @returns {string|NULL}  Array of all TriggeredSendDefinition Names or NULL.
         */
        this.retrieveTriggeredSendDefinitionNames = function(retrieveAll) {
            var res = [],
                req = this.retrieveTriggeredSendDefinitions(null,retrieveAll),
                r = req.Results;

            if( req.Status == 'OK' && r.length > 0) {
                for (var k = 0; k < r.length; k++) {
                    res.push(r[k].Name);
                }
                return res;
            }
            return null;
        };

        /**
         * Retrieve a list of all Active TriggeredSendDefinitions.
         * 
         * @param {boolean} [retrieveAll=false]     Retrieve more than 2,500 records.
         *
         * @returns {object}  Result set of all active TriggeredSendDefinitions.
         */
        this.retrieveActiveTriggeredSendDefinitions = function() {
            var req = this.retrieveTriggeredSendDefinitions(null,retrieveAll),
                res = [];

            if( req.Status == 'OK' && req.Results.length > 0) {
                for (var i = 0; i < req.Results.length; i++) {

                    if( req.Results[i].TriggeredSendStatus === 'Active' ) {
                        res.push(req.Results[i]);
                    }
                }
            }
            req.Results = res;
            return req;
        };



        // ========================== TRIGGERED SEND SUMMARY ========================== 

        /**
         * Retrieve the a TriggeredSendSummary.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveTriggeredSendSummary = function(customerKey) {
            var cols = this.retrievableCols('TriggeredSendSummary'),
                req = this.api.retrieve("TriggeredSendSummary", cols, {
                    Property: "CustomerKey",
                    SimpleOperator: "Equals",
                    Value: customerKey
                });

            if( req.Status == 'OK' && req.Results.length > 0) {
                debug('(retrieveTriggeredSendSummary)\n\tOK: TriggeredSendSummary retrieved for TriggeredSendDefinition Key: '+customerKey);
            } else {
                debug('(retrieveTriggeredSendSummary)\n\t'+Stringify(req));
            }
            return req;
        };

        /**
         * Retrieve the Bounces of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The Bounces of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryBounces = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].Bounces; };

        /**
         * Retrieve the Clicks of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The Clicks of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryClicks = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].Clicks; };

        /**
         * Retrieve the Conversions of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The Conversions of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryConversions = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].Conversions; };

        /**
         * Retrieve the InProcess of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The InProcess of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryInProcess = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].InProcess; };

        /**
         * Retrieve the CreatedDate of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The CreatedDate of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryCreatedDate = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].CreatedDate; };

        /**
         * Retrieve the ModifiedDate of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The ModifiedDate of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryModifiedDate = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].ModifiedDate; };

        /**
         * Retrieve the NotSentDueToError of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The NotSentDueToError of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryNotSentDueToError = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].NotSentDueToError; };

        /**
         * Retrieve the NotSentDueToOptOut of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The NotSentDueToOptOut of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryNotSentDueToOptOut = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].NotSentDueToOptOut; };

        /**
         * Retrieve the NotSentDueToUndeliverable of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The NotSentDueToUndeliverable of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryNotSentDueToUndeliverable = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].NotSentDueToUndeliverable; };

        /**
         * Retrieve the ObjectID of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The ObjectID of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryObjectID = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].ObjectID; };

        /**
         * Retrieve the Opens of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The Opens of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryOpens = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].Opens; };

        /**
         * Retrieve the OptOuts of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The OptOuts of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryOptOuts = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].OptOuts; };

        /**
         * Retrieve the Queued of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The Queued of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryQueued = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].Queued; };

        /**
         * Retrieve the Sent of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The Sent of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummarySent = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].Sent; };

        /**
         * Retrieve the UniqueClicks of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The UniqueClicks of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryUniqueClicks = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].UniqueClicks; };

        /**
         * Retrieve the UniqueConversion of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The UniqueConversion of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryUniqueConversion = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].UniqueConversion; };

        /**
         * Retrieve the UniqueOpens of the given TriggeredSend.
         * 
         * @param {string}  customerKey  The CustomerKey for the TriggeredSend retrieved by this.retrieveTriggeredSendDefinitionCustomerKey().
         *
         * @returns {number|NULL}  The UniqueOpens of the TriggeredSend or NULL
         */
        this.retrieveTriggeredSendSummaryUniqueOpens = function(customerKey) { return this.retrieveTriggeredSendSummary(customerKey).Results[0].UniqueOpens; };



        // ========================== TRIGGERED SEND ==========================

        /**
         * Send a triggered email send
         *
         * @param {string}  customerKey  The CustomerKey for the TriggeredSendDefinition retrieved by retrieveTriggeredSendDefinitionCustomerKey().
         * @param {array}   recipients   Array of objects with email addresses, subscriberkey and attributes to send the email to.
         *
         * @returns {boolean}
         *
         * @example
         * var prox = new wsproxy();
         * var recp = [
         *     {
         *         EmailAddress: 'info@email360.io',
         *         SubscriberKey: 'info@email360.io',
         *         Attributes: {
         *             FirstName: "John",
         *             LastName: "Do"
         *         }
         *     }
         * ];
         * var resp = prox.sendTriggeredSend(381,recp);
         */
        this.sendTriggeredSend = function(customerKey,recipients) {
            var tsDef = { TriggeredSendDefinition: { CustomerKey: customerKey }, Subscribers: [] };

            for (var i = 0; i < recipients.length; i++) {
                tsDef.Subscribers.push({
                    EmailAddress: recipients[i].EmailAddress,
                    SubscriberKey: recipients[i].SubscriberKey,
                    Attributes: []
                });
                var atr = recipients[i].Attributes;
                if( atr && isObject(atr) ) {
                    for(var k in atr) {
                        tsDef.Subscribers[i].Attributes.push({Name:k, Value: atr[k]});
                    }
                }
            }

            var req = this.api.createItem("TriggeredSend", tsDef);

            if( req.Status == 'OK' && req.Results.length > 0 ) {
                debug('(sendTriggeredSend)\n\tOK: Successfully send '+customerKey+' to '+recipients.length+' subscribers');
                return true;
            } else {
                debug('(sendTriggeredSend)\n\t'+Stringify(req));
                return false;
            }
        };

    }
</script>