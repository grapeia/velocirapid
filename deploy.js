require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const exec = require('child_process').exec;

const secret = process.env.DEPLOY_SECRET;
const port = process.env.DEPLOY_PORT;

http.createServer(function (req, res) {
    req.on('data', function (chunk) {
        console.log(chunk)
        let sig = "sha1=" + crypto.createHmac('sha1', secret).update(chunk.toString()).digest('hex');

        if (req.headers['x-hub-signature'] == sig) {
            console.log(`Deploying...`);
            let comm = `cd ${__dirname} && git pull && pm2 restart all`;
            console.log(comm);
            exec(comm);
        }
    });

    res.end();
}).listen(port, () => {
    console.log(`Deploy ready on ${port} port`)
});