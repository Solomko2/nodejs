/*
* Primary file for API
*
*/
// dependencies
import * as http from 'http';
import * as url from 'url';
import {StringDecoder} from 'string_decoder'

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

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();
    // Send the response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World!\n');

    // Log the request path
    console.log(`Request received with these payload: `, buffer);
  });

});

// Start the server and have it listen on port 3000
server.listen(3000, console.log.bind(null, 'start node app on 3000'))
