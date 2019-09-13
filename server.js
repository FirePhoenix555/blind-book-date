const app = express();
const server = app.listen(3000);
const io = socket(server);
app.use(express.static("public"));
io.sockets.on("connection", socket => {
    socket.on("data", data => {
        // console.log(data);
        code.push({
            data
        });
    })
});
