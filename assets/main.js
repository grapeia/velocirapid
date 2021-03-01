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

const isMobile = (() => {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
})();


const downStreamsMax = isMobile? 5:10;

const ulTotal = isMobile ? 5 : 20;
const ulStreams = 3;
const ulTimeUpMax = 12;

const overheadCompensationFactor = 1.06;
const bits = 8;
const megaByte = 1048576; //1MB

var ping;

fileAddr = isMobile ? fileAddr.filter(d => d.size < 5000000) : fileAddr.filter(d => d.size >= 5000000);
fileAddr = fileAddr.sort((a, b) => (a.size < b.size) ? 1 : -1);

const getNow = () => (new Date()).getTime();

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

    let promis = [...Array(downStreamsMax).keys()].map((i) =>
        new Promise((resolve, reject) => {
            images[i] = new Image();
            images[i].addEventListener('load', () => {
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

var ulCalled = false;
function ulTest() {
    if (ulCalled) return;
    ulCalled = true;

    ShowProgressMessage("upload", "Getting upload...");

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
    ShowProgressMessage("download", "Getting speed...");
    getPing();
    window.setTimeout(checkFiles, 2000);
    window.setTimeout(getIp, 1000);
};

if (window.addEventListener) {
    window.addEventListener('load', InitiateSpeedDetection, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', InitiateSpeedDetection);
}
