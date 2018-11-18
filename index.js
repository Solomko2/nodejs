/*
* Primary file for API
*
*/
// dependencies
import * as http from 'http';
import * as url from 'url';
import { StringDecoder } from 'string_decoder';
// the server should respond all requests with a string
const server = http.createServer((req, res) => {
    // Get the url and parsed
    const parsedUrl = url.parse(req.url, true);
    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    // Get the query string as an object
    const queryStringObject = parsedUrl.query;
    // Get the headers as an object
    const headers = req.headers;
    // Get the http method
    const method = req.method.toLowerCase();
    // Get payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    // Define handlers
    const handlers = {};
    // Sample handler
    handlers.sample = (data, callback) => {
        callback(200, { message: 'Ok' });
    };
    // Not found handler
    handlers.notFound = (data, callback) => {
        callback(500);
    };
    // Define a request router
    const router = {
        'sample': handlers.sample,
    };
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: buffer
        };
        const chosenHandler = typeof (router[trimmedPath]) !== 'undefined'
            ? handlers[trimmedPath]
            : handlers.notFound;
        chosenHandler(data, (statusCode, payload) => {
            console.log(1, payload);
            statusCode = typeof (statusCode) === 'number'
                ? statusCode
                : 200;
            payload = typeof (payload) == 'object' ? payload : {};
            // Convert payload to a string
            const payloadStr = JSON.stringify(payload);
            // return the response
            res.writeHead(statusCode);
            res.end(payloadStr);
            console.log('Returning this response:  ', buffer);
        });
    });
});
// Start the server and have it listen on port 3000
server.listen(3000, console.log.bind(null, 'start node app on 3000'));
