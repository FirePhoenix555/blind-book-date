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

const OLD_SOCKETS = [];

io.sockets.on("connection", socket => {
	console.log("New socket!");

	if (received) {
		socket.emit("books", bks);
	}

	socket.on("new-book", data => {
		if (duplicate(data)) return;

		if (OLD_SOCKETS.includes(socket.id)) {
			socket.emit("c", {
				c: "user-login",
				n: "true"
			})

			socket.on("receivedc", () => {
				socket.emit("REDIRECT", "/find-book");
			})

			return;
		}

		let tor;
		let waiting = true;

		socket.emit("reqCookie", "user-login");
		socket.on("cookie", data => {
			if (data) {
				tor = true;
			}
			waiting = false;
		})

		while (waiting) {}
		if (tor) return;

		OLD_SOCKETS.push(socket.id);

		console.log("New book! " + data.title)
		bks.push(data);
		books.set(bks);
	})
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
let bks = [];

let received = false;

books.on("value", data => {
	keys = [];
	bks = [];
    let data2 = data.val();
    if (!data2) return;
    let dkeys = Object.keys(data2);
    for (let i = 0; i < dkeys.length; i++) {
        let key = dkeys[i];
		keys.push(key);
		bks.push(data2[key]);
	}

	received = true;
	io.sockets.emit("books", bks);
});

function duplicate(data) {
	for (let i = 0; i < bks.length; i++) {
		if (bks[i].author == data.author &&
			bks[i]["cover-img"] == data["cover-img"] &&
			bks[i].description == data.description &&
			bks[i].genre == data.genre &&
			bks[i]["in-classroom"] == data["in-classroom"] &&
			bks[i].pages == data.pages &&
			bks[i].series == data.series &&
			bks[i].title == data.title)
				return true;
	}
	return false;
}

// books.child("0").set({
// 	title: "The Giver",
// 	author: "Lois Lowry",
// 	genre: "Science Fiction",
// 	series: true,
// 	pages: 240,
// 	description: "The test book. guess what",
// 	"cover-img": "https://images-na.ssl-images-amazon.com/images/I/51fRar1PvAL._SX300_BO1,204,203,200_.jpg"
// });

console.log("Running...");