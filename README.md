# it5007tut6

president is apolloclient folder;
api is the server folder, port 5000.

On server side:

mkdir -p /data/db

screen mongod

Ctrl a+d

cd /api

npm install

mongo issuetracker scripts/init.mongo.js

npm start

Then it connect to port 5000.

On the client side:

under president folder

change the IP adress of link in RNApp.js file to your machine IP adress

npm install -g react-native-cli

npm install apollo-boost;
npm install react-apollo;
npm install graphql;
npm install graphql-tag;

npx react-native run-android

add some records on Android and then go to http://localhost:5000/graphql and type 
query { issueList {
        name}
}
to see name
