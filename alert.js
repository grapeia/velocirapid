const request = require('request')
const webhook = "https://chat.googleapis.com/v1/spaces/AAAAS3IsPkc/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=PAje_0SJE5HXnYMoGGhXpllcptwOAqtpu8AtKxvCEd0%3D";

var alertService = {
    sendAlert: (message) => {
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


module.exports = Object.create(alertService);