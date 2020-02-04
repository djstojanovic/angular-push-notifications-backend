const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config.js');
const defaultNotification = require('./default-notification.js');

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('./db.json')
const db = low(adapter);


/*
===================
INITIALIZATION
===================
*/

// init app and plugins
const app = express();
app.use(cors());
app.use(bodyParser.json());


// set web push
webpush.setVapidDetails(
    'mailto: djordje100janovic@gmail.com',
    config.publicKey,
    config.privateKey);


/*
===================
HELPER FUNCTIONS
===================
*/

function toJson(results){
    return JSON.stringify(results);
}


function getNotificationsAsPromises(){

    const promises = [];
    const subscribers = db.get('subscribers').value();

    if(!subscribers){
        return [];
    }

    subscribers.forEach(subscription => {
        promises.push(
            webpush.sendNotification(
                subscription,
                toJson(defaultNotification)
            )
        )
    });

    return promises;

}


function saveSubscriber(subscription){
    db.get('subscribers').push(subscription).write();
    return { status: 'ok' };
}


/*
===================
ROUTES
===================
*/

// register routes
app.listen(config.PORT, () => {
    console.log('Listening on port ' + config.PORT);
});

app.get('/', (req, res) => {
    res.end(toJson({title: 'Push Notifications Server'}));
});

app.post('/subscription', (req, res) => {
    const subscription = req.body;
    const newsubscriber = saveSubscriber(subscription);
    res.end(toJson(newsubscriber));
});

app.get('/subscribers', (req, res) => {
    const subscribers = db.get('subscribers').value();
    res.end(toJson(subscribers));
});


// send notification
app.post('/sendNotification', (req, res) => {
    const promises = getNotificationsAsPromises(res);
    let response = toJson({status: 'ok'});

    if(!promises.length){
        res.end(response)
    }
    Promise.all(promises).then(() => res.end(response));
});


