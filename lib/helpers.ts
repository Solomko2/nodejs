/*
* Helpers for various tasks
*
 */
import * as config from './config';
import * as crypto from 'crypto';
import * as https from 'https';
import * as querystring from 'querystring';

// Create a SHA256 hash
export const hash = (str) => {
  if (typeof (str) === 'string' && str.length > 0) {
    return crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases, without throwing
export const parseJsonToObject = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
export const createRandomString = (strLength:  number) => {
  strLength = typeof (strLength) === 'number' && strLength > 0 ? strLength : 0;
  if(strLength) {
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';

    for(let i = 1; i <= strLength; i++) {
        let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

        str += randomCharacter;
    }

    return str;
  } else {
    return false;
  }

};

// Send an SMS message via Twilio
export const sendTwilioSms = (phone: string, msg: string, callback: any) => {
  const phoneChecked = typeof(phone) === 'string' && phone.trim().length > 10 ? phone.trim() : false;
  const msgChecked = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600  ? msg.trim() : false;

  if(phoneChecked && msgChecked) {
    const payload = {
      From: config.twilio.fromPhone,
      To: phone,
      Body: msg
    };

    const stringPayload = querystring.stringify(payload);

    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
      auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    const req = https.request(requestDetails, (res: any) => {
      // Grab the status of the sent request
      const status = res.statusCode;

      // Callback successfully if the request went through
      if(status === 200 || status === 201) {
        callback(false)
      } else {
        callback(`Status code returned was ${status}`)
      }
    });

    // Bind to the error event so it doesn't get through
    req.on('error', (err) => {
      callback(err);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or valid');
  }
};
