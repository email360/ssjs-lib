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
     * Enables the AMP function HTTPRequestHeader in SSJS
     *
     * This function returns a specified header from an HTTP request. This function 
     * is only available in landing pages, microsites and CloudPages. It cannot be used 
     * in other Marketing Cloud applications.
     *
     * NOTE: Only headers that are available in the page request return a value. For example, 
     * if a user pastes a URL into a web browser instead of clicking on a page hyperlink 
     * (from another web page), the Referer header value will be empty.
     *
     * @param  {string}    key  An HTTP header as defined in {@link https://tools.ietf.org/html/rfc7231|RFC 7231}
     *
     * @see {@link https://ampscript.guide/httprequestheader/|HTTPRequestHeader}
     */
    function HTTPRequestHeader(key) {
        var varName = '@amp__HTTPRequestHeader';

        // AMP decleration
        var amp = "\%\%[ ";
        // function open        
        amp += "set "+varName+" = HTTPRequestHeader(";
        // parameter
        amp += "'" + key + "'";
        // function close
        amp += ") ";
        // output
        amp += "output(v("+varName+"))";
        // end of AMP
        amp += "]\%\%";

        return Platform.Function.TreatAsContent(amp);
    }

    /**
     * Enables the AMP function UpdateSingleSalesforceObject in SSJS
     *
     * This function updates a record in a Sales or Service Cloud standard or 
     * custom object. The function returns 1 if the record is updated successfully 
     * or 0if it fails.
     *
     * NOTE: Additional API field name and value pairs can be appended as arguments.
     *
     * NOTE: Certain Salesforce objects enforce record-locking when a record is modified,
     * to ensure the referential integrity of data. This applies to records that have a 
     * relationship to lookup records in a different object. If the function is used to 
     * asynchronously update multiple records (for example, the function is included in 
     * an email) and the object has lock contention, the records may fail to update.
     *
     * @param  {string}    sfObject        API name of the Salesforce object.
     * @param  {string}    id              Record identifier to update
     * @param  {array}     parameters      Array of name-valiue pair to update
     *
     * @see {@link https://ampscript.guide/updatesinglesalesforceobject/|UpdateSingleSalesforceObject}
     */
    function UpdateSingleSalesforceObject(sfObject,id,parameters) {
        var varName = '@amp__UpdateSingleSalesforceObject';

        // AMP decleration
        var amp = "\%\%[ ";
        // function open        
        amp += "set "+varName+" = UpdateSingleSalesforceObject(";
        // parameters
        amp += "'" + sfObject + "'";
        amp += ",'" + id + "'";
        // n parameters to update
        for( var k in parameters ) {
            amp += ",'"+k+"','"+parameters[k]+"'";
        }
        // function close
        amp += ") ";
        // output
        amp += "output(v("+varName+"))";
        // end of AMP
        amp += "]\%\%";

        return Platform.Function.TreatAsContent(amp);
    }

    /**
     * Enables the AMP function RetrieveSalesforceObjects in SSJS
     *
     * This function retrieves fields from a record in a Sales or Service Cloud 
     * standard or custom object. The function returns a row set of fields.
     *
     * NOTE: Additional API field name, comparison operator and value sets can 
     * be appended as arguments. However the function joins these additional sets using AND clauses.
     *
     * NOTE: This function should only be used in applications that do not require a high volume 
     * of requests or return a large number of records; for example, an email send to a small 
     * audience, a Triggered Send, or the retrieval of a single record on a landing page.
     *
     * NOTE: The function may take several seconds to execute, impacting email send performance 
     * and may result in a timeout if the request volume is high for example; using a process 
     * loop to execute the function multiple times or returning a large number of rows. Unlike 
     * other AMPscript functions that return a row set — for example, LookupRows which limits 
     * the number of rows to 2000 — there is not the same type of limitation on the number of 
     * rows returned by this function.
     * 
     *
     * @param  {string}    sfObject        API name of the Salesforce object.
     * @param  {array}     fieldNames      Comma-separated array of API field names to retrieve
     * @param  {array}     parameters      Set of arrays where each array is one set of filter
     *                                     <br/>1: API field name to match record
     *                                     <br/>2: Comparison operator for matching records. Valid operators include:
     *                                        <br/> = equal to
     *                                        <br/> < less than
     *                                        <br/> > greater than
     *                                        <br/> != not equal to
     *                                        <br/> <= less than or equal to
     *                                        <br/> >= greater than or equal to
     *                                     <br/>3: Value to match record using comparison operator in 2
     *
     * @returns {object} The result of the request
     *
     * @see {@link https://ampscript.guide/retrievesalesforceobjects/|RetrieveSalesforceObjects}
     */
    function RetrieveSalesforceObjects(sfObject,fieldNames,parameters) {
        var varName = '@amp__RetrieveSalesforceObjects';

        // AMP decleration
        var amp = "\%\%[ ";
        // function open        
        amp += "SET "+varName+" = RetrieveSalesforceObjects(";
        // parameters
        amp += "'" + sfObject + "'";
        amp += ",'" + fieldNames.join(",") + "'";
        // n parameters to update
        for (var i = 0; i < parameters.length; i++) {
            amp += ",'" + parameters[i].join("','") + "'";
        }
        // function close
        amp += ") ";

        // build json from rowset
        amp += "SET "+varName+"_output = '{ \"Status\": \"OK\", \"Results\": [' ";

        // iterate over RowCount
        amp += "FOR "+varName+"_i = 1 TO RowCount("+varName+") DO ";
        amp += "SET "+varName+"_output = Concat("+varName+"_output,'{') ";

        // iterate over each fieldNames
        for (var n = 0; n < fieldNames.length; n++) {
            amp += "SET "+varName+"_output = Concat("+varName+"_output,'\""+fieldNames[n]+"\":\"', Field(Row("+varName+", "+varName+"_i) ,'"+fieldNames[n]+"',0),'\"') ";
            amp += (n<(fieldNames.length-1)) ? "SET "+varName+"_output = Concat("+varName+"_output,', ') " : " ";
        }
        
        // close for loop
        amp += "SET "+varName+"_output = Concat("+varName+"_output,'}') ";
        amp += "IF "+varName+"_i < RowCount("+varName+") THEN SET "+varName+"_output = Concat("+varName+"_output,',') ENDIF ";
        amp += "NEXT "+varName+"_i ";

        // close ouput object
        amp += "SET "+varName+"_output = Concat("+varName+"_output,'] }') ";

        // output
        amp += "Output(v("+varName+"_output)) ";
        // end of AMP
        amp += "]\%\%";

        try {
            return Platform.Function.ParseJSON(Platform.Function.TreatAsContent(amp)); 
        } catch(e) {
            return Platform.Function.ParseJSON('{"Status": "Error cannot retrieve Salesforce Object", "Results": ['+Stringify(amp)+']}');
        }
    }

    /**
     * Enables the AMP function CloudPagesURL in SSJS
     *
     * Provides a way for users to reference a CloudPages URL in an account from an email message. 
     * Use this function in an email to pass information via a URL in an encrypted query string. 
     * For example, you could share a single unsubscription or profile center page for use in 
     * any sent email message. This method passes information in an encrypted query string without 
     * passing subscriber information or values in clear text.
     *
     * @param  {integer}   pid         Page ID for the landing page reference in the URL. 
     *                                 Locate this value on the appropriate CloudPage content 
     *                                 details page. Page ID can be from the enterprise (EID) 
     *                                 or the business unit (MID) where the function is used. 
     * @param  {object}    parameters  Name-Value pair for additional parameters included
     *                                 in encrypted query string
     *
     * @returns {string} A full URL 
     */
    function CloudPagesURL(pid,parameters) {
        var varName = '@amp__CloudPagesURL';

        // AMP decleration
        var amp = "\%\%[ ";
        // function open        
        amp += "set "+varName+" = CloudPagesURL(";
        // parameters
        amp += "'" + pid + "'";
        // n parameters
        for( var k in parameters ) {
            amp += ",'"+k+"','"+parameters[k]+"'";
        }
        // function close
        amp += ") ";
        // output
        amp += "output(concat("+varName+")) ";
        // end of AMP
        amp += "]\%\%";

        return Platform.Function.TreatAsContent(amp);
    }

    /**
     * Enables the AMP function SHA1 in SSJS
     *
     * This function converts the specified string into a SHA1 hex value hash.
     *
     *
     * @param  {string}    string               String to convert
     * @param  {string}    [encoding=UTF-8]     Character set to use for character-encoding. 
     *                                          Valid values are UTF-8 (default) and UTF-16
     *
     * @returns {string}    The string as a SHA1 hex value hashed
     */
     function SHA1(string,encoding) {
        var varName = '@amp__SHA1';

        // AMP decleration
        var amp = "\%\%[ ";
        // function open        
        amp += "set "+varName+" = SHA1(";
        // parameters
        amp += "'" + string + "'";
        if(encoding) {
            amp += "'" + encoding + "'";
        }
        // function close
        amp += ") ";
        // output
        amp += "output(v("+varName+")) ";
        // end of AMP
        amp += "]\%\%";

        return Platform.Function.TreatAsContent(amp);
     }

    /**
     * Enables the AMP function SHA256 in SSJS
     *
     * This function converts the specified string into a SHA256 hex value hash.
     *
     *
     * @param  {string}    string               String to convert
     * @param  {string}    [encoding=UTF-8]     Character set to use for character-encoding. 
     *                                          Valid values are UTF-8 (default) and UTF-16
     *
     * @returns {string}    The string as a SHA256 hex value hashed
     */
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

    /**
     * Enables the AMP function SHA512 in SSJS
     *
     * This function converts the specified string into a SHA512 hex value hash.
     *
     *
     * @param  {string}    string               String to convert
     * @param  {string}    [encoding=UTF-8]     Character set to use for character-encoding. 
     *                                          Valid values are UTF-8 (default) and UTF-16
     *
     * @returns {string}    The string as a SHA512 hex value hashed
     */
     function SHA512(string,encoding) {
        var varName = '@amp__SHA512';

        // AMP decleration
        var amp = "\%\%[ ";
        // function open        
        amp += "set "+varName+" = SHA512(";
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

    /**
     * Enables the AMP function DataExtensionRowCount in SSJS
     *
     * This function returns the number of rows in the specified Data Extension.
     *
     * NOTE: This function will not return row counts from the {@link http://help.marketingcloud.com/en/documentation/automation_studio/using_automation_studio_activities/using_the_query_activity/data_views/|System Data Views.}
     *
     * @param {string} dataExtensionName     Name of the Data Extension from which to retrieve a row count
     *
     * @see {@link https://ampscript.guide/dataextensionrowcount/|DataExtensionRowCount}
     */
     function DataExtensionRowCount(dataExtensionName) {
        var varName = '@amp__DataExtensionRowCount';

        // AMP decleration
        var amp = "\%\%[ ";
        // function open        
        amp += "set "+varName+" = DataExtensionRowCount(";
        // parameters
        amp += "'" + dataExtensionName + "'";
        // function close
        amp += ") ";
        // output
        amp += "output(concat("+varName+")) ";
        // end of AMP
        amp += "]\%\%";

        return Platform.Function.TreatAsContent(amp);
     }
     
</script>