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
    }
    else {
        return false;
    }
};
// Parse a JSON string to an object in all cases, without throwing
export const parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str);
        return obj;
    }
    catch (e) {
        return {};
    }
};
