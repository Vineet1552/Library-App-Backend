// services/swagger.js

const postmanToOpenApi = require('postman-to-openapi');
const path = require('path');

async function createSwagger() {
    try {
        const postmanCollection = path.resolve(__dirname, '../swagger/collection.json');
        const outputFile = path.resolve(__dirname, '../swagger/collection.yml');
        await postmanToOpenApi(postmanCollection, outputFile, {
            defaultTag: 'General'
        });
        console.log("Swagger file created successfully at", outputFile);
    } catch (error) {
        console.error("Error creating Swagger file:", error);
        throw error; // Propagate the error to handle it in server.js if needed
    }
}

module.exports = {
    createSwagger
};
