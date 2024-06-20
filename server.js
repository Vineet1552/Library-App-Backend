// server.js

require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./db');
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const http = require("http");
const services = require('./services/index');
const helmet = require('helmet');

const PORT = process.env.PORT;
const bodyParser = require('body-parser');

app.use(helmet());
app.use(bodyParser.json());

// Load Swagger YAML if available
let swaggerDocument;
try {
    swaggerDocument = YAML.load('./swagger/collection.yml');
} catch (error) {
    console.error("Error loading Swagger file:", error);
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



const studentRouter = require('./routes/studentRoute');
const adminRouter = require('./routes/adminRoute');

app.use('/student', studentRouter);
app.use('/admin', adminRouter);

// Start server and create Swagger file
const server = http.createServer(app);


server.listen(PORT, async () => {
    
    try {    
        await services.Swagger.createSwagger();
        console.log(`Server is listening on port ${PORT}`);
    } catch (error) {
        console.error("Error starting the server:", error);
    }
});