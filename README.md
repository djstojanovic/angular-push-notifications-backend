# AngularPushNotifications - Node BE

## Development server
Node: 10.16.3


## Generating a VAPID key-pair
run `npm add -g  web-push`

run `web-push generate-vapid-keys --json`

Save keys in config file. Keep private key only in the backend.
Public key needs to be added in the frontend.

## Start
run `node server.js` 
