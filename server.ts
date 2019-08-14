/*
* Server-related task
*
*/

// Dependencies
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import { StringDecoder } from 'string_decoder';
import * as config from './lib/config';
import * as fs from 'fs';
import * as path from 'path';
import { parseJsonToObject} from './lib/helpers';
import Lib from './lib/data';
import { User } from './lib/user';
import { Token } from './lib/token';
import { Check } from './lib/check';


const server = {} as any;

const lib = new Lib();
const checkInstance = new Check(lib);
const usersInstance = new User(lib);
const tokenInstance = new Token(lib);

const handlers = {
  users: usersInstance.users.bind(usersInstance),
  tokens: tokenInstance.tokens.bind(tokenInstance),
  checks: tokenInstance.tokens.bind(checkInstance),
  ping: (data, callback) => {
    callback(200);
  },
  notFound: (data, callback) => {
    callback(400);
  }
};

server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '/https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '/https/cert.pem'))
};

server.unifiedServer = (req, res) => {
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
      payload: parseJsonToObject(buffer)
    };

    const chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined'
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
      console.log('Returning this response:  ', payload);
    });
  });

};

// Define a request router
server.router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
};

// the server should respond all requests with a string
server.httpServer = http.createServer(server.unifiedServer);
server.httpsServer = https.createServer(server.httpsServerOptions, server.unifiedServer);


// Init script
server.init = () => {
  // Start http server
  server.httpServer.listen(config.httpPort, console.log.bind(null, `start node app on ${config.httpPort}`));

  // Start https server
  server.httpsServer.listen(config.httpsPort, console.log.bind(null, `start node app on ${config.httpsPort}`));
};

export { server }
