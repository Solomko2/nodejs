import Lib from './data';
import Helpers from './helpers';

const lib = new Lib();
const helpers = new Helpers();

class Handlers {
  // private readonly handlers: Record<string, any> = {};

  constructor() {}

  // Sample handler
  ping(data, callback) {
    callback(200);
  };

  // Not found handler
  notFound(data, callback) {
    callback(400);
  };

  // Required data: firstName, lastName, phone, password, tosAgreement
  // Optional data: none
  private post(data, callback) {
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
      lib.read('users', phone, (err, data) => {
        if(!err) {
          const hashedPassword = helpers.hash(password);

          // Create the user
          if(hashedPassword) {
            const userObject = {
              'firstName': firstName,
              'lastName': lastName,
              'phone': phone,
              'password': password,
              'tosAgreement': true
            };

            // Store the user
            lib.create('users', phone, userObject, (err) => {
              if(!err) {
                callback(200);
              } else {
                console.log(err);
                callback(500, {'Error': 'A user with that number already exists'})
              }
            });
          } else {
            callback(500, {'Error': 'Could not hash the user\'s password'})
          }

        } else {
          callback(400, {'Error': 'A user with that phone number already exists'})
        }
      });
    } else {
      callback(400, {'Error': 'Missing required fields'})
    }
  };

  private get(data, callback) {

  }

  private put(data, callback) {

  }

  private delete(data, callback) {

  }

  // Move to the separate file
  users(data, callback) {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
      console.log(this);
      this.post(data, callback);
    } else {
      callback(405);
    }
  }
}

export default Handlers;