var sunriseTime;
var sunsetTime;

var windDirections = [];
var xAxisLabels = [];

var monthToDigitsMap = {};

monthToDigitsMap[0] = 'Jan'
monthToDigitsMap[1] = 'Feb'
monthToDigitsMap[2] = 'Mar'
monthToDigitsMap[3] = 'April'
monthToDigitsMap[4] = 'May'
monthToDigitsMap[5] = 'June'
monthToDigitsMap[6] = 'July'
monthToDigitsMap[7] = 'Aug'
monthToDigitsMap[8] = 'Sept'
monthToDigitsMap[9] = 'Oct'
monthToDigitsMap[10] = 'Nov'
monthToDigitsMap[11] = 'Dec'

document.getElementById("weatherContent").style.display = "none";

function launch_toast() {
    var x = document.getElementById("toast");
    x.className = "show";
    setTimeout(function() { 
        x.className = x.className.replace("show", "");
        document.getElementById("fetchPositionButton").style.display = "block";
    }, 2000);
}

function obtainCurrentTime(unix_timestamp, isItSunrise, isItSunset) {
    var date;
    if (unix_timestamp === null || unix_timestamp === undefined) {
        date = new Date();
    } else {
        date = new Date(unix_timestamp * 1000);
    }
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    hour = updateTime(hour);
    min = updateTime(min);
    sec = updateTime(sec);
    var time = hour + ":" + min + ":" + sec;
    if (hour >= 12) {
        time += " PM";
    } else {
        time += " AM";
    }
    if (isItSunrise === false && isItSunset === false) {
        document.getElementById("currentTime").innerText = time; /* adding time to the div */
        document.getElementById("showDate").innerHTML = date.getDate() + "/" + String(Number(date.getMonth() + 1)) + "/" + date.getFullYear();
    } else if (isItSunrise === true && isItSunset === false) {
        sunriseTime = time;
    } else if (isItSunset === true && isItSunrise === false) {
        sunsetTime = time;
    }

    if (unix_timestamp === null || unix_timestamp === undefined) {
        var t = setTimeout(function() { obtainCurrentTime(undefined, false, false); }, 1000); /* setting timer */
    }
}

function updateTime(k) {
    if (k < 10) {
        return "0" + k;
    } else {
        return k;
    }
}

function setSunriseAndSunSetTime(sunRiseTime, sunSetTime) {
    var ti = document.getElementById("currentTime").innerHTML;
    if (ti.localeCompare(sunRiseTime) < 0) {
        document.getElementById("sunriseTime").innerHTML = "Sun has not risen yet";
        document.getElementById("sunsetTime").innerHTML = "Sun has not set yet";
    } else if (ti.localeCompare(sunSetTime) < 0) {
        document.getElementById("sunriseTime").innerHTML = sunRiseTime;
        document.getElementById("sunsetTime").innerHTML = "Sun has not set yet";
    } else {
        document.getElementById("sunriseTime").innerHTML = sunRiseTime;
        document.getElementById("sunsetTime").innerHTML = sunSetTime;
    }
}

function convertKelvinToCelsius(temperature, parameterID) {
    document.getElementById(parameterID).innerHTML = String(Math.floor(temperature - 273.15));
}

function convertMetreToKilometre(metre, parameterID) {
    document.getElementById(parameterID).innerHTML = String(metre / 1000) + " km";
}

function initialiseWindDirections() {
    windDirections.push("N");
    windDirections.push("N-NE");
    windDirections.push("NE");
    windDirections.push("E-NE");
    windDirections.push("E");
    windDirections.push("E-SE");
    windDirections.push("SE");
    windDirections.push("S-SE");
    windDirections.push("S");
    windDirections.push("S-SW");
    windDirections.push("SW");
    windDirections.push("W-SW");
    windDirections.push("W");
    windDirections.push("W-NW");
    windDirections.push("NW");
    windDirections.push("N-NW");
    windDirections.push("N");
}

function obtainWindDirection(windDegree) {
    windDegree = windDegree % 360;
    windDegree = Math.floor(windDegree / 22.5);
    windDegree = windDegree + 1;
    document.getElementById("windDirection").innerHTML = windDirections[windDegree];
}

function populateXAxisLabels() {
    var todayDate = new Date()
    var currentMonth = todayDate.getMonth()
    var currentDay = todayDate.getDate()

    xAxisLabels.push(monthToDigitsMap[currentMonth] + " " + currentDay)

    for (var i = 1; i <= 7; i++) {

        todayDate.setDate(todayDate.getDate() + 1)

        xAxisLabels.push(monthToDigitsMap[new Date(todayDate).getMonth()] + " " + new Date(todayDate).getDate())
    }
}

