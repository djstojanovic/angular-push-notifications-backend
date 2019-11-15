# AngularPushNotifications - Node BE

## Development server
Node: 10.16.3

## Start
run `node server.js` 


## Generating a VAPID key-pair
run `npm add -g  web-push`

run `web-push generate-vapid-keys --json`

Save keys in config file. Keep private key only in backend.
Public key will be needed in Frontend of your app.
