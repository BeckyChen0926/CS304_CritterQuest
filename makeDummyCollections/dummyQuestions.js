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
    const result = await db.collection('questions').deleteMany({});
    return result.acknowledged; //returns true if item successfully deleted
}

// just to insert a few users
async function insertQuestions(db) {
    const result = await db.collection('questions')
        .insertMany([
            {
                // potentially short ID
                PID: 1,
                user: "Harry",
                time: new Date(),
                img: 'a picture of a butterfly',
                animal: '',
                location: 'Science Center',
                caption: 'Is this a pigeon?',
                likes: 4,
                comments: [
                    {
                        UID: 1,
                        user: 'Lily',
                        comment: "No."
                    }
                ]
            }
        ]);
    return result.acknowledged; //returns true if item successfully inserted
}

async function main() {
    const questions = await Connection.open(mongoUri, 'critterquest');
    deleteAll(questions);
    let insert = await insertQuestions(questions);
    console.log(insert);
}

main()