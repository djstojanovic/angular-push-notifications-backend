const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config.js');
const defaultNotification = require('./default-notification.js');

console.log(defaultNotification);

// const
const PORT = 3000;
const fakeDatabase = [];

// init app and plugins
const app = express();
app.use(cors());
app.use(bodyParser.json());

// set web push
webpush.setVapidDetails(
    'mailto: djordje100janovic@gmail.com',
    config.publicKey,
    config.privateKey);



function sendNotification(res){

    const promises = [];

    fakeDatabase.forEach(subscription => {
        promises.push(
            webpush.sendNotification(
                subscription,
                JSON.stringify(defaultNotification)
            )
        )
    });

    Promise.all(promises).then(() => res.sendStatus(200));

}




// register routes
app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});

app.get('/', (req, res) => {

});

app.post('/subscription', (req, res) => {
    const subscription = req.body;
    fakeDatabase.push(subscription);
    console.log({
        totalSubscribed: fakeDatabase.length
    });
});

app.post('/sendNotification', (req, res) => {
    sendNotification(res);
});
