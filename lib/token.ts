import { ILib } from './data';
import { hash, createRandomString } from './helpers';

export class Token {
  constructor(private lib: ILib) {}

  // Tokens - post
  // Required data: phone, password
  // Optional data: none
  post(data, callback) {
    const phone = typeof(data.payload.phone) === 'string'
    && data.payload.phone.trim().length > 10
      ? data.payload.phone.trim()
      : false;
    const password = typeof(data.payload.password) === 'string'
    && data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

    if(phone && password) {
      this.lib.read('users', phone, (err, userData) => {
        if(!err && userData) {
          const hashedPassword = hash(password);
          if(hashedPassword === userData.hashedPassword) {
              const tokenId = createRandomString(20);
              const expires = Date.now() + 1000 * 60 * 60;

              const tokenObject = {
                "id": tokenId,
                "expires": expires,
                "phone": phone
              };

            this.lib.create("tokens", tokenId, tokenObject, (err) => {
              if(!err) {
                callback(200, tokenObject);
              } else {
                callback(500, {"Error" : "Could not create the new token"});
              }
            })


          } else {
            callback(400, {'Error' : 'Could not match the specified user\'s stored password'})
          }
        } else {
          callback(400, {'Error' : 'Could not find the specified user'})
        }
      });
    } else {
      callback(400, {'Error': 'Missing required fields 1111'});
    }
  };

  // Tokens - get
  // Required data: id
  // Optional data: none
  get(data, callback) {
    const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.length === 20 ? data.queryStringObject.id.trim() : false;

    if(id) {
      this.lib.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData) {
          callback(200, tokenData);
        } else {
          callback(404)
        }
      });
    } else {
      callback(400, {'Error': 'Missing required field'});
    }
  }

  // Tokens - put
  // Required data: id, extend
  // Optional data: none
  put(data, callback) {
    const id = typeof(data.payload.id) === 'string' && data.payload.id.length === 20 ? data.payload.id.trim() : false;
    const extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend === true;

    if(id && extend) {
      this.lib.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData) {
          if(tokenData.expires > Date.now()) {

            tokenData.expires = Date.now() + 1000 * 60 *60;

            this.lib.update('tokens', id, tokenData, (err) => {
              if(!err) {
                callback(200);
              } else {
                callback(500, {'Error': 'Could not update the token\'s expiration'});
              }
            })
          } else {
            callback(400, {'Error' : 'The token has already expired and can not be extended'});
          }
        } else {
          callback(400, {'Error' : 'Specify token does not exist'});
        }
      });
    } else {
      callback(400, {'Error': 'Missing required fields or fields is invalid'});
    }
  }

  // Tokens - delete
  // Required data: id
  // Optional data: none
  delete(data, callback) {
    const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.length === 20 ? data.queryStringObject.id.trim() : false;

    if(id) {
      this.lib.read('tokens', id, (err, data) => {
        if(!err && data) {
          this.lib.delete('tokens', id, (err) => {
            if(!err) {
              callback(200);
            } else {
              callback(500, {'Error': 'Could not delete the specified token'})
            }
          });
        } else {
          callback(400, {'Error': 'Could not find the specified token'})
        }
      });
    } else {
      callback(400, {'Error': 'Missing required field'});
    }
  }

  tokens(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
      this[data.method](data, callback);
    } else {
      callback(405);
    }
  }
}