import express from 'express'
import http from 'http'
import {Server} from 'socket.io'
import helmet from 'helmet'
import cors from 'cors'
import {errorMiddleware} from "./src/middleware/error.js";
import {routers} from "./src/router/index.js";
import {handleConnection} from "./src/socket/index.js";
import {loadConfig} from "./src/helpers/envConfig.js";

loadConfig()


const app = express();
const server = http.createServer(app);

// ##### SETUP SOCKET SERVER #####
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: "*",
        credentials: true
    }
});

export const nsp = io.of('/auto-update-fb');

nsp.on('connection', handleConnection);
// ##############################

app.use(helmet());
app.use(cors({
    credentials: true,
    origin: true,
}));
app.use(express.json({
    limit: '10MB',
    type: [
        'application/json',
        'text/plain',
    ],
}));

app.use(errorMiddleware);

routers.forEach(([path, router]) => {
    app.use( path, router);
});

const PORT = process.env.PORT || 7900;
server.listen(PORT, async () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
