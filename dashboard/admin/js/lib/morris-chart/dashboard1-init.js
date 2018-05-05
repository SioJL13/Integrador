var $eventsPerPartner_chart;
// Dashboard 1 Morris-chart
$( function () {
	"use strict";


	// Extra chart
	$eventsPerPartner_chart = Morris.Donut({
	  element: 'extra-area-chart',
	  data: [
	    {label: "Partner#1", value: 12},
	    {label: "Partner#2", value: 30},
	    {label: "Partner#3", value: 20}
	  ],
	  colors: [ '#26DAD2', '#fc6180', '#62d1f3' ]
	});

} );
