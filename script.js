// Wait for everything is loaded, then execute function
$(document).ready(function () {
    $('.modal').modal();

    // Once search button is clicked, call storeInput()
    displayHistory();
    $(document).on("click", ".collection-item", function (event) {
        event.preventDefault();

        // Get user input
        cityID = event.target.id;
        cityIndex = cityID[cityID.length - 1];
        cityName = JSON.parse(localStorage.getItem("storageCity"))[cityIndex];
        stateName = JSON.parse(localStorage.getItem("storageState"))[cityIndex];
        // console.log(cityName, stateName);
        ajaxCalls(cityName, stateName, getFullState(stateName));
    });

    $("#submit-btn").on("click", storeInput);

    function displayHistory() {

        // Check if local storage is empty
        var storageCityArray = JSON.parse(localStorage.getItem("storageCity")) || [];
        var storageStateArray = JSON.parse(localStorage.getItem("storageState")) || [];

        // console.log(storageCityArray);
        // console.log(storageStateArray);

        // Display local storage city and state to history, format: Seattle, WA
        storageCityArray.forEach(function (cityEl, index) {
            $("#hist" + index).css("display", "block");
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
        }

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
            // console.log(cityLongitude, cityLatitude)
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
                    $("#loc" + i).css("display", "block");
                    $("#loc" + i).text(address);

                    // myCountyArray.push(testingCenterResponse.items[i].title, testingCenterResponse.items[i].address.county);//LC-This will push county information to myCountyArray
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
                            $("#county-address").text(countyEl.address);
                            $("#county-url").text("Website");
                            $("#county-url").attr("href", countyEl.website);
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
            url: "https://api.covidtracking.com/v1/states/"+stateName+"/daily.json",
            method: "GET"
        }).then(function(response){
            var neg = 0;
            var pos = 0;
            var dead = 0;
            var negPts = [];
            var posPts = [];
            var deadPts = [];
            var months = [];
            function monthly(start,end) {
                for (var i=start; i<end; i++) {
                    neg += parseInt(response[i].positiveIncrease);
                    pos += parseInt(response[i].positive);
                    dead += parseInt(response[i].death);
                    var negAvg = (neg/30).toFixed(0);
                    var posAvg = ((pos/30)/10).toFixed(0);
                    var deadAvg = (dead/30).toFixed(0);
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
    
            negPts = categorize(negPts,0);
            posPts = categorize(posPts,1);
            deadPts = categorize(deadPts,2);
            // console.log(negPts,posPts,deadPts);
    
            function lastSixMonths() {
                var current = moment().format('MMMM');
                months.push(current);
                for (var k=1;k<6;k++) {
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

    
});

var statesArr = { "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming" }

function getFullState(stateAbbr) {
    return statesArr[stateAbbr]
}
// var getFullState = function (stateAbbr) {
//     return statesArr[stateAbbr]

//  Graph Modal Controls
$(".modal-trigger").on("click", function(event) {
    event.preventDefault();
    $(".graph-modal").show();
});


$(".modal-close").click(function() {
    $(".modal").hide();
});
