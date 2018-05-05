var homeaway_domain = 'homeaway';
var $homeawaySales = $('.insights .insight--homeaway-sales .insight-value');
var $homeawayReferrals = $('.insights .insight--homeaway-referrals .insight-value');
var $events = $('.insights .insight--events .insight-value');
var $customers = $('.insights .insight--customers .insight-value');
Set.prototype.intersection = function(setB) {
    var intersection = new Set();
    for (var elem of setB) {
        if (this.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
}

var getEvents = function(){
	var request = new Promise(function(accept, reject){
		var service = 'http://localhost:3000/api/com.homeawa.AddEvent';

		$.getJSON( service, function(data){
			accept( data );
		});
	});

	return request;
};

var setInsightHomeAwaySales = function( events ){
	/*
	last event is checkout within homeaway domain
	save client ip + target + event = setA
	traverse backwards until we found homeaway domain at target
	save client ip + target + event = setB
	find intersection of setA & setB
	*/

	var checkouts_events = events.filter(function(item){
		var isHomeAwayDomain = new RegExp( homeaway_domain.toLowerCase() );
		return /CHECKOUT/.test( item.event ) && isHomeAwayDomain.test( item.target.toLowerCase() );
	});

	var start_homeaway_events = events.filter(function(item){
		var isHomeAwayDomain = new RegExp( homeaway_domain.toLowerCase() );
		return isHomeAwayDomain.test( item.target.toLowerCase() );
	});

	var checkouts_ip = checkouts_events.map(function(item){
		return item.ip;
	});
	checkouts_ip = new Set( checkouts_ip );

	var start_homeaway_ip = start_homeaway_events.map(function(item){
		return item.ip;
	});
	start_homeaway_ip = new Set( start_homeaway_ip );

	var startHomeaway_checkoutPartner = checkouts_ip.intersection( start_homeaway_ip );
	
	$homeawaySales.text( startHomeaway_checkoutPartner.size );
};
var setInsightHomeAwayReferrals = function( events ){
	/*
	last event is checkout outside homeaway domain
	save client ip + target + event = setA
	traverse backwards until we found homeaway domain at target
	save client ip + target + event = setB
	find intersection of setA & setB
	*/

	var checkouts_events = events.filter(function(item){
		var isHomeAwayDomain = new RegExp( homeaway_domain.toLowerCase() );
		return /CHECKOUT/.test( item.event ) && !isHomeAwayDomain.test( item.target.toLowerCase() );
	});

	var start_homeaway_events = events.filter(function(item){
		var isHomeAwayDomain = new RegExp( homeaway_domain.toLowerCase() );
		return isHomeAwayDomain.test( item.target.toLowerCase() );
	});

	var checkouts_ip = checkouts_events.map(function(item){
		return item.ip;
	});
	checkouts_ip = new Set( checkouts_ip );

	var start_homeaway_ip = start_homeaway_events.map(function(item){
		return item.ip;
	});
	start_homeaway_ip = new Set( start_homeaway_ip );

	var startHomeaway_checkoutPartner = checkouts_ip.intersection( start_homeaway_ip );
	
	$homeawayReferrals.text( startHomeaway_checkoutPartner.size );
};
var setInsightEvents = function( events ){
	var numEvents = events.length;

	$events.text( numEvents );
};
var setInsightCustomers = function( events ){
	var raw_customers = events.map(function(item){
		return item.ip;
	});
	var unique_customers = new Set( raw_customers );
	var numCustomers = unique_customers.size;

	$customers.text( numCustomers );
};
var setEventsPerPartnersChart = function( events ){
	/*
	[
		{ label: 'Something', value: 10 },
		...
	]
	 */
	var data = [];

	var partners = events.map(function(item){
		return item.partner;
	});

	var pre_data = {};
	var data_count_partners = [];

	partners.forEach(function(partner){
		// Remove namespace
		partner = partner.replace('resource:com.homeawa.Partner#', '');

		if( pre_data[ partner ] ){
			pre_data[ partner ]++;
		}else{
			pre_data[ partner ] = 1;
		}
	});

	var partners_names = Object.keys( pre_data );
	for(var i = 0; i < partners_names.length; i++){
		data.push({
			label: partners_names[i],
			value: pre_data[ partners_names[i] ]
		});
	}

    $eventsPerPartner_chart.setData( data );
};
var setEventsPerPartnersProgressBar = function( events ){
	var data = [];

	var totalEvents = events.length;

	var partners = events.map(function(item){
		return item.partner;
	});

	var pre_data = {};
	var data_count_partners = [];

	partners.forEach(function(partner){
		// Remove namespace
		partner = partner.replace('resource:com.homeawa.Partner#', '');

		if( pre_data[ partner ] ){
			pre_data[ partner ]++;
		}else{
			pre_data[ partner ] = 1;
		}
	});

	var partners_names = Object.keys( pre_data );
	for(var i = 0; i < partners_names.length; i++){
		data.push({
			label: partners_names[i],
			value: ((pre_data[ partners_names[i] ] / totalEvents) * 100).toFixed(0) + '%'
		});
	}

	var $partnersCounter = $('.partners-counter');
    var $partnerCounterTemplate = $partnersCounter.find('.partners-counter--single').first().clone();
    $partnersCounter.empty();

    for(var i = 0; i < data.length; i++){
    	var name = data[i].label;
    	var value = data[i].value;

        var $tmp = $partnerCounterTemplate.clone();
        $tmp.find('.partners-counter--name').text( name );
        $tmp.find('.partners-counter--value').text( value );
        $tmp.find('.partners-counter--progressbar').css({ width: value });

        $partnersCounter.append( $tmp );
    }
};

var setLoaders = function(){
	var loader = '<i class="fa fa-spinner fa-spin loading-icon"></i>';

	$homeawaySales.html( loader );
	$homeawayReferrals.html( loader );
	$events.html( loader );
	$customers.html( loader );
};
var updateInsights = function(){
	setLoaders();

	getEvents()
		.then(function(events){
			setInsightHomeAwaySales( events );
			setInsightHomeAwayReferrals( events );
			setInsightEvents( events );
			setInsightCustomers( events );
			setEventsPerPartnersChart( events );
			setEventsPerPartnersProgressBar( events );
		})
		.catch(function(errors){
			console.log('Error getting events.');
			console.log( errors );
		});
};

// Tracker's Report
$(document).ready(function() {
	var $columns = $('#tckr-report .tckr-report-headers--column');
	var COLUMNS = {};
	var columnsOrder = [];
	$columns.each(function(i){
		var columnName = $(this).data('column');
		
		COLUMNS[ columnName.toUpperCase() ] = i;
		columnsOrder.push( columnName );
	});

    var $trackerReport = $('#tckr-report').DataTable( {
    	dom: '<"ui stackable grid"<"row"<"four wide column"l><"center aligned eight wide column"B><"right aligned four wide column"f>>r<"row dt-table"<"sixteen wide column"t>><"row"<"four wide column"i><"right aligned twelve wide column"p>>>',
    	buttons: [
            {
                text: 'Reload',
                action: function ( e, dt, $node, config ) {
                	updateInsights();

                	$node.addClass("loading disabled");

                    dt.ajax.reload(function(json){
                    	$node.removeClass("loading disabled");
                    });
                }
            },
            'copy', 'excel', 'pdf', 'colvis'

        ],
    	"scrollX": true,
    	"order": [[ 5, "desc" ]],	// arrival_timestamp
        "ajax": {
        	"url": 'http://localhost:3000/api/com.homeawa.AddEvent',
	        "dataSrc": function(json){
	        	/*
	        	Source structure
	        	[
					{
						$class: "com.homeawa.AddEvent",
						partner: "resource:com.homeawa.Partner#admin@gokarts.com",
						target: "http://localhost:8080/partner2/initialize.html",
						arrival_timestamp: "2018-05-02T01:54:56.123Z",
						leave_timestamp: "2018-05-02T01:54:56.123Z",
						source: "null",
						ip: "187.192.177.178",
						event: "Partner#admin@gokarts.com_CHECKOUT",
						transactionId: "1c57674814b0387bf857542ea3ccf6bf6cf99e72e12d621a4e4f95e4f2eacd7b",
						timestamp: "2018-05-02T01:54:56.144Z"
					},
					...
				]
	        	 */

	        	/*
	        	Output structure
	    		[
			        [
			            "Tiger Nixon",
			            "System Architect",
			            "Edinburgh",
			            "5421",
			            "2011\/04\/25",
			            "$320,800"
			        ],
			        ...
			    ]
	        	 */
	        	
	        	var output = [];
	        	for(var i = 0; i < json.length; i++){
	        		var event = json[i];
	        		var eventTransformed = [];

	        		
	        		var _generateFlag = function(countryCode){
	        			var service = 'http://www.countryflags.io/*COUNTRY_CODE*/flat/32.png';
	        			var flag = service.replace('*COUNTRY_CODE*', countryCode);

	        			var markup = '<img class="country-flag" src="*FLAG*"/>';
	        			markup = markup.replace('*FLAG*', flag);

	        			return markup;
	        		};

	        		var wrapper_template = '<div class="column-value" title="*COLUMN_TITLE*">*COLUMN_VALUE*</div>';

	        		for(var j = 0; j < columnsOrder.length; j++){
						var wrapper = wrapper_template.replace('*COLUMN_TITLE*', event[ columnsOrder[j] ]);
	        			
	        			if( columnsOrder[j] === 'country' ){
	        				event[ columnsOrder[j] ] = _generateFlag( event[ columnsOrder[j] ] );
	        			}

	        			wrapper = wrapper.replace('*COLUMN_VALUE*', event[ columnsOrder[j] ]);

	        			eventTransformed.push( wrapper );
	        		}

	        		output.push( eventTransformed );
	        	}

	        	return output;
	        }
	    }
    } );

    $trackerReport.on('init', function(){
    	$trackerReport.column( COLUMNS['TRANSACTIONID'] ).visible(false);
    	$trackerReport.column( COLUMNS['LEAVE_TIMESTAMP'] ).visible(false);
    	$trackerReport.column( COLUMNS['TIMESTAMP'] ).visible(false);
    });

    $trackerReport.on('draw', function(){
        var body = $( $trackerReport.table().body() );
        body.unhighlight();
        body.highlight( $trackerReport.search() );
    });
} );

// Insights
$(document).ready(function() {
	updateInsights();
});