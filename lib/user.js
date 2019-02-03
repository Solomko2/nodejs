import { hash } from './helpers';
export class User {
    constructor(lib) {
        this.lib = lib;
    }
    // Required data: firstName, lastName, phone, password, tosAgreement
    // Optional data: none
    post(data, callback) {
        // check that all required fields are filled out
        const firstName = typeof (data.payload.firstName) === 'string'
            && data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
        const lastName = typeof (data.payload.lastName) === 'string'
            && data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
        const phone = typeof (data.payload.phone) === 'string'
            && data.payload.phone.trim().length > 10
            ? data.payload.phone.trim()
            : false;
        const password = typeof (data.payload.password) === 'string'
            && data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;
        const tosAgreement = typeof (data.payload.tosAgreement) === 'boolean'
            && data.payload.tosAgreement === true
            ? data.payload.tosAgreement
            : false;
        if (firstName && lastName && phone && password && tosAgreement) {
            // Make sure that the user doesnt already exist
            this.lib.read('users', phone, (err, data) => {
                if (err) {
                    const hashedPassword = hash(password);
                    // Create the user
                    if (hashedPassword) {
                        const userObject = {
                            'firstName': firstName,
                            'lastName': lastName,
                            'phone': phone,
                            'hashedPassword': hashedPassword,
                            'tosAgreement': true
                        };
                        // Store the user
                        this.lib.create('users', phone, userObject, (err) => {
                            if (!err) {
                                callback(200);
                            }
                            else {
                                console.log(err);
                                callback(500, { 'Error': 'A user with that number already exists' });
                            }
                        });
                    }
                    else {
                        callback(500, { 'Error': 'Could not hash the user\'s password' });
                    }
                }
                else {
                    callback(400, { 'Error': 'A user with that phone number already exists' });
                }
            });
        }
        else {
            callback(400, { 'Error': 'Missing required fields 1111' });
        }
    }
    ;
    // Users - get
    // Required data: phone
    // Optional data: none
    // @TODO Only let an authenticated user access their object. Don't let them access anyone else's
    get(data, callback) {
        const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length > 10 ? data.queryStringObject.phone.trim() : false;
        if (phone) {
            this.lib.read('users', phone, (err, data) => {
                if (!err && data) {
                    delete data.hashedPassword;
                    callback(200, data);
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
    // Users - put
    // Required data : phone
    // Optional data : firstName, lastName, password, (at least one must be specified)
    // @TODO Only let an authenticated user update own object. Don't let them update anyone else's
    put(data, callback) {
        // Check required filed
        const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.length > 10 ? data.payload.phone.trim() : false;
        // Check optional filed's
        const firstName = typeof (data.payload.firstName) === 'string'
            && data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
        const lastName = typeof (data.payload.lastName) === 'string'
            && data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
        const password = typeof (data.payload.password) === 'string'
            && data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;
        if (phone) {
            if (firstName || lastName || password) {
                this.lib.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        if (firstName) {
                            userData.firstName = firstName;
                        }
                        if (lastName) {
                            userData.lastName = lastName;
                        }
                        if (password) {
                            userData.hashedPassword = hash(password);
                        }
                        this.lib.update('users', phone, userData, (err) => {
                            if (!err) {
                                callback(200);
                            }
                            else {
                                console.log(err);
                                callback(500, { 'Error': 'Could not update the user' });
                            }
                        });
                    }
                    else {
                        callback(400, { 'Error': 'The specific user does not exist' });
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
    // Users - delete
    // Required field - phone
    // @TODO Only let an authenticated user delete their object. Don't let them delete anyone else's
    // @TODO Cleanup (delete) any other files associated with this user
    delete(data, callback) {
        const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length > 10 ? data.queryStringObject.phone.trim() : false;
        if (phone) {
            this.lib.read('users', phone, (err, data) => {
                if (!err && data) {
                    this.lib.delete('users', phone, (err) => {
                        if (!err) {
                            callback(200);
                        }
                        else {
                            callback(500, { 'Error': 'Could not delete the specified user' });
                        }
                    });
                }
                else {
                    callback(400, { 'Error': 'Could not find the specified user' });
                }
            });
        }
        else {
            callback(400, { 'Error': 'Missing required field' });
        }
    }
    // Move to the separate file
    users(data, callback) {
        const acceptableMethods = ['post', 'get', 'put', 'delete'];
        if (acceptableMethods.indexOf(data.method) > -1) {
            this[data.method](data, callback);
        }
        else {
            callback(405);
        }
    }
}
