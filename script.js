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
var myCountyArray = []; // LC-Declaring Global County array to store county info of 5 testing centers.
$.ajax({
    url: testingCenterURL,
    method: "GET"
}).then(function (testingCenterResponse) {
    // console.log(testingCenterResponse);
    for (var i = 0; i < resultLimit; i++) {
        // console.log(testingCenterResponse.items[i]);
        // console.log(testingCenterResponse.items[i].title);
        // console.log(testingCenterResponse.items[i].address.label);
        // console.log(testingCenterResponse.items[i].contacts[0].phone[0].value);
        var address = testingCenterResponse.items[i].address.label.split(":")[1];
        console.log(address);
        myCountyArray.push(testingCenterResponse.items[i].title, testingCenterResponse.items[i].address.county);//LC-This will push county information to myCountyArray
    }
});

// Health Department API Call
var healthDeptURL = "https://postman-data-api-templates.github.io/county-health-departments/api/washington.json";

$.ajax({
    url: healthDeptURL,
    method: "GET"
}).then(function (response) {
    var myArray = response;
    $.each(myArray, function (index, value) {
        console.log(value.name);
        console.log(value.address);
        console.log(value.website);
    })
    console.log("County list: ", myCountyArray);// LC-Proof that county info is now reachable within this ajax request.
});