var sunriseTime;
var sunsetTime;

document.getElementById("weatherContent").style.display = "none";

function launch_toast() {
    var x = document.getElementById("toast");
    x.className = "show";
    setTimeout(function() { x.className = x.className.replace("show", ""); }, 5000);
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

function convertKelvinToCelsius(temperature) {
    document.getElementById("showTemperature").innerHTML = String(temperature - 273.15);
}

function printDatas(response) {
    obtainCurrentTime(response.current.sunrise, true, false);
    obtainCurrentTime(response.current.sunset, false, true);
    obtainCurrentTime(undefined, false, false);
    document.getElementById("weatherTimeZone").innerHTML = response.timezone;
    setSunriseAndSunSetTime(sunriseTime, sunsetTime);
    document.getElementById("windSpeed").innerHTML = response.current.wind_speed + " metre/sec";
    document.getElementById("cloud").innerHTML = response.current.clouds + " %";
    convertKelvinToCelsius(response.current.temp);
}

function success(position) {
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
}

function error() {
    document.getElementById("loading-image").style.visibility = "hidden";
    document.getElementById("fetchPositionButton").style.display = "block";
    launch_toast();
    console.log("Geo Location not working");
}

function getPosition() {
    document.getElementById("loading-image").style.visibility = "visible";
    document.getElementById("fetchPositionButton").style.display = "none";
    var positionValues = navigator.geolocation.getCurrentPosition(success, error);
    console.log(positionValues);
}