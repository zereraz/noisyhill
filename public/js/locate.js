$(document).ready(function(){
	  function onGeoSuccess(location) {
	  	var city = location.address.city;
	  	$('#status').html("<h3>Location found city : "+city+"</h3>");
        $("form :input").attr("disabled", false);
        //add to form
        $('form').append($('<input />').attr('type','hidden').attr('name','city').attr('value',city));
    }
    //The callback function executed when the location could not be fetched.
    function onGeoError(error) {
        console.log(error);
    }
	var html5Options = { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 };
	geolocator.locate(onGeoSuccess, onGeoError, true, html5Options, 'map-canvas');
	$('#status').html("<h3>Finding location</h3>")
	$("form :input").attr("disabled", true);
});