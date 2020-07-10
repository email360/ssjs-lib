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
     * Collection of wrapper functions for the usage of the Salesforce Marketing Cloud REST API.
     *
     * @param {object} [setting] Used to update the settings object with a custom setting object
     *
     * @example
     * // initialise a new sfmcApi instance
     * var rest = new sfmcApi();
     */
     function sfmcapi(setting) {
        this.settings = _updateSettings(setting);
        this.token = null;
        var setup = this.settings.sfmcApi;

        /**
         * Retrieve an API token.
         *
         * This function retrieves a saved api token from a dataextension or generate a new token.
         *
         * @returns {string|NULL} The token on or null if no token can be generate.
         */
        this.getToken = function() {
            var de_ApiToken = this.settings.de.sfmcApiToken.Name,
                token = '';

            // using a dataextension?
            if(de_ApiToken) {
                token = Platform.Function.Lookup(de_ApiToken,'token','clientId',setup.clientId);
            } else {
                debug('(getToken)\n\tInfo: For better usage and performance, please add a DataExtension for token storage and add it to the setting de.sfmcApiToken with fields: \n\t\t(PK) clientId: Text 50\n\t\t(PK) token: Text 4000\n\t\texpire: Date');
            }

            // get saved token
            this.token = (token) ? token : this.token;

            // saved token and valid?
            if( this.token ) {
                if( this.isValidToken() ) {
                    return this.token;
                }
            }

            // API setup set?
            if( !isObject(setup) ) {
                debug('(getToken)\n\tError: No credentials found, please add API credentials when initilising the API');
                return null;
            }

            // generate new token
            var config = {
                url : setup.authBaseURI + "v2/token",
                contentType : "application/json",
                payload : {
                    "client_id": setup.clientId,
                    "client_secret": setup.clientSecret,
                    "grant_type": "client_credentials"
                }
            };
            
            var req = httpRequest('POST', config.url, config.contentType, config.payload);

            if (req.status == 200) {
                var expires_in = req.content.expires_in;
                token = req.content.access_token;

                // set token experation
                var dateNow = Platform.Function.SystemDateToLocalDate(Now()),
                    expire = dateAdd(dateNow,expires_in,'Seconds');

                // temporary save token for runtime
                this.token = token;

                // store token for later use
                if( de_ApiToken ) {
                    var updatedRowCount = Platform.Function.UpsertDE(de_ApiToken,['clientId'],[setup.clientId],['token','expire'],[token,expire]);
                }

                // return token
                debug('(getToken)\n\tNew token: '+ token);
                return token;
            } else {
                debug('(getToken)\n\tError: Could not get a new token '+ Platform.Function.Stringify(req));
                return null;
            }
        };

        /**
         * Validate an API token.
         *
         * @returns {boolean}
         *
         */
        this.isValidToken = function() {
            var de_ApiToken = this.settings.de.sfmcApiToken.Name,
                dateNow = Platform.Function.SystemDateToLocalDate(Now()),
                expire = (de_ApiToken) ? Platform.Function.Lookup(de_ApiToken,'expire','clientId',setup.clientId) : dateSubtract(dateNow,1);

            if (dateNow < expire) {
                debug('(isValidToken)\n\tOK: Token is valid');
                return true;
            } else {
                debug('(isValidToken)\n\tInfo: Token has expired');
                return false;
            }
        };


        // ============================== JOURNEY ============================

        /**
         * Trigger a journey entry event.
         *
         * Requires a DataExntesion (DE) to be used in conjunction with a journey 
         * entry source. 
         *
         * @param   {string}    contactKey              The ID that uniquely identifies a subscriber/contact
         * @param   {string}    eventDefinitionKey      Find the EventDefinitionKey in Event Administration after the event is created and saved.
         * @param   {object}    data                    Properties of the event. Only required if defined in a custom event or by the event.
         *
         * @returns {boolean}
         *
         * @see {link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/postEvent.htm|postEvent}
         *
         * @example
         * // trigger a journey
         * var rest = new sfmcApi();
         * var data = {
         *     'email': 'info@email360.io',
         *     'name': 'John'
         * };
         * var resp = rest.triggerJourneyEvent(data.email,'APIEvent-b14f22b4-79f2-e573-ebaf-53ad4fa60f63',data);
         */
        this.triggerJourneyEvent = function(contactKey,eventDefinitionKey,data) {
            var token = this.getToken(),
                config = {
                    url: setup.restBaseURI + "interaction/v1/events",
                    contentType: "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    payload : {
                        ContactKey: contactKey,
                        EventDefinitionKey: eventDefinitionKey,
                        Data: data
                    }
                };

            var req = httpRequest('POST',config.url, config.contentType, config.payload, config.header);

            if (req.status == 201) {
                if (req.content.eventInstanceId != null && req.content.eventInstanceId != "") {
                    debug('(triggerJourneyEvent) Journey trigger success');
                    return true;
                } else {
                    debug('(triggerJourneyEvent) Journey trigger failed');
                    return false;
                }
            } else {
                debug('(triggerJourneyEvent) Journey trigger failed');
                return false;
            }
        };


        // ============================== ASSETS ============================

        /**
         * Create an image asset
         * 
         * @param {string}          imageBase64     A base64 encoded image file
         * @param {string}          imageName       The name of the image
         * @param {string}          imageType       The image type e.g.: jpg, png
         * @param {string|number}   folderId        The folderId the asset belongs to
         * @param {string}          description     A brief description about the file
         *
         * @returns {object} Result set of the request.
         *
         * @see {link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/base-asset-types.htm|assetTypes}
         * @see {link https://developer.salesforce.com/docs/api-explorer/sfmc/asset/post-asset-v1-content-assets|API Endpoint}
         */
        this.uploadImage = function(imageBase64,imageName,imageType,folderId,description) {
            var token = this.getToken();
            //match asset type with uploaded file
            var res = null,
                assetTypes = { ai: 16, psd: 17, pdd: 18, eps: 19, gif: 20, jpe: 21, jpeg: 22, jpg: 23, jp2: 24, jpx: 25, pict: 26, pct: 27, png: 28, tif: 29, tiff: 30, tga: 31, bmp: 32, wmf: 33, vsd: 34, pnm: 35, pgm: 36, pbm: 37, ppm: 38, svg: 39, "3fr": 40, ari: 41, arw: 42, bay: 43, cap: 44, crw: 45, cr2: 46, dcr: 47, dcs: 48, dng: 49, drf: 50, eip: 51, erf: 52, fff: 53, iiq: 54, k25: 55, kdc: 56, mef: 57, mos: 58, mrw: 59, nef: 60, nrw: 61, orf: 62, pef: 63, ptx: 64, pxn: 65, raf: 66, raw: 67, rw2: 68, rwl: 69, rwz: 70, srf: 71, sr2: 72, srw: 73, x3f: 74, "3gp": 75, "3gpp": 76, "3g2": 77, "3gp2": 78, asf: 79, avi: 80, m2ts: 81, mts: 82, dif: 83, dv: 84, mkv: 85, mpg: 86, f4v: 87, flv: 88, mjpg: 89, mjpeg: 90, mxf: 91, mpeg: 92, mp4: 93, m4v: 94, mp4v: 95, mov: 96, swf: 97, wmv: 98, rm: 99, ogv: 100, indd: 101, indt: 102, incx: 103, wwcx: 104, doc: 105, docx: 106, dot: 107, dotx: 108, mdb: 109, mpp: 110, ics: 111, xls: 112, xlsx: 113, xlk: 114, xlsm: 115, xlt: 116, xltm: 117, csv: 118, tsv: 119, tab: 120, pps: 121, ppsx: 122, ppt: 123, pptx: 124, pot: 125, thmx: 126, pdf: 127, ps: 128, qxd: 129, rtf: 130, sxc: 131, sxi: 132, sxw: 133, odt: 134, ods: 135, ots: 136, odp: 137, otp: 138, epub: 139, dvi: 140, key: 141, keynote: 142, pez: 143, aac: 144, m4a: 145, au: 146, aif: 147, aiff: 148, aifc: 149, mp3: 150, wav: 151, wma: 152, midi: 153, oga: 154, ogg: 155, ra: 156, vox: 157, voc: 158, "7z": 159, arj: 160, bz2: 161, cab: 162, gz: 163, gzip: 164, iso: 165, lha: 166, sit: 167, tgz: 168, jar: 169, rar: 170, tar: 171, zip: 172, gpg: 173, htm: 174, html: 175, xhtml: 176, xht: 177, css: 178, less: 179, sass: 180, js: 181, json: 182, atom: 183, rss: 184, xml: 185, xsl: 186, xslt: 187, md: 188, markdown: 189, as: 190, fla: 191, eml: 192, text: 193, txt: 194, freeformblock: 195, textblock: 196, htmlblock: 197, textplusimageblock: 198, imageblock: 199, abtestblock: 200, dynamicblock: 201, stylingblock: 202, einsteincontentblock: 203, webpage: 205, webtemplate: 206, templatebasedemail: 207, htmlemail: 208, textonlyemail: 209, socialshareblock: 210, socialfollowblock: 211, buttonblock: 212, layoutblock: 213, defaulttemplate: 214, smartcaptureblock: 215, smartcaptureformfieldblock: 216, smartcapturesubmitoptionsblock: 217, slotpropertiesblock: 218, externalcontentblock: 219, codesnippetblock: 220, rssfeedblock: 221, formstylingblock: 222, referenceblock: 223, imagecarouselblock: 224, customblock: 225, liveimageblock: 226, livesettingblock: 227, contentmap: 228, jsonmessage: 230 },
                config = {
                    url : setup.restBaseURI + "asset/v1/content/assets",
                    contentType : "application/json",
                    header : {
                        Authorization: "Bearer " + token
                    },
                    payload : {
                        name: imageName,
                        assetType: {
                            name: imageType,
                            id: assetTypes[imageType]
                        },
                        file: imageBase64,
                        category: {
                            id: folderId
                        },
                        description: description
                    }
                };

            // asset type not supporterd
            if( typeof assetTypes[imageType] == 'undefined' ) {
                res = {status: 'Error: fileType '+imageType+' is not supporterd'};
                debug('(uploadImage)\n\t'+res.Status);
                return res;
            }

            if (imageBase64 != null) {
                res = httpRequest('POST', config.url, config.contentType, config.payload, config.header);

                if( res.status == 201 ) {
                    debug('(uploadImage)\n\tImage '+imageName+' successfully uploaded to folder '+res.content.category.name);
                    return res;
                } else {
                    debug('(uploadImage)\n\t'+res.content.Message);
                    return res;
                }
            }
        };


        // ============================== SEND DEFINITIONS ============================

        /**
         * Gets a list of send definitions.
         *
         * Note: Accepted filter values are active, inactive, or deleted. Valid operations are eq and neq. Example: 'status neq active'
         *
         * @param {object}  [filter]            Filter object
         * @param {boolean} [retrieveAll=false] Retrieve all records.
         * 
         * @returns {object} Result set of the request.
         *
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/getDefinitions.htm|getDefinitions}
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/assetSimpleQuery.htm|SimpleQuery Filter}
         *
         * @example
         * var rest = new sfmcApi();
         *
         * // retrieve all Send Definitions
         * var resp = rest.retrieveSendDefinitions(null,true);
         *
         * // retrieve only with status not equal to active
         * var resp = rest.retrieveSendDefinitions({filter:'status neq active'});
         */
        this.retrieveSendDefinitions = function(filter, retrieveAll) {
            var token = this.getToken(),
                n = 0,
                f = [],
                r = [],
                page = (filter.page) ? filter.page : 1,
                config = {
                    url: setup.restBaseURI + "messaging/v1/email/definitions/",
                    header: {
                        Authorization: "Bearer " + token
                    }
                },
                addResult = function(definitions) {
                    for (var i = 0; i < definitions.length; i++) {
                        r.push(definitions[i]);
                    }
                };

            for( var k in filter ) {
                if( k != 'page' ) {
                    f.push('$'+k+'='+filter[k]);
                }
            }

            var url = config.url+'?'+f.join('&')+'&$page='+page,
                req = httpRequest('GET',url,null,null,config.header);
            
            addResult(req.content.definitions);

            if( retrieveAll && req.status == 200 ) {
                page++;
                var totalPages = Math.ceil(req.content.count/req.content.pageSize);

                while (page <= totalPages) {
                    url = config.url+'?'+f.join('&')+'&$page='+page;
                    req = httpRequest('GET',url,null,null,config.header);
                    addResult(req.content.definitions);
                    page++;
                }
            }

            if( req.status == 200 ) {
                debug('(retrieveSendDefinitions)\n\tOK: Retrieved send definitions');
            } else {
                debug('(retrieveSendDefinitions)\n\tError: '+ Platform.Function.Stringify(req));
            }
            req.content.definitions = r;
            return req;
        };


        // ============================== EMAIL PREVIEW ==============================

        /**
         * Email preview
         *
         * This call will output a rendered version of the email utilizing 
         * information provided by the url. 
         *
         * @param {string} url The url to call
         *
         * @returns {object} Result set of the request.
         */
        this.emailPreview = function(url) {
            var token = this.getToken(),
                config = {
                    url: url,
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    }
                };

            var req = httpRequest('POST',config.url,null,null,config.header);

            if( req.status == 200 ) {
                debug('(emailPreview)\n\tOK: Retrieved email preview');
            } else {
                debug('(emailPreview)\n\tError: '+ Platform.Function.Stringify(req));
            }
            return req;
        };

        /**
         * Email preview by SubscriberId or SubscriberKey
         *
         * This call will output a rendered version of the email utilizing 
         * information stored in Contact Attributes (aka Subscriber Attributes) only.
         *
         * @param {string} emailId      The id of your email (can be found in UI or retrieved by API)
         * @param {string} contactId    The contact id of your subscriber (aka SubscriberID or SubscriberKey)
         *
         * @returns {object} Result set of the request.
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
        this.emailPreviewSusbcriber = function(emailId,contactId) { return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/contacts/"+contactId+"/preview"); };

        /**
         * Email preview by List
         *
         * This call will output a rendered version of the email utilizing 
         * the architecture of a list (but not a specific contact).
         *
         * @param {string} emailId      The id of your email (can be found in UI or retrieved by API)
         * @param {string} listId       The id of your list (can be found in UI or retrieved by API)
         *
         * @returns {object} Result set of the request.
         */
        this.emailPreviewList = function(emailId,listId) { return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/lists/"+listId+"/preview"); };

        /**
         * Email preview by ListSubscriber
         *
         * This call will output a rendered version of the email utilizing contact 
         * information (via ContactID) stored in a specific list or group (assigned by ListID or GroupID).
         *
         * @param {string} emailId      The id of your email (can be found in UI or retrieved by API)
         * @param {string} listId       The id of your list (can be found in UI or retrieved by API)
         * @param {string} subscriberId The contact id of your subscriber (aka SubscriberID)
         *
         * @returns {object} Result set of the request.
         */
        this.emailPreviewListSubscriberId = function(emailId,listId,subscriberId) { return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/lists/"+listId+"/contacts/id:"+subscriberId+"/preview"); };

        /**
         * Email preview by ListSubscriber
         *
         * This call will output a rendered version of the email utilizing contact 
         * information (via ContactID) stored in a specific list or group (assigned by ListID or GroupID).
         *
         * @param {string} emailId          The id of your email (can be found in UI or retrieved by API)
         * @param {string} listId           The id of your list (can be found in UI or retrieved by API)
         * @param {string} subscriberKey    The subscriberKey
         *
         * @returns {object} Result set of the request.
         */
        this.emailPreviewListSubscriberKey = function(emailId,listId,subscriberKey) { return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/lists/"+listId+"/contacts/key:"+subscriberKey+"/preview"); };

        /**
         * Email preview by DataExtension and SubscriberId
         *
         * This call will output a rendered version of the email utilizing contact 
         * information (via ContactID) stored in a specific data extension (assigned by DE ID).
         *
         * @param {string} emailId          The id of your email (can be found in UI or retrieved by API)
         * @param {string} dataExtensionId  The id of your data extension ( retrieved by API)
         * @param {string} subscriberId     The SusbcriberID
         *
         * @returns {object} Result set of the request.     
         */
        this.emailPreviewDataExtensionSubscriberId = function(emailId,dataExtensionId,subscriberId) { return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/dataExtension/key:"+dataExtensionId+"/contacts/id:"+subscriberId+"/preview"); };

        /**
         * Email preview by DataExtension and SubscriberKey
         *
         * This call will output a rendered version of the email utilizing contact 
         * information (via ContactID) stored in a specific data extension (assigned by DE ID).
         *
         * @param {string} emailId          The id of your email (can be found in UI or retrieved by API)
         * @param {string} dataExtensionId  The id of your data extension ( retrieved by API)
         * @param {string} subscriberKey    The SubscriberKey
         *
         * @returns {object} Result set of the request.     
         */
        this.emailPreviewDataExtensionSubscriberKey = function(emailId,dataExtensionId,subscriberKey) { return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/dataExtension/key:"+dataExtensionId+"/contacts/key:"+subscriberKey+"/preview"); };

        /**
         * Email preview by DataExtension row
         *
         * This call will output a rendered version of the email utilizing a 
         * row number (assigned by inside of the specified data extension
         *
         * @param {string} emailId          The id of your email (can be found in UI or retrieved by API)
         * @param {string} dataExtensionId  The id of your data extension ( retrieved by API)
         * @param {string} dataExtensionRow The row id of the record to use inside the DataExtension
         *
         * @returns {object} Result set of the request.
         */
        this.emailPreviewDataExtensionRow = function(emailId,dataExtensionId,dataExtensionRow) { return this.emailPreview(setup.restBaseURI + "guide/v1/emails/"+emailId+"/dataExtension/key:"+dataExtensionId+"/row/"+dataExtensionRow+"/preview"); };


        // ============================== EMAIL TEST SEND ==============================

        /**
         * Send a test email
         *
         * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
         * The route has no ownership internally, and could stop working without notice.
         * <br><br>
         * Note, the Send Classification, Delivery Profile and Sender Profile IDs will need to be collected via the associated SOAP API objects 
         * or via UI as there currently is no REST endpoint that can gather this information. In the UI copy the URL for your
         * Send Classification and use the 18 digigt parameter id "g"
         *
         * @param {number}  emailId                 The emailId used for the send. This can be obtained 
         *                                          via the UI or by using the personalised string %%_emailid%% inside an email
         * @param {array}   recipients              An array of recipients to send the test email to
         * @param {object}  dataSource              The dataSource for the call. Please reference the example
         * @param {string}  sendClassificationId    The ID assigned to a Send Classification (Can be found in the UI as described above)
         * @param {string}  [deliveryProfileId]     The ID assigned to a Delivery Profile (Can be found in the UI as described above)
         * @param {string}  [senderProfileId]       The ID assigned to a Sender Profile (Can be found in the UI as described above)
         * @param {string}  [prefix="[Test]: "]     A prefix attached in front of the subject
         *
         * @returns {object} Result set of the request.
         *
         * @example
         * var rest = new sfmcApi();
         * var recipients = [
         *     'info@email360.io'
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
            var token = this.getToken(),
                config = {
                    url: setup.restBaseURI + "guide/v1/emails/preview/send",
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    payload : {
                        dataSource: dataSource,
                        emailID: emailId,
                        isMultipart: true,
                        options: {
                            EnableETURLs: true
                        },
                        recipients: recipients,
                        sendManagement: {
                            sendClassificationID: sendClassificationId,
                            deliveryProfileID: (deliveryProfileId) ? deliveryProfileId : null,
                            senderProfileID: (senderProfileId) ? senderProfileId : null
                        },
                        subjectPrefix: (prefix) ? prefix : "[Test]:",
                        suppressTracking: true,
                        trackLinks: true
                    }
                };

            var req = httpRequest('POST',config.url,config.contentType,config.payload,config.header);

            if( req.status == 200 ) {
                debug('(sendTestEmail)\n\tOK: Test email has been send to: '+Platform.Function.Stringify(recipients));
            } else {
                debug('(sendTestEmail)\n\tError: '+Platform.Function.Stringify(req));
            }
            return req;
        };

        
        // ============================== SMS MESSAGE ==============================    

        /**
         * Initiates a message to one or more mobile numbers.
         *
         * In order to be able to programmatically trigger text messages, MobileConnect
         * needs to be enabled in Marketing Cloud’s Mobile Studio. The phone number must use the correct 
         * format for the designated country code. For example, a mobile number from the United States must include the numerical 
         * country code 1 and the area code, eg: 13175551212.
         * <br><br>
         * To ensure that the mobile number exists for the contact and that the contact subscribed to the specified keyword on your 
         * short code, set the Subscribe and Resubscribe values to true and specify the keyword parameter.
         *
         * @param {string}  messageId       Message Id provided for the messageContact
         * @param {array}   phoneNumbers    An array of one or more mobile numbers
         * @param {string}  [keyword]       The keyword must align with code on message. Required when subscribe and/or resubscribe are true.
         * @param {object}  [params]        Key-Value pair for additional params to set. See SFMC for more information
         *
         * @returns {object} Result set of the request.
         *
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/postMessageContactSend.htm|Message Send}
         * @see {@link http://www.iso.org/iso/country_codes/iso-3166-1_decoding_table.htm|ISO Country Code}
         */
        this.triggerSMSMessage = function(messageId, phoneNumbers, keyword, params) {
            var token = this.getToken(),
                config = {
                    url: setup.restBaseURI + "sms/v1/messageContact/"+messageId+"/send",
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    payload : {
                        mobileNumbers: phoneNumbers,
                        Subscribe: true,
                        Resubscribe: true,
                        keyword: keyword
                    }
                };

            // push optional params to the config
            for(var k in params) {
                config.payload[k] = params[k];
            }

            var req = httpRequest('POST',config.url,config.contentType,config.payload,config.header);

            if( req.status == 200 ) {
                debug('(triggerSMSMessage)\n\tOK: SMS Message has been triggered to phone numnbers: '+phoneNumbers.join(", "));
            } else {
                debug('(triggerSMSMessage)\n\tError: '+Platform.Function.Stringify(req));
            }
            return req;
        };

        /**
         * Retrieves the overall delivery status of a message to a contact.
         *
         * @param {string} messageId    Message Id provided for the messageContact
         * @param {string} tokenId      Token Id returned from triggerSMSMessage
         *
         * @returns {object} Result set of the request.
         *
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/getMessageContactDelivery.htm|Message Status}
         */
        this.retrieveSMSMessageStatus = function(messageId,tokenId) {
            var token = this.getToken(),
                config = {
                    url: setup.restBaseURI + "sms/v1/messageContact/"+messageId+"/deliveries/"+tokenId,
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    }
                };
            var req = httpRequest('POST',config.url,config.contentType,null,config.header);

            if( req.status == 200 ) {
                debug('(retrieveSMSMessageStatus)\n\tOK: Status for message : '+messageId+' retrieved');
            } else {
                debug('(retrieveSMSMessageStatus)\n\tError: '+Platform.Function.Stringify(req));
            }
            return req;
        };


        // ============================== SCRIPT ACTIVITY ==============================

        /** 
         * Create a Script Activity
         *
         * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
         * The route has no ownership internally, and could stop working without notice.
         *
         * @param {string} name             The name of the SSJS script
         * @param {string} script           The SSJS script to create
         * @param {number} [folderId]       The folder id the script will belong to. Default the default Scripts folderId from settings
         * @param {number} [description]    A brief description about the script
         *
         * @returns {object} Result set of the request.
         */
        this.createScriptActivity = function(name,script,folderId,description) {
            var categoryId = (folderId && Number.isInteger(folderId)) ? folderId : settings.fodlerId.Scripts,
                token = this.getToken(),
                config = {
                    url: setup.restBaseURI + "automation/v1/scripts",
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    payload : {
                        name: name,
                        key: Platform.Function.GUID().toUpperCase(),
                        description: description,
                        script: script,
                        categoryId: categoryId
                    }
                };

            var req = httpRequest('POST',config.url,config.contentType,config.payload,config.header);

            req.content.script = req.content.script.replace(/<script[\s\S]*?>/gi, '');
            req.content.script = req.content.script.replace(/<\/script>/gi, '');

            if( req.status == 201 ) {
                debug('(createScriptActivity)\n\tOK: Script Activity '+name+' has been created');
            } else {
                debug('(createScriptActivity)\n\tError: '+Platform.Function.Stringify(req));
            }
            return req;
        };

        /** 
         * Retrieve a specific Script Activity
         *
         * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
         * The route has no ownership internally, and could stop working without notice.
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveScriptActivity = function(id) {
            var token = this.getToken(),
                ssjsActivityId = (isCustomerKey(id)) ? id : this.retrieveScriptActivityId(id);
                config = {
                    url: setup.restBaseURI + "automation/v1/scripts/"+ssjsActivityId,
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    }
                };

            var req = httpRequest('GET',config.url,config.contentType,null,config.header);

            if( req.status == 200 ) {
                req.content.script = req.content.script.replace(/<script[\s\S]*?>/gi, '');
                req.content.script = req.content.script.replace(/<\/script>/gi, '');
                debug('(retrieveScriptActivity)\n\tOK: Script Activity retrieved');
            } else {
                debug('(retrieveScriptActivity)\n\tError: '+Platform.Function.Stringify(req));
            }
            return req;
        };

        /** 
         * Retrieve all Script Activities
         *
         * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
         * The route has no ownership internally, and could stop working without notice.
         *
         * @param {object}  [filter]            Filter object
         * @param {boolean} [retrieveAll=false] Retrieve all records.
         *
         * @returns {object} Result set of the request.
         *
         * @see {@link https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/assetSimpleQuery.htm|SimpleQuery Filter}
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
            var token = this.getToken(),
                n = 0,
                f = [],
                r = [],
                page = (filter.page) ? filter.page : 1,
                config = {
                    url: setup.restBaseURI + "automation/v1/scripts/",
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    }
                },
                addResult = function(items) {
                    for (var i = 0; i < items.length; i++) {
                        items[i].script = items[i].script.replace(/<script[\s\S]*?>/gi, '');
                        items[i].script = items[i].script.replace(/<\/script>/gi, '');
                        r.push(items[i]);
                    }
                };

            for( var k in filter ) {
                if( k != 'page' ) {
                    f.push('$'+k+'='+filter[k]);
                }
            }

            var url = config.url+'?'+f.join('&')+'&$page='+page,
                req = httpRequest('GET',url,config.contentType,null,config.header);
            
            if( req.status == 200 ) {

                addResult(req.content.items);

                if( retrieveAll && req.status == 200 ) {
                    page++;
                    var totalPages = Math.ceil(req.content.count/req.content.pageSize);

                    while (page <= totalPages) {
                        url = config.url+'?'+f.join('&')+'&$page='+page;
                        req = httpRequest('GET',url,config.contentType,null,config.header);
                        if( req.status == 200 ) {
                            addResult(req.content.items);
                        }
                        page++;
                    }
                }

                debug('(retrieveScriptActivities)\n\tOK: '+req.content.count+' Script Activities retrieved');
            } else {
                debug('(retrieveScriptActivities)\n\tError: '+Platform.Function.Stringify(req));
            }
            req.content.items = r;
            return req;
        };

        /**
         * Retrieve a retrieveScriptActivityId by a given name
         *
         * @param {string}  name    The name of the ScriptActivity
         *
         * @returns {string|NULL}
         */
        this.retrieveScriptActivityId = function(name) {
            var token = this.getToken(),
                config = {
                    url: setup.restBaseURI + "automation/v1/scripts/?$filter=name eq '"+name+"'",
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    }
                };

            var req = httpRequest('GET',config.url,config.contentType,null,config.header);

            if( req.status == 200 && req.content.items.length == 1 && req.content.items[0].ssjsActivityId.length > 0 ) {
                var ssjsActivityId = req.content.items[0].ssjsActivityId;
                debug('(retrieveScriptActivityId)\n\tOK: ssjsActivityId for ScriptActivity '+name+' found: ' +ssjsActivityId);
                return ssjsActivityId;
            } else {
                debug('(retrieveScriptActivityId)\n\tError: '+Platform.Function.Stringify(req));
                return null;
            }
        };

        /** 
         * Retrieve all Script Activities inside a folder
         *
         * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
         * The route has no ownership internally, and could stop working without notice.
         *
         * @param {string} folderId     The folderId to retrieve all activities for
         *
         * @returns {object} Result set of the request.
         */
        this.retrieveScriptActivitiesInFolder = function(folderId) {
            var token = this.getToken(),
                config = {
                    url: setup.restBaseURI + "automation/v1/scripts/category/"+folderId,
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    }
                };

            var req = httpRequest('GET',config.url,config.contentType,null,config.header),
                items = req.content.items;

            for (var i = 0; i < items.length; i++) {
                items[i].script = items[i].script.replace(/<script[\s\S]*?>/gi, '');
                items[i].script = items[i].script.replace(/<\/script>/gi, '');
            }

            if( req.status == 200 ) {
                debug('(retrieveScriptActivitiesInFolder)\n\tOK: Script Activities in fodler '+folderId+' retrieved');
            } else {
                debug('(retrieveScriptActivitiesInFolder)\n\tError: '+Platform.Function.Stringify(req));
            }
            return req;
        };

        /**
         * Retrieve a ScriptAcitvity FolderId
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {string|NULL}
         */
        this.retrieveScriptActivityFolderId = function(id) { return this.retrieveScriptActivity(id).content.categoryId; };

        /**
         * Retrieve a ScriptAcitvity CustomerKey
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {string|NULL}
         */
        this.retrieveScriptActivityCustomerKey = function(id) { return this.retrieveScriptActivity(id).content.key; };

        /**
         * Retrieve a ScriptAcitvity Description
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {string|NULL}
         */
        this.retrieveScriptActivityDescription = function(id) { return this.retrieveScriptActivity(id).content.description; };

        /**
         * Retrieve a ScriptAcitvity Script
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {string|NULL}
         */
        this.retrieveScriptActivityScript = function(id) { return this.retrieveScriptActivity(id).content.script; };

        /**
         * Retrieve a ScriptAcitvity Status
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {string|NULL}
         */
        this.retrieveScriptActivityStatus = function(id) { return this.retrieveScriptActivity(id).content.status; };

        /**
         * Retrieve a ScriptAcitvity CreatedDate
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {string|NULL}
         */
        this.retrieveScriptActivityCreatedDate = function(id) { return this.retrieveScriptActivity(id).content.createdDate; };

        /**
         * Retrieve a ScriptAcitvity ModifiedDate
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {string|NULL}
         */
        this.retrieveScriptActivityModifiedDate= function(id) { return this.retrieveScriptActivity(id).content.modifiedDate; };

        /** 
         * Validate a Script
         *
         * This will let you validate your SSJS prior to creation or update inside the system. 
         * The return is a boolean value, essentially pass/fail. Please note this is just for validation of 
         * the code, it does not verify the dependents (content areas, DEs, etc.) so it does not 
         * guarantee there will be no errors when run.
         * <br><br>
         * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
         * The route has no ownership internally, and could stop working without notice.
         *
         * @param {string} script   The script to validate
         *
         * @returns {boolean}
         */
        this.validateScript = function(script) {
            var token = this.getToken(),
                config = {
                    url: setup.restBaseURI + "automation/v1/scripts/validate/",
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    payload : {
                        script: script
                    }
                };

            var req = httpRequest('POST',config.url,config.contentType,config.payload,config.header);

            if( req.status == 200 && req.content.scriptValid == true) {
                debug('(validateScript)\n\tOK: Script is valid');
                return true;
            } else {
                debug('(validateScript)\n\tError: '+ Platform.Function.Stringify(req));
                return false;
            }
        };

        /** 
         * Update an existing Script Activity
         *
         * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
         * The route has no ownership internally, and could stop working without notice.
         *
         * @param {string} id           The ssjsActivityId for the scriptActivity or the name
         * @param {object} payload      Object array with the data to update
         *
         * @returns {object} Result set of the request.
         */
        this.updateScriptActivity = function(id,payload) {
            var token = this.getToken(),
                ssjsActivityId = (isCustomerKey(id)) ? id : this.retrieveScriptActivityId(id),
                folderId = (payload.categoryId) ? payload.categoryId : this.retrieveScriptActivityFolderId(ssjsActivityId),
                config = {
                    url: setup.restBaseURI + "automation/v1/scripts/"+ssjsActivityId,
                    contentType: "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    payload: payload
                };
                
            config.payload.ssjsActivityId = ssjsActivityId;
            // Any PATCH seem to delete the acitiviy and re-creates it with its original values except the categoryId (folderid).
            config.payload.categoryId = folderId;

            var req = httpRequest('PATCH',config.url,config.contentType,config.payload,config.header);

            if( req.status == 200 ) {
                debug('(updateScriptActivity)\n\tOK: Script Activity has been updated');
            } else {
                debug('(updateScriptActivity)\n\tError: '+ Platform.Function.Stringify(req));
            }
            return req;
        };

        /** 
         * Update the name of an existing Script Activity.
         *
         * @param {string} id       The ssjsActivityId for the scriptActivity or the name
         * @param {string} name     The new name for the scriptActivity
         *
         * @returns {object} Result set of the request.
         */
        this.updateScriptActivityName = function(id,name) { return this.updateScriptActivity(id,{name:name}); };

        /** 
         * Update the description of an existing Script Activity.
         *
         * @param {string} id               The ssjsActivityId for the scriptActivity or the name
         * @param {string} description      The new description for the scriptActivity
         *
         * @returns {object} Result set of the request.
         */
        this.updateScriptActivityDescription = function(id,description) { return this.updateScriptActivity(id,{description:description}); };

        /** 
         * Replace the script of an existing Script Activity.
         *
         * @param {string} id           The ssjsActivityId for the scriptActivity or the name
         * @param {string} script       The new script.
         *
         * @returns {object} Result set of the request.
         */
        this.updateScriptActivityScript = function(id,script) { return this.updateScriptActivity(id,{script:script}); };

        /** 
         * Update the customerKey of an existing Script Activity.
         *
         * @param {string} id           The ssjsActivityId for the scriptActivity or the name
         * @param {string} customerKey  The new customerKey.
         *
         * @returns {object} Result set of the request.
         */
        this.updateScriptActivityCustomerKey = function(id,customerKey) { return this.updateScriptActivity(id,{key:customerKey}); };

        /** 
         * Move an existing Script Activity
         *
         * @param {string} id           The ssjsActivityId for the scriptActivity or the name
         * @param {string} folderId     The folder id to move the scriptActivity
         *
         * @returns {object} Result set of the request.
         */
        this.moveScriptActivity = function(id,folderId) { return this.updateScriptActivity(id,{categoryId:folderId}); };

        /** 
         * Starts a Script Activity
         *
         * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
         * The route has no ownership internally, and could stop working without notice.
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {boolean}
         */
        this.triggerScriptActivity = function(id) {
            var token = this.getToken(),
                ssjsActivityId = (isCustomerKey(id)) ? id : this.retrieveScriptActivityId(id);
                config = {
                    url: setup.restBaseURI + "automation/v1/scripts/"+ssjsActivityId+"/start",
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    }
                };

            var req = httpRequest('POST',config.url,config.contentType,null,config.header);

            if( req.status == 200 ) {
                debug('(triggerScriptActivity)\n\tOK: Script Activity has been started');
                return true;
            } else {
                debug('(triggerScriptActivity)\n\tError: '+ Platform.Function.Stringify(req));
                return false;
            }
        };

        /** 
         * Delete a Script Activity
         *
         * Note: This is an internal only route, that currently is NOT supported. It should only be used in production environments wiht caution. 
         * The route has no ownership internally, and could stop working without notice.
         *
         * @param {string} id   The ssjsActivityId for the scriptActivity or the name
         *
         * @returns {boolean}
         */
        this.deleteScriptActivity = function(id) {
            var token = this.getToken(),
                ssjsActivityId = (isCustomerKey(id)) ? id : this.retrieveScriptActivityId(id);
                config = {
                    url: setup.restBaseURI + "automation/v1/scripts/"+ssjsActivityId,
                    contentType : "application/json",
                    header: {
                        Authorization: "Bearer " + token
                    }
                };

            var req = httpRequest('DELETE',config.url,config.contentType,null,config.header);

            if( req.status == 200 ) {
                debug('(deleteScriptActivity)\n\tOK: Script Activity has been deleted');
                return true;
            } else {
                debug('(deleteScriptActivity)\n\tError: '+ Platform.Function.Stringify(req));
                return false;
            }
        };
    }

</script>