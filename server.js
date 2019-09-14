/* TODO
add actual data submission
add titles
*/

require("dotenv").config();

const express = require("express");
const socket = require("socket.io");
const app = express();
const server = app.listen(process.env.PORT || 3000);
const io = socket(server);
const firebase = require("firebase");
app.use(express.static("public"));

app.use("/find-book", express.static("public/finding.html"));
app.use("/add-book", express.static("public/adding.html"));
app.use("/book", express.static("public/book.html"));
app.use("/read-book", express.static("public/reading.html"));

io.sockets.on("connection", socket => {
    
});

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: "",
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const books = database.ref("books");
let keys = [];

books.on("value", data => {
    keys = [];
    let data2 = data.val();
    if (!data2) return;
    let dkeys = Object.keys(data2);
    for (let i = 0; i < dkeys.length; i++) {
        let key = dkeys[i];
        keys.push(key);
    }
});

console.log("Running...");