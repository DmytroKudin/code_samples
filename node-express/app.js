const express = require('express');
const cors = require('cors');
const app = express();
const defaultPort = 3003;
require('dotenv').config();
const port = process.env.PORT || defaultPort;

const {validateAccessToken} = require("./src/middleware/auth");

const downloadRouter = require('./src/routes/download');
const resultsRouter = require('./src/routes/results');
const productRouter = require('./src/routes/product');
const siteRouter = require('./src/routes/site');
const categoryRouter = require('./src/routes/category');


app.use(cors({
  origin: '*', // Или укажите конкретные домены
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({ extended: true }));


app.use(validateAccessToken);
app.use(checkQuestionsLimit);
app.use('/download', downloadRouter);
app.use('/results', resultsRouter);
app.use('/categories', categoryRouter);
app.use('/products', productRouter);
app.use('/sites', siteRouter);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

