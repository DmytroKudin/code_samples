import express from "express";
import 'dotenv/config';
import routes from "./routes/index.js";
import bodyParser from "body-parser";

const app = express()

const port = process.env.SERVER_PORT
app.use(bodyParser.json())
app.use('/api', routes)

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
