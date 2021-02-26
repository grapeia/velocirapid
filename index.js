const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000
const fs = require('fs');
const ejs = require('ejs');
const minify = require('html-minifier').minify;
const javaScriptObfuscator = require('javascript-obfuscator');
const Geo = require('@maxmind/geoip2-node').Reader;

const jsCode = fs.readFileSync('assets/main.js', 'utf8');
const css = fs.readFileSync('assets/styles.css', 'utf8');
const htmlFile = fs.readFileSync('views/index.ejs', 'utf8');

const js = javaScriptObfuscator.obfuscate(jsCode, {
  splitStrings: true,
  stringArrayEncoding: ["base64"],
  domainLock: ["velocirapid.com", "localhost", "velocirapid.herokuapp.com"]
}).getObfuscatedCode();

const html = ejs.render(htmlFile, {
  js: js,
  css: css
});

const minifyHTML = process.env.NODE_ENV == "PROD"? minify(html, {
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: true
}) : false;


const getIps = async (req, res) => {

  const geoHelper = async (ip) => {

    var data = {};

    await Geo.open(path.join(__dirname, '/bd/GeoLite2-ASN.mmdb')).then(reader => {
      const res = reader.asn(ip);
      if (res && res.autonomousSystemOrganization)
        data.isp = res.autonomousSystemOrganization;
    }).catch(function (err) {
      //console.log(err)
    });

    await Geo.open(path.join(__dirname, '/bd/GeoLite2-City.mmdb')).then(reader => {
      const res = reader.city(ip);
      if (res) {

        if (res.city && res.city.names && res.city.names.en)
          data.city = res.city.names.en;

        if (res.registeredCountry && res.registeredCountry.isoCode)
          data.country = res.registeredCountry.isoCode
      }
    }).catch(function (err) {
      console.log(err)
    });

    return data;
  }

  let ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.headers['HTTP_CLIENT_IP'] ||
    req.headers['X-Real-IP'] ||
    req.headers['HTTP_X_FORWARDED_FOR'];

  if (ip.substr(0, 7) == "::ffff:")
    ip = ip.substr(7)

  let result = "IP and Geolocation / ISP not found or recognized.";

  if (ip && ip == "::1") {
    result = "Localhost in somewhere in the world"
  } else if (ip) {
    result = `IP: ${ip}`;

    let json = false;
    try {
      json = await geoHelper(ip);
    } catch (error) {
      json = false;
    }

    if (json && (json.isp || json.city || json.country)) {
      result += ` - ${json.isp || "ISP not found"}, ${json.city || "City not found"} / ${json.country === "BR" ? "Brasil" : "Brasil"}`;
    }
  }
  
  res.status(200).send(result);
}

express()
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
