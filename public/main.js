const socket = io();

let lob;
let waiting = true;

let ct = 0;

const GENRES = ["ALL"];

socket.on("books", data => {
	if (ct != 0) return;
	lob = data;
	waiting = false;
	ct++;

	for (let i = 0; i < data.length; i++) {
		if (!GENRES.includes(data[i].genre)) GENRES.push(data[i].genre);
	}
})

socket.on("REDIRECT", data => {
	location.href = data;
});

socket.on("ALERT", data => {
	alert(data);
});

// https://davidwalsh.name/query-string-javascript
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// /book
function checkRead() {
	if (document.getElementById("agree").checked) {
		location.href = "/read-book?num=" + getUrlParameter("num");
	}
}

function getSpecifics() {
	// genre, description, pages, series
	if (waiting) {
		setTimeout(getSpecifics, 20);
		return;
	}

	let b = lob[getUrlParameter("num")];

	let desc = b.description;
	desc = desc.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

	// document.getElementById("book-genre").textContent = b.genre;
	document.getElementById("book-description").innerHTML = desc;
	// document.getElementById("pages").textContent = b.pages;
	// document.getElementById("series").textContent = ((b.series) ? "Yes" : "No");
	document.getElementById("classroom").textContent = ((b["in-classroom"]) ? "Yes" : "No");
}

// /read-book
function getRSpecifics() {
	// genre, description, pages, series
	if (waiting) {
		setTimeout(getRSpecifics, 20);
		return;
	}

	let b = lob[getUrlParameter("num")];

	document.getElementById("title").textContent = b.title;
	document.getElementById("author").textContent = b.author;
	document.getElementById("coverImg").setAttribute("src", b["cover-img"]);
}

// /find-book
function goToBook(num) {
	// get specific book
	location.href = "/book?num=" + num;
}

function searchByGenre(genre) {
	genre = "ALL";

	if (waiting) {
		setTimeout(() => {
			searchByGenre(genre);
		}, 20);
		return;
	}

	let options = [];
	let all = {
		ALL: []
	};
	for (let i = 0; i < lob.length; i++) {
		// if (lob[i].genre == genre || genre == "ALL") {
			options.push(lob[i]);
		// }
		// if (all[lob[i].genre]) all[lob[i].genre].push(lob[i]);
		// else all[lob[i].genre] = [lob[i]];

		all.ALL.push(lob[i]);
	}

	document.getElementById("search-type").textContent = genre;

	for (let i = 0; i < GENRES.length; i++) {
		if (document.getElementById(GENRES[i] + "b")) {
			// document.getElementById(GENRES[i] + "b").textContent = all[GENRES[i]].length;
		}
	}

	// remove when adding genres back VV
	document.getElementById("ALLb").textContent = all.ALL.length;

	// description.substring(0, 20) + "...";
	let arr = makeArr(options);
	makeTable(document.getElementById("books"), arr);
}

function substringIze(desc, len) {
	let str = desc;
	if (desc.length > len) {
		str = desc.substring(0, len) + "...";
	}
	return str;
}

function makeArr(options) {
	let arr = [
		[
			"Genre",
			"Description"
		]
	];

	for (let i = 0; i < options.length; i++) {
		let a = {};
		a["book-genre"] = options[i].genre;
		a["book-description"] = substringIze(options[i].description, 50);
		a["desc"] = options[i].description;

		arr.push(a);
	}

	return arr;
}

function findBookByGD(genre, description) {
	for (let i = 0; i < lob.length; i++) {
		if (lob[i].genre == genre && lob[i].description == description) return lob[i];
	}
}

function makeTable(elt, arr) {
	// [
	// 	[
	// 		"Genre",
	// 		"Description"
	// 	],
	// 	{
	// 		"book-genre": "A",
	// 		"book-description": "A wonderful thing"
	// 	}
	// ]

	let table = document.createElement("table");

	let t = document.createElement("tr");
	for (let i = 0; i < arr[0].length; i++) {
		let th = document.createElement("th");
		th.textContent = arr[0][i];
		t.appendChild(th);
	}
	table.appendChild(t);


	for (let i = 1; i < arr.length; i++) {
		let tr = document.createElement("tr");
		tr.setAttribute("class", "book");
		tr.setAttribute("onclick", "goToBook(" + lob.indexOf(findBookByGD(arr[i]["book-genre"], arr[i]["desc"])) + ")");

		let ok = Object.keys(arr[i]);
		for (let j = 0; j < ok.length; j++) {
			if (ok[j] == "desc") continue;
			let td = document.createElement("td");
			let span = document.createElement("span");
			span.setAttribute("class", ok[j]);
			span.textContent = arr[i][ok[j]];
			if (ok[j] == "book-genre") span.textContent = "temporarily disabled";
			td.appendChild(span);
			tr.appendChild(td);
		}

		table.appendChild(tr);
	}

	while (elt.firstChild) {
		elt.removeChild(elt.firstChild);
	}

	elt.appendChild(table);
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return !(c.substring(name.length, c.length) == "false");
        }
    }
    return true;
}

socket.on("c", data => {
	document.cookie = data.c + "=" + data.n;
	socket.emit("receivedc", null);
})

socket.on("reqCookie", data => {
	socket.emit("cookie", getCookie(data));
})

socket.on("clrc", () => {
	var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
})

// /add-book
function submit() {
	let obj = {};
	let success = true;

	let genre = document.getElementById("genre-select").value;
	if (genre == "new") genre = document.getElementById("new-genre").value.substring(0, 300);
	if (genre == "") {
		alert("You need a genre!");
		success = false;
	}
	obj.genre = genre;

	obj.pages = document.getElementById("pages").value;
	if (obj.pages == "" || obj.pages > 9999999999 || obj.pages <= 0) {
		alert("You need a page count!");
		success = false;
	}

	obj.series = document.getElementById("series").checked;

	obj["in-classroom"] = document.getElementById("classroom").checked;

	obj.description = document.getElementById("book-description").value.substring(0, 5000);
	if (obj.description == "") {
		alert("You need a description!");
		success = false;
	}

	obj.title = document.getElementById("title").value.substring(0, 300);
	if (obj.title == "") {
		alert("You need a title!");
		success = false;
	}

	obj.author = document.getElementById("author").value.substring(0, 300);
	if (obj.author == "") {
		alert("You need an author!");
		succes = false;
	}

	obj["cover-img"] = document.getElementById("cvr-img").value;
	if (obj["cover-img"] == "") {
		alert("You need a cover image!");
		success = false;
	} else {
		var http = new XMLHttpRequest();

		http.open('HEAD', obj["cover-img"], false);
		http.send();

		if (http.status == 404) {
			alert("You need a cover image!");
			success = false;
		}
	}

	if (success) {
		socket.emit("new-book", obj);
		location.href = "/find-book";
	}
}