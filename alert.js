const request = require('request')
const webhook = process.env.ALERT_URL || false;

var alertService = {
    sendAlert: (message) => {
        if (webhook) {
            request({
                url: webhook,
                method: 'POST',
                json: {
                    'text': message,
                }
            }, (error, response, body) => {
                if (error) {
                    console.log('Error sending message: ', error)
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error)
                }
            })
        }
    }
}

module.exports = Object.create(alertService);