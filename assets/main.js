var fileAddr = [{
    size: 5716782,
    url: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/DAP_story_first.gif',
},
{
    size: 4110761,
    url: 'https://storage.googleapis.com/is-now-illegal.appspot.com/gifs/PUTEIRO.gif',
},
{
    size: 3121128,
    url: 'https://storage.googleapis.com/gd-newsletter/weekly-newsletter-assets/191001_Gem_Jonas-Naimark.gif',
},
{
    size: 4546480,
    url: 'https://storage.googleapis.com/gd-newsletter/weekly-newsletter-assets/180216_Scrolling_Sharon-Harris.gif',
},
{
    size: 12577693,
    url: 'https://storage.googleapis.com/gd-newsletter/weekly-newsletter-assets/191112_Googley-Goop_Brien-Hopkins.gif',
},
{
    size: 12017081,
    url: 'https://storage.googleapis.com/gd-newsletter/weekly-newsletter-assets/191029_interrobang_hopkins.gif',
},
{
    size: 2943262,
    url: 'https://storage.googleapis.com/gd-newsletter/weekly-newsletter-assets/191008_2_ig_first_post_560x560.gif',
},
{
    size: 19956331,
    url: 'https://storage.googleapis.com/gd-newsletter/weekly-newsletter-assets/190806_Chill_Sharon-Harris.gif',
},
];
var downStreams = 6;
const downTimeUpMax = 12;

var ulTotal = 20;
var ulStreams = 3;
const ulTimeUpMax = 12;

const overheadCompensationFactor = 1.06;
const bits = 8;
const megaByte = 1048576; //1MB

var ping;

var agent = navigator.userAgent;
if (/Chrome.(\d+)/i.test(agent) && /Android|iPhone|iPad|iPod|Windows Phone/i.test(agent)) {
    downStreams = 4;
    ulTotal = 5;
    ulStreams = 3;
    fileAddr = fileAddr.filter(d => d.size < 5000000);
} else {
    fileAddr = fileAddr.filter(d => d.size >= 5000000);
}

fileAddr = fileAddr.sort((a, b) => (a.size < b.size) ? 1 : -1);

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

async function checkFiles() {

    let pingTest = (file) => {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('error', (err, msg) => {
                reject(false);
            });
            image.addEventListener('load', (err, msg) => {
                resolve(file);
            });
            image.src = file.url + "?nnn=" + getNow();
        });
    }

    var file = false;
    while (fileAddr.length > 0 && !file) {
        file = await pingTest(fileAddr.shift())
    }
    downTest(file);

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
        pingf.open("GET", window.location.pathname + "?r=" + ping, true);
        ping = getNow();
        pingf.send();
    })
}

function getIp() {
    let reqIP = new XMLHttpRequest();
    reqIP.onreadystatechange = () => {
        if (reqIP.readyState == 4 && reqIP.status == 200) {
            ShowProgressMessage("ip", reqIP.responseText);
        }
    }
    reqIP.open("GET", window.location.pathname + "getip", true);
    reqIP.send();

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

var downCalled = false;
function downTest(file) {
    if (downCalled) return;
    downCalled = true;

    var startDownload, lastTimeDownload, downloadTotal = 0, stopDownTest, count = 0;
    var images = [];

    const url = file.url;
    const contentLenght = file.size;


    const updateInfo = () => {
        let duration = (lastTimeDownload - startDownload) / 1000;
        let bitsLoaded = (contentLenght * count * bits * overheadCompensationFactor);
        let speedT = (bitsLoaded / duration);
        if (!isNaN(speedT))
            ShowProgressMessage("download", "&darr; " + speedText(speedT));

        if (!images.find(d => !d.complete) && stopDownTest) {
            downCalled = false;
            ulTest();
        }
    }

    const downTest = (i, delay = 0) => {
        setTimeout(() => {
            images[i] = new Image();
            images[i].addEventListener('load', (err, msg) => {
                lastTimeDownload = getNow() - 1;
                count++;
                updateInfo();
                if (!stopDownTest) {
                    downTest(i, 0);
                }
            });
            images[i].src = `${url}?nocache=${Math.random()}`;
        }, 1 + i * delay);
    }

    startDownload = getNow();
    for (var i = 0; i < downStreams; i++) {
        downTest(i, 300);
    }

    setTimeout(() => {
        stopDownTest = true;
    }, downTimeUpMax * 1000);

}

var ulCalled = false;
function ulTest() {
    if (ulCalled) return;
    ulCalled = true;

    ShowProgressMessage("upload", "Getting dino upload...");

    var startUpload, totalUploaded = 0;

    var r = new ArrayBuffer(megaByte);
    var maxInt = Math.pow(2, 32) - 1;
    try {
        r = new Uint32Array(r);
        for (var i = 0; i < r.length; i++) r[i] = Math.random() * maxInt;
    } catch (e) { }
    var req = [];
    var reqsmall = [];
    for (var i = 0; i < ulTotal; i++) req.push(r);
    const blob = new Blob(req);

    var xhr = [];

    var upTest = (i, delay = 0) => {
        setTimeout(() => {
            var prevLoaded = 0
            let a = new XMLHttpRequest();
            xhr[i] = a;
            xhr[i].upload.onprogress = function (event) {
                var loadDiff = event.loaded <= 0 ? 0 : event.loaded - prevLoaded;
                if (isNaN(loadDiff) || !isFinite(loadDiff) || loadDiff < 0) return;
                totalUploaded += loadDiff;
                prevLoaded = event.loaded;
            };
            xhr[i].upload.onload = function () {
                upTest(i, 0);
            };
            xhr[i].upload.onerror = function () {
                try {
                    xhr[i].abort();
                } catch (e) { }
                delete xhr[i];
                upTest(i, 0);
            };
            xhr[i].open("POST", "upload?nocache=" + Math.random(), true);
            xhr[i].send(blob);
        }, 1 + i * delay);
    }

    var startUpload = getNow();
    for (var i = 0; i < 3; i++) {
        upTest(i, 200);
    }

    var interval = setInterval(() => {
        let duration = (getNow() - startUpload) / 1000;
        let bitsLoaded = (totalUploaded * bits * overheadCompensationFactor);
        let speedT = speedText(bitsLoaded / duration);
        ShowProgressMessage("upload", "&uarr; " + speedT);
        if (duration > ulTimeUpMax) {
            clearRequests(xhr);
            clearInterval(interval);
            ulCalled = false;
        }
    }, 200)
}

function clearRequests(xhr) {
    if (xhr) {
        for (var i = 0; i < xhr.length; i++) {
            try {
                xhr[i].onprogress = null;
                xhr[i].onload = null;
                xhr[i].onerror = null;
            } catch (e) { }
            try {
                xhr[i].upload.onprogress = null;
                xhr[i].upload.onload = null;
                xhr[i].upload.onerror = null;
            } catch (e) { }
            try {
                xhr[i].abort();
            } catch (e) { }
            try {
                delete xhr[i];
            } catch (e) { }
        }
        xhr = null;
    }
}

function InitiateSpeedDetection() {
    ShowProgressMessage("download", "Getting dino speed...");
    getPing();
    window.setTimeout(checkFiles, 2000);
    window.setTimeout(getIp, 1000);
};

if (window.addEventListener) {
    window.addEventListener('load', InitiateSpeedDetection, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', InitiateSpeedDetection);
}
