// const { Connection } = require("./connection");
// 

// start app with 'npm run dev' in a terminal window
// go to http://localhost:port/ to view your deployment!
// every time you change something in server.js and save, your deployment will automatically reload

// to exit, type 'ctrl + c', then press the enter key in a terminal window
// if you're prompted with 'terminate batch job (y/n)?', type 'y', then press the enter key in the same terminal

// standard modules, loaded from node_modules
const path = require('path');
require("dotenv").config({ path: path.join(process.env.HOME, '.cs304env') });
const express = require('express');
const morgan = require('morgan');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const flash = require('express-flash');
const multer = require('multer');

// our modules loaded from cwd

const { Connection } = require('../connection');
const cs304 = require('../cs304');

// Create and configure the app

const app = express();

// Morgan reports the final status code of a request's response
app.use(morgan('tiny'));

app.use(cs304.logStartRequest);

// This handles POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cs304.logRequestData);  // tell the user about any request data
app.use(flash());


app.use(serveStatic('public'));
app.set('view engine', 'ejs');

const mongoUri = cs304.getMongoUri();

app.use(cookieSession({
    name: 'session',
    keys: ['horsebattery'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));



async function deleteAll(db) {
    const result = await db.collection('users').deleteMany({});
    return result.acknowledged; //returns true if item successfully deleted
}

async function deleteAllCounters(db) {
    const result = await db.collection('counters').deleteMany({});
    const insert = await db.collection('counters').insertOne({collection: "users", count: 1});
    const postCount = await db.collection('counters').insertOne({ collection: "posts", count: 1 });
    return insert.acknowledged; //returns true if item successfully deleted
}

// just to insert a few users
async function insertUsers(db) {
    const result = await db.collection('users')
        .insertMany([
            {
                // potentially short ID
                UID: 0,
                username: "Lily",
                hash: 'catdogbirdfox',
                pfp: 'a picture of lily',
                badges: ['cow','bird','fish'], // these will be the badge imgs
                aboutme: 'Just a girl'
            },
            {
                // potentially short ID
                UID: 1,
                username: "Harry",
                hash: 'birdfoxdogcat',
                pfp:'a picture of harry',
                badges: ['pig'], // these will be the badge imgs
                aboutme: 'Just some dude'
            }
        ]);
    return result.acknowledged; //returns true if item successfully inserted
}

async function main(){
    const critterquest = await Connection.open(mongoUri,'critterquest');
    deleteAll(critterquest);
    deleteAllCounters(critterquest);
    // let insert = await insertUsers(critterquest);
    // console.log(insert);
}

main()