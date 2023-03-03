function initializeMap() {
    if (typeof google === 'object' && typeof google.maps === 'object') {
        alert('google loaded from tester.js');
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
    else { alert('google has already been loaded'); }
}