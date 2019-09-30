$(document).ready(function() {
    function initialize() {
        if (google.loader.ClientLocation) {
            var userCountry = google.loader.ClientLocation.address.country;
            var userLocation = google.loader.ClientLocation.address.city;
            var userRegion = google.loader.ClientLocation.address.region;
            var userCountryCode = google.loader.ClientLocation.address.country_code;

            $('#span-city').html(userLocation);

            alert('Cidade: ' + userLocation);
        } else if (navigator.geolocation) {
//            var successLocation = function(pos) {
//                console.log('Deu certo!');
//                var lat = pos.coords.latitude;
//                var llong = pos.coords.longitude;
//
//                console.log("Lat: " + lat + ", Long: " + llong);
//            };
//
//            var errorLocation = function() {
//                console.log('Erro');
//            };
//
//            navigator.geolocation.getCurrentPosition(successLocation, errorLocation);
        } else {
            alert('Não funciona!')
        }
    }

//    google.load("search", "1", {callback: initialize});
});