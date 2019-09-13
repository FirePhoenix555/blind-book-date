const app = express();
const server = app.listen(3000);
const io = socket(server);
app.use(express.static("public"));
io.sockets.on("connection", socket => {
    
});