function drawLineGraphOfChanceOfRainForNext7Days(forecastedData) {
    var chanceOfRainForNext7Days = [];

    console.log(xAxisLabels)

    for (var i = 0; i < 8; i++) {
        chanceOfRainForNext7Days.push(Math.floor((forecastedData[i].pop) * 100));
    }
    var ctx = document.getElementById('myRainChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',

        // The data for our dataset
        data: {
            labels: xAxisLabels,
            datasets: [{
                label: 'Rain %',
                fill: false,
                backgroundColor: 'rgb(0, 191, 255)',
                borderColor: 'rgb(0, 191, 255)',
                data: chanceOfRainForNext7Days
            }]
        },

        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function drawLineGraphOfTemperatureForNext7Days(forecastedData) {

    var temperatureForeCastForNext7Days = [];

    for (var i = 0; i < 8; i++) {
        temperatureForeCastForNext7Days.push((forecastedData[i].temp.max - 273.15).toFixed(2))
    }

    var ctx = document.getElementById('myTemperatureChart').getContext('2d');

    var chart = new Chart(ctx, {
        type: 'line',

        // The data for our dataset
        data: {
            labels: xAxisLabels,
            datasets: [{
                label: "Temperature in °C",
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: temperatureForeCastForNext7Days,
                fill: false
            }]
        },

        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function hideSpinnerAndWeatherDetails() {
    document.getElementById("loading-image").style.visibility = "hidden";
    document.getElementById("weatherContent").style.display = "none";
}
 
function handleError() {
    hideSpinnerAndWeatherDetails();
    launch_toast();
    document.getElementById("desc").innerHTML = "Some error occurred. PLease try again later";
}

function printDatas(response) {
    try {
        console.log(response);
        populateXAxisLabels();
        document.getElementById("showRainChart").style.display = "block";
        document.getElementById("showTemperatureChart").style.display = "block";
        obtainCurrentTime(response.current.sunrise, true, false);
        obtainCurrentTime(response.current.sunset, false, true);
        obtainCurrentTime(undefined, false, false);
        document.getElementById("weatherTimeZone").innerHTML = response.timezone;
        setSunriseAndSunSetTime(sunriseTime, sunsetTime);
        document.getElementById("windSpeed").innerHTML = response.current.wind_speed + " metre/sec";
        document.getElementById("cloud").innerHTML = response.current.clouds + " %";
        convertKelvinToCelsius(response.current.temp, "showTemperature");
        document.getElementById("weatherDescription").innerHTML = response.current.weather[0].description;
        document.getElementById("weatherDescriptionImage").src = "http://openweathermap.org/img/wn/" + response.current.weather[0].icon + "@2x.png";
        initialiseWindDirections();
        obtainWindDirection(response.current.wind_deg);
        document.getElementById("showHumidity").innerHTML = response.current.humidity + " %";
        convertKelvinToCelsius(response.current.feels_like, "feelsLike");
        drawLineGraphOfChanceOfRainForNext7Days(response.daily);
        document.getElementById("rainForecast").style.visibility = "visible";
        drawLineGraphOfTemperatureForNext7Days(response.daily)
        document.getElementById("temperatureForecast").style.visibility = "visible";
        document.getElementById("atmosphericPressure").innerHTML = response.current.pressure + " hPa";
        convertKelvinToCelsius(response.current.dew_point, "dewPoint");
        convertMetreToKilometre(response.current.visibility, "visibleDistance");
    } catch (e) {
        handleError();
    }
}

function success(position) {
    try {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;

        var request = new XMLHttpRequest();

        // Open a new connection, using the GET request on the URL endpoint
        request.open('GET', 'https://api.openweathermap.org/data/2.5/onecall?lat=' + latitude + '&lon=' + longitude + '&appid=caea05c347ae37456e527d4f89f0243d', true);

        request.onload = function() {
            // Begin accessing JSON data here
            var data = JSON.parse(this.response);

            if (request.status >= 200 && request.status < 400) {
                document.getElementById("weatherContent").style.display = "block";
                printDatas(data);
                //console.log(data.current.clouds);
            } else {
                console.log('error');
            }

            document.getElementById("loading-image").style.visibility = "hidden";
        };

        // Send request
        request.send();
    } catch (e) {
        handleError();
    }
}

function error() {
    hideSpinnerAndWeatherDetails();
    launch_toast();
    document.getElementById("desc").innerHTML = "Location Access is blocked. Please allow location access";
}

function getPosition() {
    document.getElementById("toast").style.display = "none";
    document.getElementById("loading-image").style.visibility = "visible";
    document.getElementById("fetchPositionButton").style.display = "none";
    var positionValues = navigator.geolocation.getCurrentPosition(success, error);
}