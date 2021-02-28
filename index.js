require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const minify = require('html-minifier').minify;
const jsObfuscate = require('javascript-obfuscator');
const Geo = require('@maxmind/geoip2-node').Reader;
const cors = require('cors');

const PORT = process.env.PORT || 5000

const jsCode = fs.readFileSync('assets/main.js', 'utf8');
const css = fs.readFileSync('assets/styles.css', 'utf8');
const htmlFile = fs.readFileSync('views/index.ejs', 'utf8');

const asnBuffer = fs.readFileSync(path.join(__dirname, '/bd/GeoLite2-ASN.mmdb'));
const asnReader = Geo.openBuffer(asnBuffer);
const cityBuffer = fs.readFileSync(path.join(__dirname, '/bd/GeoLite2-City.mmdb'));
const cityReader = Geo.openBuffer(cityBuffer);

const js = process.env.NODE_ENV == "PROD" ? jsObfuscate.obfuscate(jsCode, {
  splitStrings: true,
  stringArrayEncoding: ["base64"],
  domainLock: ["http://www.velocirapid.com/", "velocirapid.com", "localhost", "velocirapid.herokuapp.com"]
}).getObfuscatedCode() : false;

const html = ejs.render(htmlFile, {
  js: js || jsCode,
  css: css
});

const minifyHTML = process.env.NODE_ENV == "PROD" ? minify(html, {
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: true
}) : false;


const getIps = (req, res) => {

  const geoHelper = (ip) => {

    var data = {};

    try {
      const resasn = asnReader.asn(ip);
      if (resasn && resasn.autonomousSystemOrganization) {
        data.isp = resasn.autonomousSystemOrganization;
      }
    } catch (error) {
      //console.log(error)
    }

    try {
      const rescity = cityReader.city(ip);
      if (rescity) {

        if (rescity.city && rescity.city.names && rescity.city.names.en)
          data.city = rescity.city.names.en;

        if (rescity.registeredCountry && rescity.registeredCountry.isoCode)
          data.country = rescity.registeredCountry.isoCode
      }
    } catch (error) {
      //console.log(error)
    }
    
    return data;
  }

  let ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.headers['HTTP_CLIENT_IP'] ||
    req.headers['X-Real-IP'] ||
    req.headers['HTTP_X_FORWARDED_FOR'];

  ip = ip.replace("::ffff:","");

  let result = "IP and Geolocation / ISP not found or recognized.";

  if (ip && ip == "::1") {
    result = "Localhost in somewhere at the world"
  } else if (ip) {
    result = `IP: ${ip}`;

    let dataInfo = false;
    try {
      dataInfo = geoHelper(ip);
    } catch (error) {
      dataInfo = false;
    }

    if (dataInfo && (dataInfo.isp || dataInfo.city || dataInfo.country)) {
      result += ` - ${dataInfo.isp || "ISP not found"}, ${dataInfo.city || "City not found"} / ${dataInfo.country === "BR" ? "Brasil" : "Brasil"}`;
    }
  }

  res.status(200).send(result);
}

express()
  .use(cors({
    origin: 'velocirapid.com'
  }))
  .use(express.static(path.join(__dirname, 'public')))
  .get('/', (req, res) => {
    res.status(200).send(minifyHTML || html);
  })
  .post('/upload', (req, res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.set("Cache-Control", "post-check=0, pre-check=0");
    res.set("Pragma", "no-cache");
    res.set("Connection", "keep-alive");

    res.status(200).send('Alive');
  })
  .get('/getip', getIps)
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
