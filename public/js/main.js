
const fileAddr = [{
    size: 5716782,
    url: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/DAP_story_first.gif',
}];
const maxConn = 20;
const overheadCompensationFactor = 1.06;
const bits = 8;
const refBytes = 1048576; //1MB
const ulStreams = 5;

var ulCalled = false;
var ping;

function getNow() { return (new Date()).getTime() };

function ShowProgressMessage(type, msg) {
    if (console) {
        if (typeof msg == "string") {
            console.log(msg);
        } else {
            for (var i = 0; i < msg.length; i++) {
                console.log(msg[i]);
            }
        }
    }

    var oProgress = document.getElementById(type);
    if (oProgress) {
        var actualHTML = (typeof msg == "string") ? msg : msg.join("<br />");
        oProgress.innerHTML = actualHTML;
    }
}

function checkFiles() {

    let pingTest = (file) => {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('error', (err, msg) => {
                reject('error');
            });
            image.addEventListener('load', (err, msg) => {
                resolve(file);
            });
            image.src = file.url + "?nnn=" + getNow();
        });
    }

    var promises = [];
    fileAddr.forEach(file => {
        let prom = pingTest(file);
        promises.push(prom);
    });

    Promise.race(promises).then(file => {
        //console.log(file);
        downTest(file);
    }).catch(err => {
        console.log(err)
    })
}

function getPing() {
    return new Promise((resolve, reject) => {
        let pingf = new XMLHttpRequest();
        let pingcalc = () => {
            if (pingf.readyState == 4) {
                ping = getNow() - ping;
                resolve(ping)
            }
            console.log("Ping::", `${ping}ms`);
        }
        pingf.onload = pingcalc;
        pingf.onerror = pingcalc;
        ping = getNow();
        pingf.open("GET", window.location.pathname + "?r=" + ping, true);
        pingf.send();
    })
}

function speedText(speed) {
    const units = ['', 'K', 'M', 'G', 'T'];
    const places = [0, 1, 2, 3, 3];
    let unit = 0;
    while (speed >= 2000 && unit < 4) {
        unit++;
        speed /= 1000;
    }
    return `${speed.toFixed(places[unit])} ${units[unit]}bps`;
}

function downTest(file) {
    var startTime, count = 0;
    var images = [];

    var url = file.url;
    var contentLenght = file.size;

    var showResultsDown = () => {
        let duration = (getNow() - startTime) / 1000;
        let bitsLoaded = contentLenght * bits * count * overheadCompensationFactor;
        let speedT = speedText(bitsLoaded / duration);
        ShowProgressMessage("download", "&darr; " + speedT);
    }

    let promis = [...Array(maxConn).keys()].map((i) =>
        new Promise((resolve, reject) => {
            images[i] = new Image();
            images[i].addEventListener('load', (err, msg) => {
                count++;
                showResultsDown();
                resolve();
            });
            images[i].src = `${url}?nnn=${getNow()}${i}`;
        })
    );

    startTime = getNow();
    Promise.all(promis).then(result => {
        showResultsDown();
        ulTest();
    });
}

async function ulTest() {
    if (ulCalled) return;

    ulCalled = true;

    ShowProgressMessage("upload", "Getting dino upload...");

    var upTest = (data) => {
        return new Promise((resolve, reject) => {
            var http = new XMLHttpRequest();
            http.open("POST", "?time=" + getNow());
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            http.setRequestHeader('Accept', '*/*');
            http.onreadystatechange = () => {
                if (http.readyState == 4 && http.status == 200) {
                    resolve()
                }
            }
            http.send(data);
        });
    }

    var dataRef = "e=";
    for (var i = 0; i < refBytes - 2; i++) {
        dataRef += "k";
    }

    let startRef = getNow();
    await upTest(dataRef);
    let timeRef = (getNow() - startRef) / 1000;
    let speedRef = dataRef.length * bits / timeRef;
    console.log("Upload Test for Reference" + speedText(speedRef))

    let upInstances = [];

    var dataTest = "e=";
    for (var i = 0; i < speedRef / 10; i++) {
        dataTest += "k";
    }

    for (var i = 0; i < ulStreams; i++) {
        upInstances.push(upTest(dataTest));
    }

    var startUpload = getNow();
    await Promise.all(upInstances);
    let totalTime = (getNow() - startUpload) / 1000;
    console.log(totalTime + "s");
    let speed = (dataTest.length * bits * ulStreams / totalTime);
    console.log("Upload " + speedText(speed))
    ShowProgressMessage("upload", "&uarr; " + speedText(speed));
    ulCalled = false;
}

function InitiateSpeedDetection() {
    ShowProgressMessage("download", "Getting dino speed...");
    getPing();
    window.setTimeout(checkFiles, 2000);
};

if (window.addEventListener) {
    window.addEventListener('load', InitiateSpeedDetection, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', InitiateSpeedDetection);
}

