require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const exec = require('child_process').exec;

const secret = process.env.DEPLOY_SECRET;

http.createServer(function (req, res) {
    req.on('data', function (chunk) {
        console.log(chunk)
        let sig = "sha1=" + crypto.createHmac('sha1', secret).update(chunk.toString()).digest('hex');

        if (req.headers['x-hub-signature'] == sig) {
            exec('cd ' + __dirname + ' && git pull && pm2 restart ');
        }
    });

    res.end();
}).listen(8080);