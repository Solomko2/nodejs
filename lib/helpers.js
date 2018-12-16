/*
* Helpers for various tasks
*
 */
import * as config from './config';
import * as crypto from 'crypto';
export default class Helpers {
    constructor() { }
    // Create a SHA256 hash
    hash(str) {
        if (typeof (str) === 'string' && str.length > 0) {
            return crypto
                .createHmac('sha256', config.hashingSecret)
                .update(str)
                .digest('hex');
        }
        else {
            return false;
        }
    }
    // Parse a JSON string to an object in all cases, without throwing
    parseJsonToObject(str) {
        try {
            const obj = JSON.parse(str);
            return obj;
        }
        catch (e) {
            return {};
        }
    }
}
