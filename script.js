// Wait for everything is loaded, then execute function
$(document).ready(function () {
    // Call modal
    $('.modal').modal();

    // Display city history on loading
    displayHistory();

    // When user clicks city, state in history, display info regarding that city and state
    $(document).on("click", ".collection-item", function (event) {
        event.preventDefault();
        $(".modal-trigger").show();
        // Get the ID of city that user clicks
        var cityID = event.target.id;

        // Look in local storage for the paired state
        var cityIndex = cityID[cityID.length - 1];

        // Get city and state from local storage
        var cityName = JSON.parse(localStorage.getItem("storageCity"))[cityIndex];
        var stateName = JSON.parse(localStorage.getItem("storageState"))[cityIndex];

        // Call APIs
        ajaxCalls(cityName, stateName, getFullState(stateName));
    });

    // When user clicks the search button, call storeInput()
    $("#submit-btn").on("click", storeInput);

    //
    $("#submit-btn").on("click", function (event) {
        event.preventDefault();
        // Assign variables to input values
        var cityName = ($("#city-search").val()).toLowerCase().trim();
        var stateName = ($("#state-search").val()).toUpperCase();
        var fullStateName = getFullState(stateName);
        // console.log(cityName, stateName, fullStateName)
        $("input").val("");

        if (cityName.length > 0 && stateName.length === 2) {
            $(".modal-trigger").show();
            ajaxCalls(cityName, stateName, fullStateName);
        }
    });

    // When user clicks the clear button, clear search history
    $("#clear-btn").on("click", function () {

        var numCities = JSON.parse(localStorage.getItem("storageCity")).length;
        localStorage.clear();

        for (var i = 0; i < numCities; i++) {
            // Display only placeholder
            $("#hist" + i).html("&nbsp");
        }

    });
    
    function displayHistory() {

        // Check if local storage is empty
        var storageCityArray = JSON.parse(localStorage.getItem("storageCity")) || [];
        var storageStateArray = JSON.parse(localStorage.getItem("storageState")) || [];

        // Display local storage city and state to history, format: Seattle, WA
        storageCityArray.forEach(function (cityEl, index) {
            // $("#hist" + index).css("display", "block");
            $("#hist" + index).text(cityEl + ", " + storageStateArray[index]);
        });

    }

    function storeInput(event) {

        event.preventDefault();

        var maxLength = 5;
        // Check input validity
        var cityInput = $("#city-search").val().trim();
        var stateInput = $("#state-search").val().trim();

        // Display modal with error messages
        if (cityInput === "" && stateInput === "") {
            $("#error-message").text("Please enter a city and a state.");
            displayModal();

        } else if (cityInput === "" && stateInput.length > 0) {
            $("#error-message").text("Please enter a city.");
            displayModal();

        } else if (cityInput.length > 0 && stateInput === "") {
            $("#error-message").text("Please enter a state code.");
            displayModal();

        } else if (cityInput.length > 0 && stateInput.length != 2) {
            $("#error-message").text("Please enter a correct state code.");
            displayModal();
        } else {
            // Change to uppercase
            cityInput = cityToUpperCase(cityInput);
            stateInput = stateInput.toUpperCase();

            var storageCityArray = JSON.parse(localStorage.getItem("storageCity")) || [];
            var storageStateArray = JSON.parse(localStorage.getItem("storageState")) || [];
            
            // If the user input is not in city history
            if (storageCityArray.indexOf(cityInput) === -1) {
                
                // If the length of city array is less than max allowable length
                if (storageCityArray.length < maxLength) {
    
                    // Add city and state to the end of array
                    storageCityArray.push(cityInput);
                    storageStateArray.push(stateInput);
    
                } else {
                    
                    // Otherwise delete the first city, state then add input to the end of array
                    storageCityArray.shift();
                    storageStateArray.shift();
                    storageCityArray.push(cityInput);
                    storageStateArray.push(stateInput);
    
                }

                // Set the new array to local storage
                localStorage.setItem("storageCity", JSON.stringify(storageCityArray));
                localStorage.setItem("storageState", JSON.stringify(storageStateArray));
                
                displayHistory();
    
            } 

        }


    }

    function displayModal() {
        $(".error-modal").show();
        $(".close").on("click", function () {
            $(".error-modal").css("display", "none");
        });
    }

    function ajaxCalls(cityName, stateName, fullStateName) {
        // Lon and Lat API Call
        console.log(cityName,stateName,fullStateName);
        $.ajax({
            url: "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "," + fullStateName + "&appid=e0b82fbe866155125ec89e15985f0d60",
            method: "GET"
        }).then(function (response) {
            var cityLatitude = response.coord.lat;
            var cityLongitude = response.coord.lon;

            // Testing Center API Call
            var testingCenterKey = "aUGtjGfxYZm_i4czjxJiqasqeMEkhvjaRig_VG6cUtA";
            var resultLimit = 5;  // Limit to 5 results
            var testingCenterURL = "https://discover.search.hereapi.com/v1/discover?apikey=" + testingCenterKey + "&q=Covid&at=" + cityLatitude + "," + cityLongitude + "&limit=" + resultLimit;

            $.ajax({
                url: testingCenterURL,
                method: "GET"
            }).then(function (testingCenterResponse) {

                for (var i = 0; i < resultLimit; i++) {

                    var address = testingCenterResponse.items[i].address.label.split(":")[1];

                    // $("#loc" + i).css("display", "block");
                    $("#loc" + i).html("<span><i class='tiny material-icons'>add_location</i></span>&nbsp"+address);

                }

                var countyName = testingCenterResponse.items[0].address.county;

                // Health Department API Call

                // Convert state name to all lower case and replace spaces with hyphens is applicable
                if (fullStateName.indexOf(' ') >= 0) {
                    var healthDeptState = (fullStateName.toLowerCase()).replace(/\s/g, "-");
                }
                else {
                    var healthDeptState = fullStateName.toLowerCase();
                };

                var healthDeptURL = "https://postman-data-api-templates.github.io/county-health-departments/api/" + healthDeptState + ".json";

                $.ajax({
                    url: healthDeptURL,
                    method: "GET"
                }).then(function (response) {
                    // console.log(countyName);
                    // console.log(response);
                    response.forEach(function (countyEl) {
                        if (countyEl.name.includes(countyName)) {
                            // Display county info
                            $("#county-name").text(countyEl.name);
                            $("#phone-number").text(countyEl.phone);
                            $("#county-address").attr("href",countyEl.address);
                            $("#county-url").text("Website");
                            $("#county-url").attr("href", countyEl.website);
                            $("#county-url").attr("target", "blank");
                        }
                    });
                });
            });
        });
        // State Stats API
        var stateURL = "https://api.covidtracking.com/v1/states/" + stateName + "/current.json";

        $.ajax({
            url: stateURL,
            method: "GET"
        }).then(function (response) {
            // console.log(response);
            var dateString = response.date;
            var dateFormat = moment(dateString, "YYYYMMDD").format('MMMM Do YYYY');
            // console.log(dateFormat)
            var totalTested = (response.totalTestResults).toLocaleString('en');
            var totalPos = (response.positive).toLocaleString('en');
            var totalNeg = (response.negative).toLocaleString('en');
            var currentHosp = (response.hospitalizedCurrently).toLocaleString('en');
            var deaths = (response.death).toLocaleString('en');
            $("#state-name").text(fullStateName);
            $("#total-tested").text(totalTested);
            $("#positive").text(totalPos);
            $("#negative").text(totalNeg);
            $("#hospitalized").text(currentHosp);
            $("#deaths").text(deaths);
            $("#update-date").text(dateFormat);
            // console.log(totalTested, totalPos, totalNeg, currentHosp, deaths);
        });

        $.ajax({
            url: "https://api.covidtracking.com/v1/states/" + stateName + "/daily.json",
            method: "GET"
        }).then(function (response) {
            var neg = 0;
            var pos = 0;
            var dead = 0;
            var negPts = [];
            var posPts = [];
            var deadPts = [];
            var months = [];
            function monthly(start, end) {
                for (var i = start; i < end; i++) {
                    neg += parseInt(response[i].positiveIncrease);
                    pos += parseInt(response[i].positive);
                    dead += parseInt(response[i].death);
                    var negAvg = (neg / 30).toFixed(0);
                    var posAvg = ((pos / 30) / 10).toFixed(0);
                    var deadAvg = (dead / 30).toFixed(0);
                    var avgArr = [negAvg, posAvg, deadAvg];
                }
                return avgArr;
            };
    
            var m1 = monthly(0,29);
            var m2 = monthly(30,59);
            var m3 = monthly(60,89);
            var m4 = monthly(90,119);
            var m5 = monthly(120,149);
            var m6 = monthly(150,179);
            var nest = [m1,m2,m3,m4,m5,m6];
    
            function categorize(cat,index) {
                for (var j=0;j<6;j++) {
                    cat.push(nest[j][index]);
                }
                return cat;
            }

            negPts = categorize(negPts, 0);
            posPts = categorize(posPts, 1);
            deadPts = categorize(deadPts, 2);
            // console.log(negPts,posPts,deadPts);

            function lastSixMonths() {
                var current = moment().format('MMMM');
                months.push(current);
                for (var k = 1; k < 6; k++) {
                    var prvMonth = moment().subtract(k, 'months').format('MMMM');
                    months.unshift(prvMonth);
                }
                return months;
            }

            var ctx = document.getElementById("myLineChart");
            var myLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Total Positive Cases (x10)',
                        data: posPts,
                        backgroundColor: 'rgba(218,11,11,1)',
                        borderColor: 'rgba(218,11,11,1)',
                        fill: false
                    }, {
                        label: 'Average Daily Increase in Positive Cases',
                        data: negPts,
                        backgroundColor: 'rgba(33,179,20,1)',
                        borderColor: 'rgba(33,179,20,1)',
                        fill: false
                    }, {
                        label: 'Total Deaths',
                        data: deadPts,
                        backgroundColor: 'rgba(86,24,220,1)',
                        borderColor: 'rgba(86,24,220,1)',
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            type: 'category',
                            labels: lastSixMonths(),
                        }]
                    },
                    title: {
                        display: true,
                        text: 'Historic State COVID-19 Data (6-Months)'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            });

        });
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

});

var statesArr = { "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming" }

function getFullState(stateAbbr) {
    return statesArr[stateAbbr]
}

//  Graph Modal Controls
$(".modal-trigger").on("click", function (event) {
    event.preventDefault();
    $(".graph-modal").show();
});

$(".modal-close").click(function () {
    $(".modal").hide();
});
