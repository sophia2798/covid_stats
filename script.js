console.log("yeehaw")

// Testing Center API Call
var testingCenterKey = "aUGtjGfxYZm_i4czjxJiqasqeMEkhvjaRig_VG6cUtA";
// Example data, seattle
var cityLongitude = -122.33;
var cityLatitude = 47.60;

// Limit to 5 results
var resultLimit = 5;
var testingCenterURL = "https://discover.search.hereapi.com/v1/discover?apikey=" + testingCenterKey + "&q=Covid&at=" + cityLatitude + "," + cityLongitude + "&limit=" + resultLimit;

// All results
// var testingCenterURL = "https://discover.search.hereapi.com/v1/discover?apikey=" + testingCenterKey + "&q=Covid&at=" + cityLatitude + "," + cityLongitude;

$.ajax({
    url: testingCenterURL,
    method: "GET"
}).then(function(testingCenterResponse) {
    // console.log(testingCenterResponse);
    for (var i = 0; i < resultLimit; i++) {
        // console.log(testingCenterResponse.items[i]);
        // console.log(testingCenterResponse.items[i].title);
        // console.log(testingCenterResponse.items[i].address.label);
        // console.log(testingCenterResponse.items[i].contacts[0].phone[0].value);
        var address = testingCenterResponse.items[i].address.label.split(":")[1];
        console.log(address);
    }
});