import { hash } from './helpers';
import { ILib } from './data';

export class User {
  constructor(private lib: ILib) {}

  // Required data: firstName, lastName, phone, password, tosAgreement
  // Optional data: none
  post(data, callback) {
    // check that all required fields are filled out
    const firstName = typeof(data.payload.firstName) === 'string'
    && data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
    const lastName = typeof(data.payload.lastName) === 'string'
    && data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
    const phone = typeof(data.payload.phone) === 'string'
    && data.payload.phone.trim().length > 10
      ? data.payload.phone.trim()
      : false;
    const password = typeof(data.payload.password) === 'string'
    && data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
    const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean'
    && data.payload.tosAgreement === true
      ? data.payload.tosAgreement
      : false;

    if(firstName && lastName && phone && password && tosAgreement) {
      // Make sure that the user doesnt already exist
      this.lib.read('users', phone, (err, data) => {
        if(err) {
          const hashedPassword = hash(password);

          // Create the user
          if(hashedPassword) {
            const userObject = {
              'firstName': firstName,
              'lastName': lastName,
              'phone': phone,
              'hashedPassword': hashedPassword,
              'tosAgreement': true
            };

            // Store the user
            this.lib.create('users', phone, userObject, (err) => {
              if(!err) {
                callback(200);
              } else {
                console.log(err);
                callback(500, {'Error': 'A user with that number already exists'});
              }
            });
          } else {
            callback(500, {'Error': 'Could not hash the user\'s password'});
          }

        } else {
          callback(400, {'Error': 'A user with that phone number already exists'});
        }
      });
    } else {
      callback(400, {'Error': 'Missing required fields 1111'});
    }
  };

  // Users - get
  // Required data: phone
  // Optional data: none
  get(data, callback) {
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length > 10 ? data.queryStringObject.phone.trim() : false;

    if(phone) {
      const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
      this.lib.verifyToken(token, phone, (tokenIsValid) => {
        if(tokenIsValid) {
          this.lib.read('users', phone, (err, data) => {
            if(!err && data) {
              delete data.hashedPassword;
              callback(200, data);
            } else {
              callback(404)
            }
          });
        } else {
          callback(403, {'Error': 'Missing required token in header or token is invalid'});
        }
      });
    } else {
      callback(400, {'Error': 'Missing required field'});
    }
  }

  // Users - put
  // Required data : phone
  // Optional data : firstName, lastName, password, (at least one must be specified)
  put(data, callback) {
    // Check required filed
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.length > 10 ? data.payload.phone.trim() : false;

    // Check optional filed's
    const firstName = typeof(data.payload.firstName) === 'string'
    && data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
    const lastName = typeof(data.payload.lastName) === 'string'
    && data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
    const password = typeof(data.payload.password) === 'string'
    && data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

    if(phone) {
      if(firstName || lastName || password) {
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
        this.lib.verifyToken(token, phone, (tokenIsValid) => {
          if (tokenIsValid) {
            this.lib.read('users', phone, (err, userData) => {
              if(!err && userData) {
                if(firstName) {
                  userData.firstName = firstName;
                }
                if(lastName) {
                  userData.lastName = lastName;
                }
                if(password) {
                  userData.hashedPassword = hash(password);
                }

                this.lib.update('users', phone, userData, (err) => {
                  if(!err) {
                    callback(200);
                  } else {
                    callback(500, {'Error': 'Could not update the user'});
                  }
                });
              } else {
                callback(400, {'Error': 'The specific user does not exist'})
              }
            });
          } else {
            callback(403, {'Error': 'Missing required token in header or token is invalid'});
          }
        });
      } else {
        callback(400, {'Error': 'Missing fields to update'})
      }
    } else {
      callback(400, {'Error': 'Missing required fields'})
    }
  }


  // Users - delete
  // Required field - phone
  // @TODO Cleanup (delete) any other files associated with this user
  delete(data, callback) {
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.length > 10 ? data.queryStringObject.phone.trim() : false;

    if(phone) {
      const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
      this.lib.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          this.lib.read('users', phone, (err, userData) => {
            if(!err && userData) {
              this.lib.delete('users', phone, (err) => {
                if(!err) {
                  // delete each of the checks associated with the user
                  const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                  const checksToDelete  = userChecks.length;
                  if(checksToDelete  > 0) {
                    let checksDeleted = 0;
                    let deletionError = false;

                    userChecks.forEach(checkId => {
                        this.lib.delete('checks', checkId, (err) => {
                          if(err) {
                            deletionError = true;
                          }
                          checksDeleted++;
                          if(checksDeleted === checksToDelete) {
                            if(!deletionError) {
                              callback(200);
                            } else {
                              callback(500, {'Error': 'Errors encountered while attempting to delete all of the user checks'});
                            }
                          }
                        })
                    });
                  } else {
                    callback(200);
                  }
                } else {
                  callback(500, {'Error': 'Could not delete the specified user'})
                }
              });
            } else {
              callback(400, {'Error': 'Could not find the specified user'})
            }
          });
        } else {
          callback(403, {'Error': 'Missing required token in header or token is invalid'});
        }
      });
    } else {
      callback(400, {'Error': 'Missing required field'});
    }
  }

  // Move to the separate file
  users(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
      this[data.method](data, callback);
    } else {
      callback(405);
    }
  }
}
