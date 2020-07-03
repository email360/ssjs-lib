<script runat="server" language="javascript">
    Platform.Load("Core", "1.1.5");
    Platform.Function.ContentBlockByKey('email360-ssjs-lib');

    var dm = Request.GetQueryStringParameter('debugMode'),
    	debugMode = (dm) ? dm : null;

	debug(Request.GetQueryStringParameter('errorDebug'));
</script>

%%[
	IF Empty(QueryParameter('errorCode')) THEN 
	    SET @errorCode = 500 
	ELSE 
	    SET @errorCode = QueryParameter('errorCode')
	ENDIF
	    
	IF Empty(QueryParameter('errorMessage')) THEN 
	    SET @errorMessage = 'Oops. Something went wrong.'
	ELSE 
	    SET @errorMessage = QueryParameter('errorMessage')
	ENDIF
    
	Output(ContentBlockByKey("email360-error-html"))
]%%