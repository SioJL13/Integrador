var HomeAway = {};
HomeAway.Tracker = (function(){
	var self = this;
	var _partnerIDKey = 'partner';
	var _partnerID = '';
	var _event = null;
	var _blockchainEventEndpoint = 'http://localhost:3000/api/com.homeawa.AddEvent';
	var _enabledProxy = true;
	var _proxyURL = 'http://cors-proxy.htmldriven.com/?url=';

	var _Utils = {};

	/**
	 * Disable proxy with flag
	 */
	_Utils.disableProxy = function(){
		_enabledProxy = false;
	};

	/**
	 * Enable proxy with flag
	 */
	_Utils.enabledProxy = function(){
		_enabledProxy = true;
	};

	/**
	 * Gets query parameter's value using it's name
	 * @param  {String} name - Name of the query parameter to retrieve its value
	 * @param  {String} url  - URL where to search; if not exist, use current script address
	 * @return {String}      - Query parameter's value if exist, otherwise returns null
	 */
	_Utils.getParameterByName = function( name, url ){
		var _getScriptURL = function(){
			var scriptName = 'tracker.js';
			var scripts = document.getElementsByTagName("script");
			var scriptURL = '';

			for(var i = 0; i < scripts.length; i++){
				if( scripts[i].src.indexOf( '/' + scriptName ) > -1 ){
					scriptURL = scripts[i].src;

					break;
				}
			}

			return scriptURL;
		};

		if (!url) url = _getScriptURL();
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	    	results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	};

	/**
	 * Get Client's Country based on his IP
	 * @param  {String}  ip 	 - Client's public IP
	 * @return {Promise} request - Promise of the request; success return client's country of public IP, otherwise returns error response
	 */
	_Utils.getClientCountryByIP = function(ip){
		var request = new Promise(function(accept, reject){
			// Enable when internet network blocks this service
			//accept('MX');

			_Utils.get('https://www.iplocate.io/api/lookup/' + ip )
				.then(function(response){
					accept( JSON.parse( JSON.parse( response ).body ).country_code );
				})
				.catch( reject );
		});

		return request;
	};

	/**
	 * Gets user's public IP
	 * @return {Promise} request - Promise of the request; success return client's public IP, otherwise returns error response
	 */
	_Utils.getClientIP = function(){
		var request = new Promise(function(accept, reject){
			// Enable when internet network blocks this service
			//var ip = '189.206.160.40';
			//accept( ip );

			_Utils.get('https://api.ipify.org?format=json')
				.then(function(response){
					accept( JSON.parse( response ).ip );
				})
				.catch( reject );
		});

		return request;
	};

	/**
	 * Checks if the partner identifier its valid & exist in the query parameter
	 * @return {Object} partnerID - Return partner's identifier if its valid, otherwise returns false
	 */
	_Utils.checkValidPartnerID = function(){
		var partnerID = _Utils.getParameterByName( _partnerIDKey );

		if( partnerID === null ||
			(partnerID !== null && partnerID.length === 0) ){
			// Missing partner id
			console.log( 'Missing / Invalid Partner Identifier' );

			return false;
		}

		return partnerID;
	};

	/**
	 * AJAX Post request sending given data to given url
	 * @param  {String}  url  		- URL of endpoint
	 * @param  {Object}  data 		- JSON data to be sent
	 * @return {Promise} request    - Promise of the request
	 */
	_Utils.post = function(url, data){
		var request = new Promise(function(accept, reject){
			var http = new XMLHttpRequest();
			var requestURL = (_enabledProxy) ? (_proxyURL + url) : url;

	    	http.open('POST', requestURL);
	    	http.setRequestHeader('Content-type', 'application/json');

	    	http.onreadystatechange = function() {
				if(http.readyState === 4 && http.status === 200) {
			    	accept( http.responseText );
				}else if(http.status !== 200){
					reject( http.responseText );
				}
			}

	    	http.send( JSON.stringify( data ) );
		});

		return request;
	};

	/**
	 * AJAX Get request
	 * @param  {String}  url 		 - URL of endpoint
	 * @return {Promise} request     - Promise of the request
	 */
	_Utils.get = function(url){
		var request = new Promise(function(accept, reject){
			var http = new XMLHttpRequest();
			var requestURL = (_enabledProxy) ? (_proxyURL + url) : url;

	    	http.open('GET', requestURL);

	    	http.onreadystatechange = function() {
				if(http.readyState === 4 && http.status === 200) {
			    	accept( http.responseText );
				}else if(http.status !== 200){
					reject( http.responseText );
				}
			}

	    	http.send();
		});

		return request;
	};

	/**
	 * Adds event to the remote blockchain
	 * @param {Object} event - Blockchain's event that will be stored in the remote blockchain
	 * Structure:
	 * {
	 * 	target: 'https://www.abc.com/index.html',
	 * 	arrival_timestamp: '2018-04-19T21:32:29.972Z',
	 * 	leave_timestamp: '2018-04-19T21:34:29.972Z',
	 * 	source: 'https://www.homeaway.com/property.html' || empty string,
	 * 	ip: '182.10.10.1',
	 * 	partner: '123456789',
	 * 	event: 'PARTNER#123456789_HOME'
	 * }
	 */
	var _addBlockchainEvent = function( event ){
		var defaultProxy = _enabledProxy;

		_Utils.disableProxy();

		_Utils.post( _blockchainEventEndpoint, event )
			.then(function(response){
				console.log('Event Saved.');
				console.log( response );
			})
			.catch(function(response){
				console.log('Error saving event.');
				console.log( response );
			});

		if( defaultProxy ){
			_Utils.enabledProxy();
		}
	};

	/**
	 * Customize event's type name with partner's identifier
	 * @param  {String} eventType 					 - Type of the event fired
	 * @param  {String} partnerID 					 - Partner's Identifier
	 * @return {String} customizedEventType          - Customized Event Type name with partner's identifier
	 */
	var _customizeEventType = function( eventType, partnerID ){
		var format = '<PREFIX><PARTNER_ID>_<EVENT_TYPE>';
		var prefix = 'Partner#';
		var customizedEventType = format.replace('<PREFIX>', prefix);
		customizedEventType = customizedEventType.replace('<PARTNER_ID>', partnerID);
		customizedEventType = customizedEventType.replace('<EVENT_TYPE>', eventType);

		return customizedEventType;
	};

	/**
	 * Close the event & send it to the remote blockchain
	 */
	var _sendEvent = function(){
		_closeEvent();
		_addBlockchainEvent( _event );
	};

	/**
	 * Will update the event with the leaving time
	 */
	var _closeEvent = function(){
		_event.leave_timestamp = (new Date()).toISOString();
	};

	/**
	 * Will create an event & wait until user leaves page to save it into blockchain automatically
	 * @param  {String} eventType - Type of the event fired
	 * @param  {String} partnerID - Partner's Identifier
	 */
	var _createEvent = function( eventType, partnerID ){
		var defaultProxy = _enabledProxy;

		// Disable proxy to enable get real client's ip
		_Utils.disableProxy();

		_Utils.getClientIP()
			.then(function(clientIP){

				if( defaultProxy ){
					_Utils.enabledProxy();
				}

				_Utils.getClientCountryByIP( clientIP )
					.then(function(countryCode){
						_event = {
							target: window.location.href,							// Current page
							arrival_timestamp: (new Date()).toISOString(),			// UTC time offset 0 not client's time when user ENTER to the current page
							leave_timestamp: null,									// (will be upated later) UTC time offset 0 not client's time when user LEAVES the current page
							source: document.referrer || 'null',					// Page where the user came from
							ip: clientIP,											// Public IP of the user
							country: countryCode,									// Country's code based on public IP
							partner: partnerID,										// Partner ID
							event: _customizeEventType( eventType, partnerID )		// Event fired
						};

						// Send event immediately (leave_timestamp will be same as arrival_timestamp)
						_sendEvent();
					})
					.catch(function(response){
						console.log('Error getting country of ip');
						return;
					});
			})
			.catch(function(response){
				console.log('Error creating event.');
				return;
			});
	};

	/**
	 * Adds event to a remote blockchain asyncronous; after user leaves the current page
	 * @param {String} eventType - Type of the event fired
	 */
	self.addEvent = function( eventType ){
		if( !_partnerID ){
			return;
		}

		if( eventType === undefined || eventType === null ){
			// Missing event type
			console.log( 'Please provide a valid event' );

			return;
		}

		// Will create the event & wait until user leaves page to save event into blockchain automatically
		_createEvent( eventType, _partnerID );
	};

	_partnerID = _Utils.checkValidPartnerID();

	return self;
})();