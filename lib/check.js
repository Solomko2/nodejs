import * as config from './config';
import { createRandomString } from './helpers';
export class Check {
    constructor(lib) {
        this.lib = lib;
    }
    // Container for all, checks methods
    // Checks - Post
    // Required data: protocol, url, method, successCodes, timeoutSeconds
    // Optional data: none
    post(data, callback) {
        const protocol = typeof (data.payload.protocol) === 'string'
            && ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1
            ? data.payload.protocol.trim()
            : false;
        const url = typeof (data.payload.url) === 'string'
            && data.payload.url.trim().length > 0
            ? data.payload.url.trim()
            : false;
        const method = typeof (data.payload.method) === 'string'
            && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method.trim()) > -1
            ? data.payload.method.trim()
            : false;
        const successCodes = typeof (data.payload.successCodes) === 'object'
            && data.payload.successCodes.length > 0
            ? data.payload.successCodes
            : false;
        const timeoutSeconds = typeof (data.payload.timeoutSeconds) === 'number'
            && data.payload.timeoutSeconds % 1 === 0
            && data.payload.timeoutSeconds >= 1
            && data.payload.timeoutSeconds <= 5
            ? data.payload.timeoutSeconds
            : false;
        if (protocol && url && method && successCodes && timeoutSeconds) {
            // Get the token from the headers
            const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
            this.lib.read('tokens', token, (err, tokenData) => {
                if (!err && tokenData) {
                    // Lookup the user by reading the token
                    const userPhone = tokenData.phone;
                    // Lookup the user data
                    this.lib.read('users', userPhone, (err, userData) => {
                        if (!err && userData) {
                            const userChecks = typeof (userData.checks) === 'object' ? userData.checks : [];
                            if (userChecks.length < config.maxChecks) {
                                const checkId = createRandomString(20);
                                // Create the check object
                                const checkObject = {
                                    id: checkId,
                                    userPhone,
                                    protocol,
                                    url,
                                    method,
                                    successCodes,
                                    timeoutSeconds
                                };
                                // Save the object
                                this.lib.create('checks', checkId, checkObject, (err) => {
                                    if (!err) {
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);
                                        this.lib.update('users', userPhone, userData, (err) => {
                                            if (!err) {
                                                callback(200, checkObject);
                                            }
                                            else {
                                                callback(500, { 'Error': 'Could not update user with the new check' });
                                            }
                                        });
                                    }
                                    else {
                                        callback(500, { 'Error': 'Could not create new check' });
                                    }
                                });
                            }
                            else {
                                callback(400, { 'Error': 'The user already has the maximum number if checks' });
                            }
                        }
                        else {
                            callback(403);
                        }
                    });
                }
                else {
                    callback(403);
                }
            });
            // Verify that the user has less then the number of max-checks-per-user
        }
        else {
            callback(400, { 'Error': 'Missing required inputs, or inputs are invalid' });
        }
    }
    // Checks - Get
    // Required data: id
    // Optional data: none
    get(data, callback) {
        const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
        if (id) {
            this.lib.read('checks', id, (err, checksData) => {
                if (!err && checksData) {
                    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
                    this.lib.verifyToken(token, checksData.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            callback(200, checksData);
                        }
                        else {
                            callback(403, { 'Error': 'Missing required token in header or token is invalid' });
                        }
                    });
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
    // Checks - Put
    // Required data: id
    // Optional data: protocol, url, method, successCodes, timeoutSeconds
    put(data, callback) {
        const id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
        const protocol = typeof (data.payload.protocol) === 'string'
            && ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1
            ? data.payload.protocol.trim()
            : false;
        const url = typeof (data.payload.url) === 'string'
            && data.payload.url.trim().length > 0
            ? data.payload.url.trim()
            : false;
        const method = typeof (data.payload.method) === 'string'
            && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method.trim()) > -1
            ? data.payload.method.trim()
            : false;
        const successCodes = typeof (data.payload.successCodes) === 'object'
            && data.payload.successCodes.length > 0
            ? data.payload.successCodes
            : false;
        const timeoutSeconds = typeof (data.payload.timeoutSeconds) === 'number'
            && data.payload.timeoutSeconds % 1 === 0
            && data.payload.timeoutSeconds >= 1
            && data.payload.timeoutSeconds <= 5
            ? data.payload.timeoutSeconds
            : false;
        if (id) {
            if (protocol || url || method || successCodes || timeoutSeconds) {
                this.lib.read('checks', id, (err, checksData) => {
                    if (!err && checksData) {
                        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
                        this.lib.verifyToken(token, checksData.userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                if (protocol) {
                                    checksData.protocol = protocol;
                                }
                                if (url) {
                                    checksData.url = url;
                                }
                                if (method) {
                                    checksData.method = method;
                                }
                                if (successCodes) {
                                    checksData.successCodes = successCodes;
                                }
                                if (timeoutSeconds) {
                                    checksData.timeoutSeconds = timeoutSeconds;
                                }
                                this.lib.update('checks', id, checksData, (err) => {
                                    if (!err) {
                                        callback(200, checksData);
                                    }
                                    else {
                                        callback(500, { 'Error': 'Could not update the check' });
                                    }
                                });
                            }
                            else {
                                callback(403, { 'Error': 'Missing required token in header or token is invalid or fields is invalid' });
                            }
                        });
                    }
                    else {
                        callback(400, { 'Error': 'Check ID is not exist' });
                    }
                });
            }
            else {
                callback(400, { 'Error': 'Missing fields to update' });
            }
        }
        else {
            callback(400, { 'Error': 'Missing required fields' });
        }
    }
    // Checks - Delete
    // Required data: id
    // Optional data: none
    delete(data, callback) {
        const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
        if (id) {
            this.lib.read('checks', id, (err, checksData) => {
                if (!err && checksData) {
                    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
                    this.lib.verifyToken(token, checksData.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            this.lib.delete('checks', id, (err) => {
                                if (!err) {
                                    this.lib.read('users', checksData.userPhone, (err, userData) => {
                                        if (!err && userData) {
                                            const userChecks = typeof (userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                                            userData.checks = userChecks.filter((item) => item !== id);
                                            this.lib.update('users', checksData.userPhone, userData, (err) => {
                                                if (!err) {
                                                    callback(200);
                                                }
                                                else {
                                                    callback(500, { 'Error': 'Could not update the user' });
                                                }
                                            });
                                        }
                                        else {
                                            callback(404, { 'Error': 'User does not exist' });
                                        }
                                    });
                                }
                                else {
                                    callback(500, { 'Error': 'Could not delete the check data' });
                                }
                            });
                        }
                        else {
                            callback(403);
                        }
                    });
                }
                else {
                    callback(400, { 'Error': 'The specific check ID is not exist' });
                }
            });
        }
        else {
            callback(400, { 'Error': 'Missing required field' });
        }
    }
    checks(data, callback) {
        const acceptableMethods = ['post', 'get', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            this[data.method](data, callback);
        }
        else {
            callback(405);
        }
    }
}
