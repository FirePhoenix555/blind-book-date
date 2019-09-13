const app = express();
const server = app.listen(3000);
const io = socket(server);
const firebase = require("firebase");
app.use(express.static("public"));
io.sockets.on("connection", socket => {
    
});

const firebaseConfig = {
    apiKey: "AIzaSyCnJXARvAJDYQRXnSYDueRoa9Nl964uM9U",
    authDomain: "blind-book-date-64c22.firebaseapp.com",
    databaseURL: "https://blind-book-date-64c22.firebaseio.com",
    projectId: "blind-book-date-64c22",
    storageBucket: "",
    messagingSenderId: "757263520221",
    appId: "1:757263520221:web:68672c159080b0c4e32634"
};

firebase.initializeApp(firebaseConfig);