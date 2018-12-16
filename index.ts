/*
* Primary file for API
*
*/
// dependencies
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import { StringDecoder } from 'string_decoder';
import * as config from './lib/config';
import * as fs from 'fs';
import Helpers from './lib/helpers';
import Handlers from './lib/handlers';

const helpers = new Helpers();
const handlers = new Handlers();

const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
};

const unifiedServer = (req, res) => {
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

    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer)
    };

    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined'
      ? handlers[trimmedPath]
      : handlers.notFound;

    chosenHandler(data, (statusCode, payload) => {

      statusCode = typeof (statusCode) === 'number'
        ? statusCode
        : 200;
      payload = typeof (payload) == 'object' ? payload : {};

      // Convert payload to a string
      const payloadStr = JSON.stringify(payload);

      // return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadStr);
      console.log('Returning this response:  ', buffer);
    });
  });

};

// Define a request router
const router: any = {
  'ping': handlers.ping,
  'users': handlers.users
};

// the server should respond all requests with a string
const httpServer = http.createServer(unifiedServer);
const httpsServer = https.createServer(httpsServerOptions, unifiedServer);

// Start the server and have it listen on port 3000
httpServer.listen(config.httpPort, console.log.bind(null, `start node app on ${config.httpPort}`));
httpsServer.listen(config.httpsPort, console.log.bind(null, `start node app on ${config.httpsPort}`));