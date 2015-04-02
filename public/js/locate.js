$(document).ready(function(){
	  function onGeoSuccess(location) {
        console.log(location);
        var country = location.address.country;
	  	var city = location.address.city;
        var longitude = location.coords.longitude;
        var latitude = location.coords.latitude;
	  	$('#status').html("<h3>Location found city : "+ city +", "+ country +"</h3>");
        $("form :input").attr("disabled", false);
        //add to form city
        $('form').append($('<input />').attr('type','hidden').attr('name','country').attr('value',country));
        $('form').append($('<input />').attr('type','hidden').attr('name','city').attr('value',city));
        $('form').append($('<input />').attr('type','hidden').attr('name','longitude').attr('value',longitude));
        $('form').append($('<input />').attr('type','hidden').attr('name','latitude').attr('value',latitude));
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