/**
 * @copyright   [email360](https://www.email360.io/)
 * @author      [Sascha Huwald](https://www.linkedin.com/in/sascha-huwald/) 
 * @since       2020
 * @version     2.0.0
 * @license     [MIT](https://github.com/email360/ssjs-lib/blob/master/LICENSE)
 *
 * Collection of wrapper functions for the usage of the Salesforce Marketing Cloud REST API.
 *
 * @param {object} [settings] Used to update the settings object with a custom setting object
 *
 * @example
 * // initialise a new sfmcapi instance
 * var rest = new sfmcapi();
 */
function sfmcapi(settings) {
    this.settings = _updateSettings(settings);
    this.assetTypes = { ai: 16, psd: 17, pdd: 18, eps: 19, gif: 20, jpe: 21, jpeg: 22, jpg: 23, jp2: 24, jpx: 25, pict: 26, pct: 27, png: 28, tif: 29, tiff: 30, tga: 31, bmp: 32, wmf: 33, vsd: 34, pnm: 35, pgm: 36, pbm: 37, ppm: 38, svg: 39, "3fr": 40, ari: 41, arw: 42, bay: 43, cap: 44, crw: 45, cr2: 46, dcr: 47, dcs: 48, dng: 49, drf: 50, eip: 51, erf: 52, fff: 53, iiq: 54, k25: 55, kdc: 56, mef: 57, mos: 58, mrw: 59, nef: 60, nrw: 61, orf: 62, pef: 63, ptx: 64, pxn: 65, raf: 66, raw: 67, rw2: 68, rwl: 69, rwz: 70, srf: 71, sr2: 72, srw: 73, x3f: 74, "3gp": 75, "3gpp": 76, "3g2": 77, "3gp2": 78, asf: 79, avi: 80, m2ts: 81, mts: 82, dif: 83, dv: 84, mkv: 85, mpg: 86, f4v: 87, flv: 88, mjpg: 89, mjpeg: 90, mxf: 91, mpeg: 92, mp4: 93, m4v: 94, mp4v: 95, mov: 96, swf: 97, wmv: 98, rm: 99, ogv: 100, indd: 101, indt: 102, incx: 103, wwcx: 104, doc: 105, docx: 106, dot: 107, dotx: 108, mdb: 109, mpp: 110, ics: 111, xls: 112, xlsx: 113, xlk: 114, xlsm: 115, xlt: 116, xltm: 117, csv: 118, tsv: 119, tab: 120, pps: 121, ppsx: 122, ppt: 123, pptx: 124, pot: 125, thmx: 126, pdf: 127, ps: 128, qxd: 129, rtf: 130, sxc: 131, sxi: 132, sxw: 133, odt: 134, ods: 135, ots: 136, odp: 137, otp: 138, epub: 139, dvi: 140, key: 141, keynote: 142, pez: 143, aac: 144, m4a: 145, au: 146, aif: 147, aiff: 148, aifc: 149, mp3: 150, wav: 151, wma: 152, midi: 153, oga: 154, ogg: 155, ra: 156, vox: 157, voc: 158, "7z": 159, arj: 160, bz2: 161, cab: 162, gz: 163, gzip: 164, iso: 165, lha: 166, sit: 167, tgz: 168, jar: 169, rar: 170, tar: 171, zip: 172, gpg: 173, htm: 174, html: 175, xhtml: 176, xht: 177, css: 178, less: 179, sass: 180, js: 181, json: 182, atom: 183, rss: 184, xml: 185, xsl: 186, xslt: 187, md: 188, markdown: 189, as: 190, fla: 191, eml: 192, text: 193, txt: 194, freeformblock: 195, textblock: 196, htmlblock: 197, textplusimageblock: 198, imageblock: 199, abtestblock: 200, dynamicblock: 201, stylingblock: 202, einsteincontentblock: 203, webpage: 205, webtemplate: 206, templatebasedemail: 207, htmlemail: 208, textonlyemail: 209, socialshareblock: 210, socialfollowblock: 211, buttonblock: 212, layoutblock: 213, defaulttemplate: 214, smartcaptureblock: 215, smartcaptureformfieldblock: 216, smartcapturesubmitoptionsblock: 217, slotpropertiesblock: 218, externalcontentblock: 219, codesnippetblock: 220, rssfeedblock: 221, formstylingblock: 222, referenceblock: 223, imagecarouselblock: 224, customblock: 225, liveimageblock: 226, livesettingblock: 227, contentmap: 228, jsonmessage: 230 };
    this.cachedToken = {
        "token": null,
        "expire": dateSubtract(dateNow,1)
    };

    // env
    var setup = this.settings.sfmcApi,
        libKeys = this.settings.keys.general;

    // Do we have a logger loaded? Keep it silence otherwise
    var log = log || new logger("sfmcapi");



    /* ============================================================================
                                TOKEN MANAGEMENT
    ============================================================================ */ 

    /**
     * Retrieve an API token.
     *
     * This function retrieves a saved api token from a dataextension or generate a new token.
     *
     * @returns  {string|NULL}  The token on or null if no token can be generate.
     */
    this.getToken = function() {
        var de_apiToken = this.settings.de.sfmcApiToken.Name;

        // check if we have a cachedToken and has not expired
        if (!this.isTokenExpired(this.cachedToken.expire)) {
            log.trace("[getToken] - Using cached token");
            return this.cachedToken.token;
        }

        // check if we have deToken and deToken has not expired
        if(de_apiToken) {
            var dataRows = Platform.Function.LookupRows(de_apiToken,"clientId","ssjs_lib" ),
                token = dataRows[0]["token"];
                expire = dataRows[0]["expire"];

            if (!this.isTokenExpired(expire)) {
                log.trace("[getToken] - Using dataExtension token");
                // save token in cache
                this.cachedToken = {
                    "token": token,
                    "expire": expire
                }
                return token;
            }
        } else {
            log.warn("[getToken] - For better usage and performance, please add a DataExtension for token storage and add it to the setting de.sfmcApiToken with fields: [(PK) clientId: Text 50] [(PK) token: Text 1000] [expire: Date]");
        }

        // API setup set?
        if( !isObject(setup) || setup.credentials == "xxxxxxx" ) {
            log.error("[getToken] - No credentials found, please add API credentials when initilising the API");
            return null;
        }

        // get api credentials
        var payload = Platform.Function.ParseJSON(DecryptSymmetric(setup.credentials,"AES",libKeys.symmetric,null,libKeys.salt,null,libKeys.vector)),
            req = httpRequest("POST", setup.authBaseURI + "v2/token", "application/json", payload);

        if (req.status == 200) {
            var dateNow = Platform.Function.SystemDateToLocalDate(Now()),
                token = req.content.access_token,
                expire = dateAdd(dateNow,req.content.expires_in,"Seconds");

            // save token in cache
            this.cachedToken = {
                "token": token,
                "expire": expire
            }

            // store token for later use
            if( de_apiToken ) {
                Platform.Function.UpsertDE(de_apiToken,["clientId"],["ssjs_lib"],["token","expire"],[token,expire]);
            }

            // return token
            log.trace("[getToken] - New token: [" + token + "]");
            return token;

        } else {
            log.error("[getToken] - Could not get a new token:", req.content);
            return null;
        }
    };

    /**
     * Validate an API token.
     *
     * @returns {boolean}
     */
    this.isTokenExpired = function(expire) {
        var dateNow = Platform.Function.SystemDateToLocalDate(Now());
        return (dateNow >= new Date(expire));
    };



    /* ============================================================================
                                SUPPORT FUNCTIONS
    ============================================================================ */ 

    /**
     * Retrieve items via API based on the given endpoint.
     * 
     * @param  {string}  endpoint             The API endpoint to retrieve from
     * @param  {array}   [param]              Array of additional parameters
     * @param  {string}  [type]               The type of rerieve e.g.: retrieveJourneys
     * @param  {boolean} [retrieveAll=false]  Retrieve all items.
     * @return {array}                        Array of items retrieved
     */
    this.retrieveMultiple = function(endpoint,param,type,retrieveAll) {
        if (!endpoint) {
            throw "[retrieveMultiple] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            res = [],
            param = param || [],
            retrieveAll = retrieveAll || false;
            type = type || "retrieveMultiple",
            url = setup.restBaseURI + endpoint,
            page = (filter.page && !retrieveAll) ? filter.page : 1,
            header = { Authorization: "Bearer " + token };

        var addResult = function(items) {
            for (var i = 0; i < items.length; i++) {
                res.push(items[i]);
            }
        }

        // Set URL
        var url = url + "?" + param.join("&") + "&$page=";

        // Call API
        var req = httpRequest("GET",url+page,null,null,header);

        if (req.status == 200) {
            addResult(req.content.items);

            if (retrieveAll) {
                page++;
                var totalPages = Math.ceil(req.content.count/req.content.pageSize);

                while (page <= totalPages) {
                    // Call API
                    req = httpRequest("GET",url+page,null,null,header);
                    
                    if (req.status == 200) {
                        addResult(req.content.items);
                        page++;
                    } else {
                        log.warn("[" + type + "] - Retrieve additional items failed: ", req);
                        return req
                    }
                }
            }
        } else {
            log.error("[" + type + "] - Retrieve failed: ", req);
            return req;
        }
        log.trace("[" + type + "] - Retrieved [" + res.length + "] item(s)", res);
        return res;
    };



    /* ============================================================================
                                    USER INFO
    ============================================================================ */ 

    /**
     * Retrieve the user info of the given BU
     *
     * @returns  {object}  The user info of the given BU
     */        
    this.retrieveUserInfo = function() {
        var token = this.getToken(),
            url = setup.authBaseURI + "v2/userinfo",
            header = { Authorization: "Bearer " + token };

        // Call API
        var res = httpRequest("GET",url,null,null,header);

        log.trace("[retrieveUserInfo] - User info received:", res.content);
        return res;
    };

    /**
     * Retrieve the enterprise name of the user info
     *
     * @returns  {string}  The name of the enterprise
     */      
    this.retrieveUserInfoEnterpriseName = function() {
        var userInfo = this.retrieveUserInfo(),
            name = userInfo.content.organization.enterprise_name;

        if (name != null && name.length > 0) {
            log.trace("[retrieveUserInfoEnterpriseName] - Enterprise Name: [" + name + "]");
            return name;
        } else {
            log.error("[retrieveUserInfoEnterpriseName] - Cannot retrieve Enterprise Name:", userInfo);
            return null;
        }
    };



    /* ============================================================================
                                        JOURNEY
    ============================================================================ */ 

    /**
     * Gets a list of jounreys based on a filter
     *
     * @param   {object}   [filter]                            Filter object
     * @param   {string}   [filter.status]                     A status description upon which to filter journeys. Can be one of: Draft, Published, ScheduledToPublish, Stopped, Unpublished, Deleted. The default value is blank, which returns all statuses. ScheduledToSend, Sent, and Stopped are unique to single-send journeys. A single send journey can be "Cancelled" via the UI, but the API status for this is "Stopped."
     * @param   {number}   [filter.versionNumber]              Version number of the journey to retrieve. The default value is published version or latest available version number which meets other search criteria.
     * @param   {number}   [filter.specificApiVersionNumber]   Version number of the workflowApiVersion upon which to filter journeys. The default value is 1.
     * @param   {boolean}  [filter.mostRecentVersionOnly]      A flag to indicate whether to fetch only the most recent version of matching journeys. The default value is true.
     * @param   {string}   [filter.definitionType]             Type of definition to retrieve. Valid values include: transactional (retrieves all transactional send definitions).
     * @param   {string}   [filter.nameOrDescription]          A search string inside the journey's name or description properties upon which to match for filtering.
     * @param   {string}   [filter.extras]                     A list of additional data to fetch. Available values are: all, activities, outcome and stats. The default value is blank, which returns all extras.
     * @param   {string}   [filter.orderBy]                    Specify how to order the journeys. Valid ordering columns are: ModifiedDate (default), Name, Performance. Valid values are: DESC, ASC. The default value is "ModifiedDate DESC".
     * @param   {string}   [filter.tag]                        Specify a single tag to filter results to only include journeys associated with that tag.
     * @param   {number}   [filter.page]                       The number of pages to retrieve. The default value is 1.
     * @param   {number}   [filter.pageSize]                   The number of results to return on a page. The default and maximum is 50.
     * @param   {boolean}  [retrieveAll=false]                 Retrieve all records.
     * @returns {array}                                        Array of journeys.
     *
     * @see [getInteractionCollection](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/getInteractionCollection.html)
     *
     * @example
     * var rest = new sfmcapi();
     *
     * // retrieve all Journeys
     * var resp = rest.retrieveJourneys(null,true);
     *
     * // retrieve only with tag "email360" ordered by modifcation date
     * var resp = rest.retrieveJourneys({
     *          "$orderBy": "ModifiedDate DESC",
     *          "tag": "email360"
     *      });
     */
    this.retrieveJourneys = function(filter,retrieveAll) {
        var param = [],
            endpoint = "interaction/v1/interactions/";

        for (var key in filter) {
            if (key != "page") {
                var k = (key == "orderBy" || key == "pageSize") ? "$" + key : key;
                param.push(k + "=" + filter[key]);
            }
        }
        return this.retrieveMultiple(endpoint,param,"retrieveJourneys",retrieveAll)
    };

    /**
     * Trigger a journey entry event.
     *
     * Requires a DataExntesion (DE) to be used in conjunction with a journey 
     * entry source. 
     *
     * @param   {string}   contactKey          The ID that uniquely identifies a subscriber/contact
     * @param   {string}   eventDefinitionKey  Find the EventDefinitionKey in Event Administration after the event is created and saved.
     * @param   {object}   data                Properties of the event. Only required if defined in a 
     * @returns {boolean}
     *
     * @see [postEvent](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/postEvent.htm)
     *
     * @example
     * // trigger a journey
     * var rest = new sfmcApi();
     * var data = {
     *     "email": "info@email360.io",
     *     "name": "John"
     * };
     * var resp = rest.triggerJourneyEvent(data.email,"APIEvent-b14f22b4-79f2-e573-ebaf-53ad4fa60f63",data);
     */
    this.triggerJourneyEvent = function(contactKey,eventDefinitionKey,data) {
        if (!contactKey || !eventDefinitionKey || !isObject(data)) { 
            throw "[triggerJourneyEvent] - Missing or wrong parameter: " + Stringify(Array.from(arguments));
        }

        var token = this.getToken(),
            url = setup.restBaseURI + "interaction/v1/events",
            contentType = "application/json",
            header = { Authorization: "Bearer " + token },
            payload = {
                ContactKey: contactKey,
                EventDefinitionKey: eventDefinitionKey,
                Data: data
            };

        // API call
        var req = httpRequest("POST",url,contentType,payload,header);

        // Check result set
        if (req.status == 201 && req.content.eventInstanceId != null && req.content.eventInstanceId != "") {
            log.trace("[triggerJourneyEvent] - Journey [" + eventDefinitionKey + "] triggered successfully", req.content);
            return true;
        } else {
            log.warn("[triggerJourneyEvent] - Journey trigger failed", req);
            return false;
        }
    };

    /**
     * [retrieveJourney description]
     * @todo
     * @return {[type]} [description]
     * @see [getJourney](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/getInteractionById.html)
     */
    this.retrieveJourney = function() {};

    /**
     * [pauseJourney description]
     * @todo
     * @return {[type]} [description]
     * @see [pauseJourney](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/JourneyPauseByDefinitionKey.html)
     */
    this.pauseJourney = function() {};

    /**
     * [resumeJourney description]
     * @todo
     * @return {[type]} [description]
     * @see [resumeJourney](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/JourneyResumeByDefinitionKey.html)
     */
    this.resumeJourney = function() {};

    /**
     * [stopJourney description]
     * @todo
     * @return {[type]} [description]
     * @see [stopJourney](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/postStopInteractionById.html)
     */
    this.stopJourney = function() {};

    /**
     * [deleteJourney description]
     * @todo
     * @return {[type]} [description]
     * @see [deleteJourney](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/deleteInteractionById.html)
     */
    this.deleteJourney = function() {};



    /* ============================================================================
                                        ASSETS
    ============================================================================ */ 

    /**
     * Check if an Asset with the given id already exists.
     * 
     * @param   {string}   id  The identifier for the Asset. Name or customerKey.
     * @returns {boolean}
     */
    this.isAsset = function(id) {
        if (!id) {
            throw "[isAsset] - Missing parameter: " + Stringify(Array.from(arguments));
        }

        var req = this.retrieveAsset(id);
        return (req.status == 200 && req.content.items.length > 0) ? true : false;
    };

    /**
     * Retrieves a property of an Asset.
     *
     * @param   {string}       id        The identifier for the Asset. Name or customerKey.
     * @param   {string}       property  The property name to retrieve.
     * @returns {string|NULL}            The Asset property or NULL
     */
    this.retrieveAssetProperty = function(id,property) {
        if (!id || !property) {
            throw "[retrieveAssetProperty] - Missing parameter: " + Stringify(Array.from(arguments));
        }

        var req = this.retrieveAsset(id),
            prop = req.content.items[0][property];

        if( req.status == 200 && req.content.items.length == 1 && prop ) {
            log.trace("[retrieveAssetProperty] - Successfully retrieved " +property+ " for asset " +id+ " with value:", prop );
            return prop;
        } else {
            log.warn("[retrieveAssetProperty] - Retrieve " +property+ " for asset " +id+ " has failed", req );
            return null;
        }
    };

    /**
     * Retrieve the CustomerKey of the given Asset.
     * 
     * @param   {string}       id  The name of the Asset.
     * @returns {string|NULL}      The CustomerKey of the Asset or NULL
     */
    this.retrieveAssetCustomerKey = function(id) { return (isCustomerKey(id)) ? id : this.retrieveAssetProperty(id,"customerKey"); };

    /**
     * Retrieve the ID of the given Asset.
     * 
     * @param   {string}       id  The name of the Asset.
     * @returns {string|NULL}      The ID of the Asset or NULL
     */
    this.retrieveAssetId = function(id) { return (isCustomerKey(id)) ? id : this.retrieveAssetProperty(id,"id"); };

    /**
     * Retrieve informations about an asset.
     *
     * @param   {string}  id  The identifier for the Asset. Name or customerKey.
     * @returns {object}      Result set of the request.
     */
    this.retrieveAsset = function(id) {
        if (!id) {
            throw "[retrieveAsset] - Missing parameter: " + Stringify(Array.from(arguments));
        }

        var token = this.getToken(),
            url = setup.restBaseURI + "asset/v1/content/assets",
            contentType = "application/json",
            header = { Authorization: "Bearer " + token },
            property = ["Name","CustomerKey"];

        for (var i = 0; i < property.length; i++) {
            var filter = "?$filter=" + property[i] + " eq '" + id + "'".replace(/\s+/g, "%20"),
                res = httpRequest("GET",url+filter,contentType,null,header),
                item = res.content.items[0];

            if (res.status == 200 && item.length > 0) {
                log.trace("[retrieveAsset] - Found asset " +property[i]+ " [" +id+ "] with id [" +item.id+ "] in folder [" +item.category.name+ "]");
                return res;
            }
        }

        log.trace("[retrieveAsset] - No asset found with id [" +id+ "]", res );
        return res;
    };

    /**
     * Create an asset
     * 
     * @param  {object}  payload  The asset specific payload
     * @return {object}           The result set object
     */
    this.createAsset = function(payload) {
        if (!isObject(payload) || !payload) {
            throw "[createAsset] - Missing or wrong parameter: " + Stringify(Array.from(arguments));
        }

        var token = this.getToken(),
            url = setup.restBaseURI + "asset/v1/content/assets",
            contentType = "application/json",
            header = { Authorization: "Bearer " + token }

        return httpRequest("POST",url,contentType,payload,header);
    };

    /**
     * Create an image asset
     * 
     * @param   {string}         imageBase64    A base64 encoded image file
     * @param   {string}         imageName      The name of the image
     * @param   {string}         imageType      The image type e.g.: jpg, png
     * @param   {string|number}  [folderId]     The folderId the asset belongs to. Default Content Builder
     * @param   {string}         [description]  A brief description about the file
     * @returns {object}                        Result set of the request.
     *
     * @see [assetTypes](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/base-asset-types.htm)
     * @see [API Endpoint](https://developer.salesforce.com/docs/api-explorer/sfmc/asset/post-asset-v1-content-assets)
     */
    this.uploadImage = function(imageBase64,imageName,imageType,folderId,description) {
        if (!isBase64(imageBase64) || !imageName) {
            throw "[uploadImage] - Missing or wrong parameter: " + Stringify(Array.from(arguments));
        }

        if (!this.assetTypes.hasOwnProperty(imageType)) {
            throw "[uploadImage] - FileType [" + imageType + "] is not supported";
        }

        var assetTypeId = this.assetTypes[imageType],
            folderId = folderId || this.settings.folderId["Content Builder"],
            payload = {
                "name": imageName,
                "assetType": {
                    "name": imageType,
                    "id": assetTypeId
                },
                "file": imageBase64,
                "category": { "id": folderId },
                "description": description
            };

        var res = this.createAsset(payload);
        log.trace("[uploadImage] - Paylod used for HTTP request", payload);

        if( res.status == 201 ) {
            log.trace("[uploadImage] - Image [" + imageName + "] successfully uploaded to folder",res.content.category.name);
        } else {
            log.warn("[uploadImage] - Image upload failed", res);
        }
        return res;
    };

    /**
     * Create an html email asset
     * 
     * @param   {string}         name           The name of the email
     * @param   {string}         subject        The subject of the email
     * @param   {string}         html           The name of the image
     * @param   {string}         [text]         The Plain text part of the HTML email
     * @param   {string}         [preheader]    The preheader for the email  
     * @param   {string|number}  [folderId]     The identifier for the folder. Name or folderId.
     * @param   {string}         [description]  A brief description about the email
     * @returns {object}                        Result set of the request
     */
    this.createAssetHtmlEmail = function(name,subject,html,text,preheader,folderId,description) {
        if (!name || !subject || !html) {
            throw "[createAssetHtmlEmail] - Missing or wrong parameter: " + Stringify(Array.from(arguments));
        }

        var assetType = "htmlemail",
            assetTypeId = this.assetTypes[assetType],
            payload = {
                "name": name,
                "assetType": {
                    "name": assetType,
                    "id": assetTypeId
                },
                "category": { "id": folderId },
                "description": description,
                "views": {
                    "html": { "content": html },
                    "text": { "content": text },
                    "subjectline": { "content": subject },
                    "preheader": { "content": preheader }
                }
            };

        var res = this.createAsset(payload);

        if( res.status == 201 ) {
            log.trace("[createAssetHtmlEmail] - Email [" + name + "] successfully created in folder",res.content.category.name);
        } else {
            log.warn("[createAssetHtmlEmail] - Creating email failed", res);
        }
        return res;
    };

    /**
     * [deleteAsset description]
     * @todo
     * @return {[type]} [description]
     * @see [deleteAsset](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/deleteAsset.html)
     */
    this.deleteAsset = function() {};



    /* ============================================================================
                                    SEND DEFINITIONS
    ============================================================================ */ 

    /**
     * Gets a list of send definitions.
     *
     * Note: Accepted filter values are active, inactive, or deleted. Valid operations are eq and neq. Example: "status neq active"
     *
     * @param   {object}   [filter]             Filter object
     * @param   {boolean}  [retrieveAll=false]  Retrieve all records.
     * @returns {object}                        Result set of the request.
     *
     * @see [getDefinitions](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/getDefinitions.htm)
     * @see [SimpleQuery Filter](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/assetSimpleQuery.htm)
     *
     * @example
     * var rest = new sfmcApi();
     *
     * // retrieve all Send Definitions
     * var resp = rest.retrieveSendDefinitions(null,true);
     *
     * // retrieve only with status not equal to active
     * var resp = rest.retrieveSendDefinitions({filter:"status neq active"});
     */
    this.retrieveSendDefinitions = function(filter,retrieveAll) {
        var param = [],
            endpoint = "messaging/v1/email/definitions/";

        for (var key in filter) {
            if (key != "page") {
                param.push("$" + key + "=" + filter[key]);
            }
        }
        return this.retrieveMultiple(endpoint,param,"retrieveSendDefinitions",retrieveAll)
    };

    /**
     * [retrieveSendDefinition description]
     * @todo
     * @return {[type]} [description]
     * @see [retrieveSendDefinition](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/getSendDefinition.html)
     */
    this.retrieveSendDefinition = function() {};

    /**
     * [createSendDefinition description]
     * @todo
     * @return {[type]} [description]
     * @see [createSendDefinition](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/createSendDefinition.html)
     */
    this.createSendDefinition = function() {};



    /* ============================================================================
                                    EMAIL PREVIEW
    ============================================================================ */ 

    /**
     * Email preview
     *
     * This call will output a rendered version of the email utilizing 
     * information provided by the url. 
     *
     * @param    {string}  url     The url to call
     * @returns  {object}          The result set of the request.
     */
    this.emailPreview = function(url) {
        if (!url) {
            throw "[emailPreview] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            header = { Authorization: "Bearer " + token }

        var req = httpRequest("POST",url,null,null,header);

        if( req.status == 200 ) {
            log.trace("[emailPreview] - Successfully retrieved email preview");
        } else {
            log.trace("[emailPreview] - Email preview failed", req);
        }
        return req;
    };

    /**
     * Email preview by SubscriberId or SubscriberKey
     *
     * This call will output a rendered version of the email utilizing 
     * information stored in Contact Attributes (Subscriber Attributes) only.
     *
     * @param   {string}  emailId    The id of the email (can be found in UI or retrieved by API)
     * @param   {string}  contactId  The contact id of the subscriber (SubscriberID or SubscriberKey). String must start with id: or key: . See example.
     * @returns {object}             The result set of the request.
     *
     * @example
     * var rest = new sfmcApi();
     *
     * // use SubscriberKey
     * var resp = emailPreviewContact(23141,"key:03ABDDST67SEA8")
     *
     * // use SubscriberId
     * var resp = emailPreviewContact(23141,"id:1241157")
     */
    this.emailPreviewSusbcriber = function(emailId,contactId) { 
        if (!emailId || !contactId || (!contactId.startsWith("id:") && !contactId.startsWith("key:"))) {
            throw "[emailPreviewSusbcriber] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/contacts/"+contactId+"/preview"); 
    };

    /**
     * Email preview by SubscriberId
     *
     * This call will output a rendered version of the email utilizing 
     * information stored in Contact Attributes (Subscriber Attributes) only.
     *
     * @param   {string}  emailId       The id of the email (can be found in UI or retrieved by API)
     * @param   {string}  subscriberId  The contact id of the subscriber (SubscriberID)
     * @returns {object}                The result set of the request.
     */
    this.emailPreviewSusbcriberId = function(emailId,subscriberId) { 
        if (!emailId || !subscriberId) {
            throw "[emailPreviewSusbcriberId] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/contacts/id:"+subscriberId+"/preview"); 
    };

    /**
     * Email preview by SubscriberKey
     *
     * This call will output a rendered version of the email utilizing 
     * information stored in Contact Attributes (Subscriber Attributes) only.
     *
     * @param   {string}  emailId       The id of the email (can be found in UI or retrieved by API)
     * @param   {string}  subscriberId  The contact key of the subscriber (SubscriberKey)
     * @returns {object}                The result set of the request.
     */
    this.emailPreviewSusbcriberKey = function(emailId,subscriberKey) { 
        if (!emailId || !subscriberKey) {
            throw "[emailPreviewSusbcriberKey] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/contacts/key:"+subscriberKey+"/preview"); 
    };

    /**
     * Email preview by List
     *
     * This call will output a rendered version of the email utilizing 
     * the architecture of a list (but not a specific contact).
     *
     * @param   {string}  emailId  The id of the email (can be found in UI or retrieved by API)
     * @param   {string}  listId   The id of the list (can be found in UI or retrieved by API)
     * @returns {object}           Result set of the request.
     */
    this.emailPreviewList = function(emailId,listId) { 
        if (!emailId || !listId) {
            throw "[emailPreviewList] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/lists/"+listId+"/preview"); 
    };

    /**
     * Email preview by ListSubscriber
     *
     * This call will output a rendered version of the email utilizing contact 
     * information (via ContactID) stored in a specific list or group (assigned by ListID or GroupID).
     *
     * @param   {string}  emailId       The id of the email (can be found in UI or retrieved by API)
     * @param   {string}  listId        The id of the list (can be found in UI or retrieved by API)
     * @param   {string}  subscriberId  The contact id of the subscriber (SubscriberID)
     * @returns {object}                Result set of the request.
     */
    this.emailPreviewListSubscriberId = function(emailId,listId,subscriberId) { 
        if (!emailId || !listId || !subscriberId) {
            throw "[emailPreviewListSubscriberId] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/lists/"+listId+"/contacts/id:"+subscriberId+"/preview"); 
    };

    /**
     * Email preview by ListSubscriber
     *
     * This call will output a rendered version of the email utilizing contact 
     * information (via ContactID) stored in a specific list or group (assigned by ListID or GroupID).
     *
     * @param   {string}  emailId        The id of the email (can be found in UI or retrieved by API)
     * @param   {string}  listId         The id of the list (can be found in UI or retrieved by API)
     * @param   {string}  subscriberKey  The contact key of the subscriber (SubscriberKey)
     * @returns {object}                 Result set of the request.
     */
    this.emailPreviewListSubscriberKey = function(emailId,listId,subscriberKey) { 
        if (!emailId || !listId || !subscriberKey) {
            throw "[emailPreviewListSubscriberKey] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/lists/"+listId+"/contacts/key:"+subscriberKey+"/preview"); 
    };

    /**
     * Email preview by DataExtension and SubscriberId
     *
     * This call will output a rendered version of the email utilizing contact 
     * information (via ContactID) stored in a specific data extension (assigned by DE ID).
     *
     * @param   {string}  emailId          The id of the email (can be found in UI or retrieved by API)
     * @param   {string}  dataExtensionId  The id of the data extension ( retrieved by API)
     * @param   {string}  subscriberId     The contact id of the subscriber (SubscriberId)
     * @returns {object}                   Result set of the request.     
     */
    this.emailPreviewDataExtensionSubscriberId = function(emailId,dataExtensionId,subscriberId) { 
        if (!emailId || !dataExtensionId || !subscriberId) {
            throw "[emailPreviewDataExtensionSubscriberId] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/dataExtension/key:"+dataExtensionId+"/contacts/id:"+subscriberId+"/preview"); 
    };

    /**
     * Email preview by DataExtension and SubscriberKey
     *
     * This call will output a rendered version of the email utilizing contact 
     * information (via ContactID) stored in a specific data extension (assigned by DE ID).
     *
     * @param   {string}  emailId          The id of the email (can be found in UI or retrieved by API)
     * @param   {string}  dataExtensionId  The id of the data extension ( retrieved by API)
     * @param   {string}  subscriberKey    The contact key of the subscriber (SubscriberKey)
     * @returns {object}                   Result set of the request.     
     */
    this.emailPreviewDataExtensionSubscriberKey = function(emailId,dataExtensionId,subscriberKey) { 
        if (!emailId || !dataExtensionId || !subscriberKey) {
            throw "[emailPreviewDataExtensionSubscriberKey] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/dataExtension/key:"+dataExtensionId+"/contacts/key:"+subscriberKey+"/preview"); 
    };

    /**
     * Email preview by DataExtension row
     *
     * This call will output a rendered version of the email utilizing a 
     * row number (assigned by inside of the specified data extension
     *
     * @param   {string}  emailId           The id of your email (can be found in UI or retrieved by API)
     * @param   {string}  dataExtensionId   The id of your data extension ( retrieved by API)
     * @param   {string}  dataExtensionRow  The row id of the record to use inside the DataExtension
     * @returns {object}                    Result set of the request.
     */
    this.emailPreviewDataExtensionRow = function(emailId,dataExtensionId,dataExtensionRow) {
        if (!emailId || !dataExtensionId || !dataExtensionRow) {
            throw "[emailPreviewDataExtensionRow] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/dataExtension/key:"+dataExtensionId+"/row/"+dataExtensionRow+"/preview"); 
    };



    /* ============================================================================
                                    EMAIL TEST SEND
    ============================================================================ */ 

    /**
     * Send a test email
     *
     * ATTENTION: 
     * This is an internal only route, that currently is NOT supported. 
     * It should only be used in production environments wiht caution. 
     * The route has no ownership internally, and could stop working without notice.
     * 
     * Note:
     * The Send Classification, Delivery Profile and Sender Profile IDs will need to be collected 
     * via the associated SOAP API objects or via UI as there currently is no REST endpoint that 
     * can gather this information. In the UI copy the URL for your Send Classification and use 
     * the 18 digigt parameter id. By default WSPROXY will be used with Default Commercial Profile
     *
     * @param   {number}  emailId                 The emailId used for the send. This can be obtained via the UI or by using the personalised string %%_emailid%% inside an email
     * @param   {array}   recipients              An array of recipients to send the test email to
     * @param   {object}  dataSource              The dataSource for the call. Please reference the example
     * @param   {string}  [sendClassificationId]  The ID assigned to a Send Classification (Can be found in the UI as described above)
     * @param   {string}  [deliveryProfileId]     The ID assigned to a Delivery Profile (Can be found in the UI as described above)
     * @param   {string}  [senderProfileId]       The ID assigned to a Sender Profile (Can be found in the UI as described above)
     * @param   {string}  [prefix="[Test]: "]     A prefix attached in front of the subject
     * @returns {object}                          Result set of the request.
     *
     * @example
     * var rest = new sfmcApi();
     * var recipients = [
     *     "info@email360.io"
     * ];
     * 
     * // Send a test email rendered with a profile from a subscriberId inside a specific list
     * var dataSource = {
     *     contact: "id:1234567", // subscriberId
     *     type: "List",
     *     id: 1234 // list id
     * };
     * var resp = rest.sendTestEmail(3321,recipients,dataSource,"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
     *
     * // Send a test email rendered with a profile from a subscriberKey inside a dataExtension
     * var dataSource = {
     *     contact: "key:03ad24jd81ja74grhe", // subscriberKey
     *     type: "DataExtension",
     *     id: "key:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" // External Key of the DataExtension
     * };
     * var resp = rest.sendTestEmail(3321,recipients,dataSource,"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
     *
     * // Send a test email rendered with a profile of a DataExtension Row
     * var dataSource = {
     *     row: 1, //The row number to use from the given DataExtension
     *     type: "DataExtension",
     *     id: "key:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" // External Key of the DataExtension
     * };
     * var resp = rest.sendTestEmail(3321,recipients,dataSource,"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
     */
    this.sendTestEmail = function(emailId,recipients,dataSource,sendClassificationId,deliveryProfileId,senderProfileId,prefix) {
        if (!emailId || !recipients || !dataSource ) {
            throw "[sendTestEmail] - Missing parameter: " + Stringify(Array.from(arguments));
        }

        if (!sendClassificationId) {
            var prox = new wsproxy();
            sendClassificationId = prox.retrieveSendClassificationCustomerKey("Default Commercial");
        }

        var token = this.getToken(),
            url = setup.restBaseURI + "guide/v1/emails/preview/send",
            contentTypec = "application/json",
            header = { Authorization: "Bearer " + token },
            payload = {
                "dataSource": dataSource,
                "emailID": emailId,
                "isMultipart": true,
                "options": { "EnableETURLs": true },
                "recipients": recipients,
                "sendManagement": {
                    "sendClassificationID": sendClassificationId,
                    "deliveryProfileID": deliveryProfileId || null,
                    "senderProfileID": senderProfileId || null
                },
                "subjectPrefix": prefix || "[Test]:",
                "suppressTracking": true,
                "trackLinks": true
            };

        var req = httpRequest("POST",url,contentType,payload,header);

        if( req.status == 200 ) {
            log.trace("[sendTestEmail] - Test email has been send successfully", recipients);
        } else {
            log.trace("[sendTestEmail] - Failed to send test email", payload, req);
        }
        return req;
    };



    /* ============================================================================
                                    SMS MESSAGE
    ============================================================================ */ 
    
    /**
     * Initiates a message to one or more mobile numbers.
     *
     * In order to be able to programmatically trigger text messages, MobileConnect
     * needs to be enabled in Marketing Cloud’s Mobile Studio. The phone number must use the correct 
     * format for the designated country code. For example, a mobile number from the United States must include the numerical 
     * country code 1 and the area code, eg: 13175551212.
     * 
     * To ensure that the mobile number exists for the contact and that the contact subscribed to the specified keyword on your 
     * short code, set the Subscribe and Resubscribe values to true and specify the keyword parameter.
     *
     * @param   {string}  messageId     Message Id provided for the messageContact
     * @param   {array}   phoneNumbers  An array of one or more mobile numbers
     * @param   {string}  [keyword]     The keyword must align with code on message. Required when subscribe and/or resubscribe are true.
     * @param   {object}  [params]      Key-Value pair for additional params to set. See SFMC for more information
     * @returns {object}                Result set of the request.
     *
     * @see [Message Send](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/postMessageContactSend.htm)
     * @see [ISO Country Code](http://www.iso.org/iso/country_codes/iso-3166-1_decoding_table.htm)
     */
    this.triggerSMSMessage = function(messageId, phoneNumbers, keyword, params) {
        if (!messageId || !phoneNumbers) {
            throw "[triggerSMSMessage] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            url = setup.restBaseURI + "sms/v1/messageContact/"+messageId+"/send",
            contentType = "application/json",
            header = { Authorization: "Bearer " + token },
            payload = {
                "mobileNumbers": phoneNumbers,
                "Subscribe": true,
                "Resubscribe": true,
                "keyword": keyword
            }

        // push optional params to the payload
        for(var key in params) {
            payload[key] = params[key];
        }

        var req = httpRequest("POST",url,contentType,payload,header);

        if( req.status == 200 ) {
            log.trace("[triggerSMSMessage] - SMS Message has been triggered to phone numbers", phoneNumbers);
        } else {
            log.trace("[triggerSMSMessage] - Error trigger SMS message", req);
        }
        return req;
    };

    /**
     * Retrieves the overall delivery status of a message to a contact.
     *
     * @param   {string}  messageId  Message Id provided for the messageContact
     * @param   {string}  tokenId    Token Id returned from triggerSMSMessage
     * @returns {object}             Result set of the request.
     *
     * @see [Message Status](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/getMessageContactDelivery.htm)
     */
    this.retrieveSMSMessageStatus = function(messageId,tokenId) {
        if (!messageId || !tokenId) {
            throw "[retrieveSMSMessageStatus] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            url = setup.restBaseURI + "sms/v1/messageContact/"+messageId+"/deliveries/"+tokenId,
            header = { Authorization: "Bearer " + token };

        var req = httpRequest("POST",url,null,null,header);

        if( req.status == 200 ) {
            log.trace("[retrieveSMSMessageStatus] - Status for message: [" + messageId + "] retrieved", req);
        } else {
            log.trace("[retrieveSMSMessageStatus] - Failed to retrieve SMS status", req);
        }
        return req;
    };



    /* ============================================================================
                                SCRIPT ACTIVITY
    ============================================================================ */ 
    
    /** 
     * Create a Script Activity
     *
     * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
     * The route has no ownership internally, and could stop working without notice.
     *
     * @param   {string}  name           The name of the SSJS script
     * @param   {string}. script         The SSJS script to create
     * @param   {number}  [folderId]     The folder id the script will belong to. Default the default Scripts folderId from settings
     * @param   {number}  [description]  A brief description about the script
     * @returns {object}                 Result set of the request.
     */
    this.createScriptActivity = function(name,script,folderId,description) {
        if (!name || !script) {
            throw "[createScriptActivity] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var categoryId = (folderId && Number.isInteger(folderId)) ? folderId : this.settings.folderId.Scripts,
            token = this.getToken(),
            url = setup.restBaseURI + "automation/v1/scripts",
            contentType = "application/json",
            header = { Authorization: "Bearer " + token },
            payload = {
                "name": name,
                "key": Platform.Function.GUID().toUpperCase(),
                "description": description,
                "script": script,
                "categoryId": categoryId
            };

        var req = httpRequest("POST",url,contentType,payload,header);

        if( req.status == 201 ) {
            req.content.script = stripScriptTag(req.content.script);
            log.trace("[createScriptActivity] - Script Activity [" + name + "] has been created");
        } else {
            log.trace("[createScriptActivity] - Failed to create ScriptActivity", req);
        }
        return req;
    };

    /** 
     * Retrieve a specific Script Activity
     *
     * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
     * The route has no ownership internally, and could stop working without notice.
     *
     * @param   {string}  id  The ssjsActivityId for the scriptActivity or the name
     * @returns {object}      Result set of the request.
     */
    this.retrieveScriptActivity = function(id) {
        if (!id) {
            throw "[retrieveScriptActivity] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            ssjsActivityId = (isCustomerKey(id)) ? id : this.retrieveScriptActivityId(id),
            url = setup.restBaseURI + "automation/v1/scripts/"+ssjsActivityId,
            header = { Authorization: "Bearer " + token };

        var req = httpRequest("GET",url,null,null,header);

        if( req.status == 200 ) {
            req.content.script = stripScriptTag(req.content.script);
            log.trace("[retrieveScriptActivity] - Script Activity has been recieved", req.content);
        } else {
            log.trace("[retrieveScriptActivity] - Retrieve ScriptActivity failed", req);
        }
        return req;
    };

    /** 
     * Retrieve all Script Activities
     *
     * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
     * The route has no ownership internally, and could stop working without notice.
     *
     * @param   {object}   [filter]             Filter object
     * @param   {boolean}  [retrieveAll=false]  Retrieve all records.
     * @returns {object}                        Result set of the request.
     *
     * @see [SimpleQuery Filter](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/assetSimpleQuery.htm)
     *
     * @example
     * var rest = new sfmcApi();
     *
     * // retrieve all ScriptActivities
     * var resp = rest.retrieveScriptActivities(null,true);
     *
     * // retrieve page 2 with a pagesize of 10
     * var resp = rest.retrieveScriptActivities({page:1,pagesize:10});
     */
    this.retrieveScriptActivities = function(filter,retrieveAll) {
        var param = [],
            endpoint = "automation/v1/scripts/";

        for (var key in filter) {
            if (key != "page") {
                param.push("$" + key + "=" + filter[key]);
            }
        }
        return this.retrieveMultiple(endpoint,param,"retrieveScriptActivities",retrieveAll)
    };

    /**
     * Retrieve a retrieveScriptActivityId by a given name
     *
     * @param   {string}       name  The name of the ScriptActivity
     * @returns {string|NULL}
     */
    this.retrieveScriptActivityId = function(name) {
        if (!name) {
            throw "[retrieveScriptActivityId] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            url = setup.restBaseURI + "automation/v1/scripts/?$filter=name eq '"+name+"'",
            header = { Authorization: "Bearer " + token };

        var req = httpRequest("GET",url,null,null,header);

        if( req.status == 200 && req.content.items.length == 1 && req.content.items[0].ssjsActivityId.length > 0 ) {
            var ssjsActivityId = req.content.items[0].ssjsActivityId;
            log.trace("[retrieveScriptActivityId] - ssjsActivityId for ScriptActivity [" + name + "] found: " + ssjsActivityId);
            return ssjsActivityId;
        } else {
            log.trace("[retrieveScriptActivityId] - Failed to retrieve ssjsActivityId for ScriptActivity [" + name + "]", req);
            return null;
        }
    };

    /** 
     * Retrieve all Script Activities inside a folder
     *
     * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
     * The route has no ownership internally, and could stop working without notice.
     *
     * @param   {string}  folderId  The folderId to retrieve all activities for
     * @returns {object}            Result set of the request.
     */
    this.retrieveScriptActivitiesInFolder = function(folderId) {
        if (!folderId) {
            throw "[retrieveScriptActivitiesInFolder] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            url = setup.restBaseURI + "automation/v1/scripts/category/"+folderId,
            header = { Authorization: "Bearer " + token };

        var req = httpRequest("GET",url,null,null,header),
            items = req.content.items;

        for (var i = 0; i < items.length; i++) {
            items[i].script = stripScriptTag(items[i].script);
        }

        if( req.status == 200 ) {
            log.trace("[retrieveScriptActivitiesInFolder] - Script Activities in fodler [" + folderId + "] retrieved", req);
        } else {
            log.trace("[retrieveScriptActivitiesInFolder] - Failed to retrieve Script Activities in fodler [" + folderId + "]", req);
        }
        return req;
    };

    /**
     * Retrieve a ScriptAcitvity FolderId
     *
     * @param   {string}       id  The ssjsActivityId for the scriptActivity or the name
     * @returns {string|NULL}
     */
    this.retrieveScriptActivityFolderId = function(id) {
        if (!id) {
            throw "[retrieveScriptActivityFolderId] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.retrieveScriptActivity(id).content.categoryId; 
    };

    /**
     * Retrieve a ScriptAcitvity CustomerKey
     *
     * @param   {string}       id  The ssjsActivityId for the scriptActivity or the name
     * @returns {string|NULL}
     */
    this.retrieveScriptActivityCustomerKey = function(id) { 
        if (!id) {
            throw "[retrieveScriptActivityCustomerKey] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.retrieveScriptActivity(id).content.key;
    };

    /**
     * Retrieve a ScriptAcitvity Description
     *
     * @param   {string}       id  The ssjsActivityId for the scriptActivity or the name
     * @returns {string|NULL}
     */
    this.retrieveScriptActivityDescription = function(id) { 
        if (!id) {
            throw "[retrieveScriptActivityDescription] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.retrieveScriptActivity(id).content.description; 
    };

    /**
     * Retrieve a ScriptAcitvity Script
     *
     * @param   {string}       id  The ssjsActivityId for the scriptActivity or the name
     * @returns {string|NULL}
     */
    this.retrieveScriptActivityScript = function(id) { 
        if (!id) {
            throw "[retrieveScriptActivityScript] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.retrieveScriptActivity(id).content.script; 
    };

    /**
     * Retrieve a ScriptAcitvity Status
     *
     * @param   {string}       id  The ssjsActivityId for the scriptActivity or the name
     * @returns {string|NULL}
     */
    this.retrieveScriptActivityStatus = function(id) { 
        if (!id) {
            throw "[retrieveScriptActivityStatus] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.retrieveScriptActivity(id).content.status;
    };

    /**
     * Retrieve a ScriptAcitvity CreatedDate
     *
     * @param   {string}       id  The ssjsActivityId for the scriptActivity or the name
     * @returns {string|NULL}
     */
    this.retrieveScriptActivityCreatedDate = function(id) { 
        if (!id) {
            throw "[retrieveScriptActivityCreatedDate] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.retrieveScriptActivity(id).content.createdDate;
    };

    /**
     * Retrieve a ScriptAcitvity ModifiedDate
     *
     * @param   {string}       id  The ssjsActivityId for the scriptActivity or the name
     * @returns {string|NULL}
     */
    this.retrieveScriptActivityModifiedDate= function(id) { 
        if (!id) {
            throw "[retrieveScriptActivityModifiedDate] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.retrieveScriptActivity(id).content.modifiedDate;
    };

    /** 
     * Validate a Script
     *
     * This will let you validate your SSJS prior to creation or update inside the system. 
     * The return is a boolean value, essentially pass/fail. Please note this is just for validation of 
     * the code, it does not verify the dependents (content areas, DEs, etc.) so it does not 
     * guarantee there will be no errors when run.
     * 
     * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
     * The route has no ownership internally, and could stop working without notice.
     *
     * @param   {string}   script  The script to validate
     * @returns {boolean}
     */
    this.validateScript = function(script) {
        if (!script) {
            throw "[validateScript] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            url = setup.restBaseURI + "automation/v1/scripts/validate/",
            contentType = "application/json",
            header = { "Authorization": "Bearer " + token },
            payload = {
                "script": script
            }

        var req = httpRequest("POST",url,contentType,payload,header);

        if( req.status == 200 && req.content.scriptValid == true) {
            log.trace("[validateScript] - Script is valid");
            return true;
        } else {
            log.trace("[validateScript] - Script is not valid", req);
            return false;
        }
    };

    /** 
     * Update an existing Script Activity
     *
     * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
     * The route has no ownership internally, and could stop working without notice.
     *
     * @param   {string}  id       The ssjsActivityId for the scriptActivity or the name
     * @param   {object}  payload  Object array with the data to update
     * @returns {object}           Result set of the request.
     */
    this.updateScriptActivity = function(id,payload) {
        if (!id || !payload) {
            throw "[updateScriptActivity] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            ssjsActivityId = (isCustomerKey(id)) ? id : this.retrieveScriptActivityId(id),
            folderId = (payload.categoryId) ? payload.categoryId : this.retrieveScriptActivityFolderId(ssjsActivityId),
            url = setup.restBaseURI + "automation/v1/scripts/"+ssjsActivityId,
            contentType = "application/json",
            header = { Authorization: "Bearer " + token };
            
        payload.ssjsActivityId = ssjsActivityId;
        // Any PATCH seem to delete the acitiviy and re-creates it with its original values except the categoryId (folderid).
        payload.categoryId = folderId;

        var req = httpRequest("PATCH",url,contentType,payload,header);

        if( req.status == 200 ) {
            log.trace("[updateScriptActivity] - Script Activity has been updated");
        } else {
            log.trace("[updateScriptActivity] - Failed to update Script Activity", req);
        }
        return req;
    };

    /** 
     * Update the name of an existing Script Activity.
     *
     * @param   {string}  id    The ssjsActivityId for the scriptActivity or the name
     * @param   {string}  name  The new name for the scriptActivity
     * @returns {object}        Result set of the request.
     */
    this.updateScriptActivityName = function(id,name) { 
        if (!id || !name) {
            throw "[updateScriptActivityName] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.updateScriptActivity(id,{name:name}); 
    };

    /** 
     * Update the description of an existing Script Activity.
     *
     * @param   {string}  id           The ssjsActivityId for the scriptActivity or the name
     * @param   {string}  description  The new description for the scriptActivity
     * @returns {object}               Result set of the request.
     */
    this.updateScriptActivityDescription = function(id,description) {
        if (!id || !description) {
            throw "[updateScriptActivityDescription] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.updateScriptActivity(id,{description:description}); 
    };

    /** 
     * Replace the script of an existing Script Activity.
     *
     * @param   {string}  id      The ssjsActivityId for the scriptActivity or the name
     * @param   {string}  script  The new script.
     * @returns {object}          Result set of the request.
     */
    this.updateScriptActivityScript = function(id,script) { 
        if (!id || !script) {
            throw "[updateScriptActivityDescription] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.updateScriptActivity(id,{script:script}); 
    };

    /** 
     * Update the customerKey of an existing Script Activity.
     *
     * @param   {string}  id           The ssjsActivityId for the scriptActivity or the name
     * @param   {string}  customerKey  The new customerKey.
     * @returns {object}               Result set of the request.
     */
    this.updateScriptActivityCustomerKey = function(id,customerKey) { 
        if (!id || !customerKey) {
            throw "[updateScriptActivityCustomerKey] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.updateScriptActivity(id,{key:customerKey}); 
    };

    /** 
     * Move an existing Script Activity
     *
     * @param   {string}  id        The ssjsActivityId for the scriptActivity or the name
     * @param   {string}  folderId  The folder id to move the scriptActivity
     * @returns {object}            Result set of the request.
     */
    this.moveScriptActivity = function(id,folderId) { 
        if (!id || !folderId) {
            throw "[moveScriptActivity] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        return this.updateScriptActivity(id,{categoryId:folderId}); 
    };

    /** 
     * Starts a Script Activity
     *
     * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
     * The route has no ownership internally, and could stop working without notice.
     *
     * @param   {string}   id  The ssjsActivityId for the scriptActivity or the name
     * @returns {boolean}
     */
    this.triggerScriptActivity = function(id) {
        if (!id) {
            throw "[triggerScriptActivity] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            ssjsActivityId = (isCustomerKey(id)) ? id : this.retrieveScriptActivityId(id),
            url = setup.restBaseURI + "automation/v1/scripts/"+ssjsActivityId+"/start",
            header = { "Authorization": "Bearer " + token };

        var req = httpRequest("POST",url,null,null,header);

        if (req.status == 200) {
            log.trace("[triggerScriptActivity] - Script Activity has been triggered");
            return true;
        } else {
            log.trace("[TriggerScriptActivity] - Failed to trigger script activity", req);
            return false;
        }
    };

    /** 
     * Delete a Script Activity
     *
     * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
     * The route has no ownership internally, and could stop working without notice.
     *
     * @param   {string}   id  The ssjsActivityId for the scriptActivity or the name
     * @returns {boolean}
     */
    this.deleteScriptActivity = function(id) {
        if (!id) {
            throw "[deleteScriptActivity] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            ssjsActivityId = (isCustomerKey(id)) ? id : this.retrieveScriptActivityId(id),
            url = setup.restBaseURI + "automation/v1/scripts/"+ssjsActivityId,
            header = { "Authorization": "Bearer " + token };

        var req = httpRequest("DELETE",url,null,null,header);

        if (req.status == 200) {
            log.trace("[deleteScriptActivity] - Script Activity has been deleted");
            return true;
        } else {
            log.trace("[deleteScriptActivity] - Failed to delete script activity", req);
            return false;
        }
    };



    /* ============================================================================
                                    CONTACTS
    ============================================================================ */ 
    
    /** 
     * Deletes contacts based on specified contact key values. This operation runs asynchronously. 
     * Use the OperationID value returned to check the status of the delete.
     *
     * This request deletes contacts specified by the contact key values passed in the values array.
     * This asynchronous process places the deletion call in a queue for processing. The queue processes 
     * only one deletion call at a time, and each process can take several hours to complete.
     * 
     * This resource deletes contact information from the account, including the Email, MobileConnect, 
     * MobilePush, and GroupConnect apps, as well as lists, audiences, journeys, and Einstein analytics. 
     * 
     * This deletion occurs at the enterprise level 
     * A successful request suppresses any sends or other activities to the specified contacts for a 
     * specified number of days. You may still see the contact record in Marketing Cloud, but you can't 
     * include these suppressed contacts in any activities. After the specified number of days, 
     * Marketing Cloud deletes the contact from all lists and sendable data extensions. 
     * 
     * You can't restore any contact information associated with this delete process. 
     * 
     * Any subscriberID number assigned to the contact can be recycled in the future. For Enterprise accounts, 
     * this process deletes all information at the Enterprise level.
     *
     * 
     * @param   {array}   values                 Array of contact key values to delete
     * @param   {string}  [deleteOperationType]  Type of delete operation to perform. Specify ContactAndAttributes to delete a contact and all its attributes from the entire account and channels. AttributesOnly is reserved for future use.
     * @returns {object}                         Result set of the request including the operationID
     */
    this.deleteContactByKeys = function(values,deleteOperationType) {
        if (values.length < 1) {
            throw "[deleteContactByKeys] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var type = deleteOperationType || "ContactAndAttributes",
            token = this.getToken(),
            url = setup.restBaseURI + "contacts/v1/contacts/actions/delete?type=keys",
            contentType = "application/json",
            header = { "Authorization": "Bearer " + token },
            payload = {
                "values": values,
                "deleteOperationType": type
            };

        var req = httpRequest("POST",url,contentType,payload,header);

        if( req.status == 200 ) {
            log.trace("[deleteContactbyKeys] - Delete of keys [",values,"] has been added to the queue");
        } else {
            log.trace("[deleteContactbyKeys] - Failed to add keys [",values,"] to the delete queue", req);
        }

        return req;
    };    


    /** 
     * Retrieves status of contact deletion operation.
     * 
     * @param   {integer}  operationID  Query string parameter indicating ID of operation to check status
     * @returns {object}                Result set of the request
     */
    this.retrieveDeleteStatus = function(operationID) {
        if (!operationID) {
            throw "[retrieveDeleteStatus] - Missing parameter: " + Stringify(Array.from(arguments));
        }
        var token = this.getToken(),
            url = setup.restBaseURI + "contacts/v1/contacts/actions/delete/status?operationID="+operationID,
            header = { "Authorization": "Bearer " + token }

        var req = httpRequest("GET",url,null,null,header);

        if( req.status == 200 ) {
            log.trace("[retrieveDeleteStatus] - Successfully retrieved delete status");
        } else {
            log.trace("[retrieveDeleteStatus] - Failed to retrieved delete status", req);
        }

        return req;
    };
}