function initializePartners(){
	var createPartnerEndpoint = 'http://localhost:3000/api/com.homeawa.AddPartner';

	var p1 = {
		"email": "admin@adventures.com",
	  	"name": "Adventures",
	  	"commission": 8
	};
	var p2 = {
		"email": "admin@gokarts.com",
	  	"name": "Go Karts",
	  	"commission": 5
	};
	var p3 = {
		"email": "admin@limpio.com",
	  	"name": "Limpio",
	  	"commission": 10
	};
	var p4 = {
		"email": "admin@homeaway.com",
		"name": "HomeAway",
		"commission": 0
	};

	var partners = [p1, p2, p3, p4];

	var _Utils = {};
	_Utils.post = function(url, data){
		var request = new Promise(function(accept, reject){
			var http = new XMLHttpRequest();
	    	http.open('POST', url);
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

	var requests = [];
	for(var i = 0; i < partners.length; i++){
		var partner = partners[i];

		requests.push( _Utils.post( createPartnerEndpoint, partner ) );
	}

	Promise.all( requests )
		.then(function(results){
			alert('Successfully created sample partners');
			console.log( results );
		})
		.catch(function(errors){
			alert('There were errors while creating sample partners');
			console.log( errors );
		});
}

initializePartners();