/**
 * @copyright   {@link https://www.email360.io/|email360}
 * @author      {@link https://www.linkedin.com/in/sascha-huwald/|Sascha Huwald}
 * @since       2020
 * @version     1.0.0
 * @license     {@link https://github.com/email360/ssjs-lib/blob/master/LICENSE|MIT}
 *
 * Collection of wrapper functions for the usage of the Salesforce Marketing Cloud Einstein powered by IGO Digital.
 *
 * @param {object} [setting] Used to update the settings object with a custom setting object
 *
 * @example
 * // initialise a new igo instance
 * var einstein = new einstein();
 */
function einstein(settings) {
    this.settings = _updateSettings(settings);
    this.mid = getMemberID();

    /**
     * Upsert Einstein User Attributes
     *
     * Use this function to add or update Einstein user attributes directly in the
     * Einstein recommendation platform of your SFMC instance.
     *
     * @param   {string}    email   The email address identifying the user in Einstein recommendation
     * @param   {object}    data    Object with data to add
     *
     * @returns {boolean}
     *
     * @example
     * // Add/Update a country attribute for the email support@email360.io
     * var email = 'support@email360.io',
     *     data = {country: 'AU'};
     * var resp = upsertUserAttributes(email,data);
     */
    this.upsertUserAttributes = function(email,data) {
        var url = 'http://'+this.mid+'.collect.igodigital.com/c2/'+this.mid+'/track_page_view.json',
            payload = {
                "payload": {
                    "user_info": {
                        "email": email,
                        "details": data
                    }
                }
            };

        // call httpget
        res = httpRequest('POST',url,'application/json', payload, {'User-Agent':''});

        // if status is 200 add data to upsert array
        if( res.status == '200' ) {
            debug('(updateUserInfo)\n\tOK: User data for user '+email+' has been sucessfully updated with data: '+Stringify(data)); 
            return true;
        } else {
            debug('(updateUserInfo)\n\tError: User update for user '+email+' failed. Response: '+Stringify(res)); 
            return false;
        }
    };


    /**
     * Get Behavioral Trigger Data
     *
     * Get products based of the behavioral trigger recommendation 
     * based on the data string created by Einstein Bahvioral Triggers.
     *
     * @param   {string}    data                            The data string created by Einstein in the behavioral trigger DE
     * @param   {number}    [maxItems=1]                    The maximum amount of items should be return
     * @param   {object}    [sort]                          Define the order the return values
     *                      [sort.sortBy=regular_price]     Sort by type. Allowed types are regular_price (Price) and item_order (Last Activity)
     *                      [sort.sortDirection=asc]        Sort order ASC or DESC
     * @param   {string}    [locale]                        A locale srtring as defined in the Einstein Product Catalog for LocaleDisplay
     * @param   {array}     [fields]                        Additional fields from the Einstein Product Catalog as an array of field names
     *
     * @returns {object|null} Result set of the request or null.
     *
     * @example
     * // Get 3 behavioral trigger items ordered by Last Activity DESC formated for the local en-au and the additional product field 'type'
     * var data = 'R3g4REF0TmVwU0VSSU9xWWIzQVFDbn..............dk3=',
     *     maxItems = 3,
     *     sort = {sortBy:'item_order', sortDirection:'desc'},
     *     locale = 'en-au',
     *     fields = ['type'];
     * var resp = getBehavioralTriggerData(data,maxItems,sort,locale,fields);
     */
    this.getBehavioralTriggerData = function(data,maxItems,sort,locale,fields) {
        var sortBy = (isObject(sort) && sort.hasOwnProperty('sortBy') && ['item_order','regular_price'].includes(sort.sortBy) ) ? sort.sortBy : 'regular_price',
            sortDirection = (isObject(sort) && sort.hasOwnProperty('sortDirection') && ['asc','desc'].includes(sort.sortDirection) ) ? sort.sortDirection : 'asc',
            itemCount = (maxItems > 0) ? maxItems : 1,
            url = 'https://'+this.mid+'.recs.igodigital.com/'+this.mid+'/trigger?item_count='+itemCount+'&sort_by='+sortBy+'&sort_direction='+sortDirection,
            defaults = ['link','image_link','product_code','name','regular_price','sale_price','sku_id'];
        
        // add additional fields
        var includes = [];
        for (var i = 0; i < fields.length; i++) {
            if(!defaults.includes(fields[i])) {
                includes.push(fields[i]);
            }
        }
        if(includes.length > 0) {
            url += "&include=" + includes.join("|");
        }

        if(locale){
            url += "&locale=" + locale;
        }

        // call the endpoint
        var res = httpRequest('POST', url, "application/json", {trigger_payload: data});

        // call was successful
        if( res.status == '200' ) {
            return res.content;
        } else {
            debug('(getBehavioralTriggerData)\n\tError: HTTP Request failed on '+url+'. Response: '+Stringify(res)); 
            return null;
        }
    };


}