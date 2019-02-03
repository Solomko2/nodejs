/*
* Helpers for various tasks
*
 */
import * as config from './config';
import * as crypto from 'crypto';

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