(function (window,google) {

    //map options
    var options = {
        center: {
            lat: 37.791350,
            lng: -122.435883
        },
        zoom: 12
    }

    var element = document.getElementById('map-canvas');
    //map
    map = new google.maps.Map(element,options)
}(window, google))

function initializeMap() {
    element = document.getElementById('map-canvas');
    alert(element.toString());
    var options = {
        center: {
            lat: 37.791350,
            lng: -122.435883
        },
        zoom: 11
    },

    element = document.getElementById('mapv1'),

    map = new google.maps.Map(element, options);
}

function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDov6_0bMEkQL0B69eNm75sNtXUwyLsqsQ&callback=initializeMap'   //adding  'callback=something' gets the maps module to load
    document.body.appendChild(script);

}

window.onload = loadScript;
//google.maps.event.addDomListener(window, 'load', initializeMap);
