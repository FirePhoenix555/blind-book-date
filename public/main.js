const socket = io();

let lob;
let waiting = true;

let ct = 0;

/*
get a list of books
*/

socket.on("books", data => {
	if (ct != 0) return;
	lob = data;
	waiting = false;
	ct++;
})

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

	document.getElementById("book-genre").textContent = b.genre;
	document.getElementById("book-description").textContent = b.description;
	document.getElementById("pages").textContent = b.pages;
	document.getElementById("series").textContent = ((b.series) ? "Yes" : "No");
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
	if (waiting) {
		setTimeout(() => {
			searchByGenre(genre);
		}, 20);
		return;
	}

	let options = [];
	for (let i = 0; i < lob.length; i++) {
		if (lob[i].genre == genre || genre == "ALL") {
			options.push(lob[i]);
		}
	}

	document.getElementById("search-type").textContent = genre;

	// description.substring(0, 20) + "...";
	let arr = makeArr(options);
	makeTable(document.getElementById("books"), arr);

	// put them onto the webpage
	console.log(options);
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

// /add-book
function submit() {
	let obj = {};

	let genre = document.getElementById("genre-select").value;
	if (genre == "new") genre = document.getElementById("new-genre").value;
	if (genre == "") alert("You need a genre!");
	obj.genre = genre;

	obj.pages = document.getElementById("pages").value;
	if (obj.pages == "") alert("You need a page count!");

	obj.series = document.getElementById("series").checked;

	obj.description = document.getElementById("book-description").value;
	if (obj.description == "") alert("You need a description!");

	obj.title = document.getElementById("title").value;
	if (obj.title == "") alert("You need a title!");

	obj.author = document.getElementById("author").value;
	if (obj.author == "") alert("You need an author!");

	obj["cover-img"] = document.getElementById("cvr-img").value;
	if (obj["cover-img"] == "") alert("You need a cover image!");

	socket.emit("new-book", obj);
	location.href = "/find-book";
}