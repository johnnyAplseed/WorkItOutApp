//return random int from min max params
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function loadBgImage () {
//get body element
var bodyBackground = window.document.getElementsByTagName("body");
//randomly choose background image from folder of bgs
var randomNumber = randomIntFromInterval(1,9);
    if (window.location.toString().includes("index")) {
        bodyBackground[0].style.backgroundImage = "url('images/Backgrounds/bg" + randomNumber +".webp')"
    }else {
        bodyBackground[0].style.backgroundImage = "url('../images/Backgrounds/bg" + randomNumber +".webp')"
    }
}

loadBgImage();
