const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config.js');
const defaultNotification = require('./default-notification.js');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('./db.json');
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

function createNotificationPromise(subscription){
    return webpush.sendNotification(
        subscription,
        toJson(defaultNotification)
    )
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
    const subscribers = db.get('subscribers').value();
    const isAdded = subscribers.filter(function(item){
        return item.endpoint === subscription.endpoint;
    })[0];
    if(isAdded){
        return {status: 'error', message: 'Subscriber is already added.'}
    }
    db.get('subscribers').push(subscription).write();
    return { status: 'ok' };
}

function saveNews(news){
    db.get('news').push(news).write();
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

// news
app.get('/news', (req, res) => {
    const news = db.get('news').value();
    res.end(toJson(news));
});

app.post('/news', (req, res) => {
    const news = req.body;
    const newsSaved = saveNews(news);
    res.end(toJson(newsSaved));
});


// send notification
app.post('/sendNotification', (req, res) => {
    const promises = getNotificationsAsPromises(res);
    let response = toJson({status: 'ok'});

    if(!promises.length){
        res.end(response)
    }
    Promise.all(promises).then(() => res.end(response)).catch(err => console.log(err));
});


