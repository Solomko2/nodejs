import { hash, createRandomString } from './helpers';
export class Token {
    constructor(lib) {
        this.lib = lib;
    }
    // Tokens - post
    // Required data: phone, password
    // Optional data: none
    post(data, callback) {
        const phone = typeof (data.payload.phone) === 'string'
            && data.payload.phone.trim().length > 10
            ? data.payload.phone.trim()
            : false;
        const password = typeof (data.payload.password) === 'string'
            && data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;
        if (phone && password) {
            this.lib.read('users', phone, (err, userData) => {
                if (!err && userData) {
                    const hashedPassword = hash(password);
                    if (hashedPassword === userData.hashedPassword) {
                        const tokenId = createRandomString(20);
                        const expires = Date.now() + 1000 * 60 * 60;
                        const tokenObject = {
                            "id": tokenId,
                            "expires": expires,
                            "phone": phone
                        };
                        this.lib.create("tokens", tokenId, tokenObject, (err) => {
                            if (!err) {
                                callback(200, tokenObject);
                            }
                            else {
                                callback(500, { "Error": "Could not create the new token" });
                            }
                        });
                    }
                    else {
                        callback(400, { 'Error': 'Could not match the specified user\'s stored password' });
                    }
                }
                else {
                    callback(400, { 'Error': 'Could not find the specified user' });
                }
            });
        }
        else {
            callback(400, { 'Error': 'Missing required fields 1111' });
        }
    }
    ;
    // Tokens - get
    // Required data: id
    // Optional data: none
    get(data, callback) {
        const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.length === 20 ? data.queryStringObject.id.trim() : false;
        if (id) {
            this.lib.read('tokens', id, (err, tokenData) => {
                if (!err && tokenData) {
                    callback(200, tokenData);
                }
                else {
                    callback(404);
                }
            });
        }
        else {
            callback(400, { 'Error': 'Missing required field' });
        }
    }
    tokens(data, callback) {
        const acceptableMethods = ['post', 'get', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            this[data.method](data, callback);
        }
        else {
            callback(405);
        }
    }
}
