// Wait for everything is loaded, then execute function
$(document).ready(function () {
    $('.modal').modal();

    // Once search button is clicked, call storeInput()
    displayHistory();
    $("#submit-btn").on("click", storeInput);

    function displayHistory() {

        // Check if local storage is empty
        var storageCityArray = JSON.parse(localStorage.getItem("storageCity")) || [];
        var storageStateArray = JSON.parse(localStorage.getItem("storageState")) || [];

        // console.log(storageCityArray);
        // console.log(storageStateArray);

        // Display local storage city and state to history, format: Seattle, WA
        storageCityArray.forEach(function (cityEl, index) {
            $("#hist" + index).text(cityEl + ", " + storageStateArray[index]);
            // console.log("check display");
        });
    }

    function storeInput(event) {
        event.preventDefault();
        // console.log("search btn clicked");

        var maxLength = 5;
        // Check input validity
        var cityInput = $("#city-search").val().trim();
        var stateInput = $("#state-search").val().trim();

        // Display modal with error messages
        if (cityInput === "" && stateInput === "") {
            $("#error-message").text("Please enter a city and a state.");

        } else if (cityInput === "" && stateInput.length > 0) {
            $("#error-message").text("Please enter a city.");

        } else if (cityInput.length > 0 && stateInput === "") {
            $("#error-message").text("Please enter a state code.");
            
        } else if (cityInput.length > 0 && stateInput.length != 2) {
            $("#error-message").text("Please enter a correct state code.");
        }

        $(".modal").show();
        $(".close").on("click", function () {
            $(".modal").css("display", "none");
        });

        // Change to uppercase
        cityInput = cityToUpperCase(cityInput);
        stateInput = stateInput.toUpperCase();

        // console.log("cityInput: ", cityInput);
        // console.log("stateInput: ", stateInput);

        var storageCityArray = JSON.parse(localStorage.getItem("storageCity")) || [];
        var storageStateArray = JSON.parse(localStorage.getItem("storageState")) || [];

        // TODO: check city state pair instead of just city
        if (storageCityArray.indexOf(cityInput) === -1) {
            // console.log("City not in history");
            // console.log("city array before: " + JSON.stringify(storageCityArray));

            if (storageCityArray.length < maxLength) {

                // Set arrays to local storage
                storageCityArray.push(cityInput);
                storageStateArray.push(stateInput);

            } else {

                storageCityArray.shift();
                storageStateArray.shift();
                storageCityArray.push(cityInput);
                storageStateArray.push(stateInput);

            }
            localStorage.setItem("storageCity", JSON.stringify(storageCityArray));
            localStorage.setItem("storageState", JSON.stringify(storageStateArray));
            displayHistory();

        } else {
            // console.log("City in history");
            // Call API to display info but dont append to history

        }

    }

    // Function input: city to be changed to uppercase
    // Function output: camel case city name
    function cityToUpperCase(cityToChange) {
        var cityUC = "";

        cityToChange = cityToChange.split(" ");
        // console.log(cityToChange);
        cityToChange.forEach(function (cityPart) {
            // console.log("before: ", cityPart);
            cityPart = cityPart.charAt(0).toUpperCase() + cityPart.slice(1);
            // console.log("after: ", cityPart);
            cityUC = cityUC + " " + cityPart;
            // console.log(cityUC);
        });
        return cityUC.trim();
    }

    $("#submit-btn").on("click", function (event) {
        event.preventDefault();

        // Assign variables to input values
        var cityName = $("#city-search").val();
        var stateName = ($("#state-search").val()).toUpperCase();

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
                // console.log(address); // ZW - commented it 
                $("#loc" + i).text(address);
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
                // console.log(value.name); // ZW - commented it
                // console.log(value.address); // ZW - commented it 
                // console.log(value.website); // ZW - commented it 
            })
            // ZW - commented it 
            // console.log("County list: ", myCountyArray);// LC-Proof that county info is now reachable within this ajax request. 
        });

        // State Stats API
        var stateURL = "https://api.covidtracking.com/v1/states/wa/current.json";

        $.ajax({
            url: stateURL,
            method: "GET"
        }).then(function (response) {
            // console.log(response);
            var dateString = response.date;
            var dateFormat = moment(dateString, "YYYYMMDD").format('MMMM Do YYYY');
            console.log(dateFormat)
            var totalTested = response.totalTestResults;
            var totalPos = response.positive;
            var totalNeg = response.negative;
            var currentHosp = response.hospitalizedCurrently;
            var deaths = response.death;
            $("#total-tested").text(totalTested);
            $("#positive").text(totalPos);
            $("#negative").text(totalNeg);
            $("#hospitalized").text(currentHosp);
            $("#deaths").text(deaths);
            $("#update-date").text(dateFormat);
            console.log(totalTested, totalPos, totalNeg, currentHosp, deaths);
        });

    });
});

var statesArr = { "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming" }


var getFullState = function (stateAbbr) {
    return statesArr[stateAbbr]

}