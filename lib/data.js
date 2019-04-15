import * as fs from 'fs';
import * as path from 'path';
import { parseJsonToObject } from './helpers';
// Container for the module (to be exported)
class Lib {
    constructor() {
        this.baseDir = path.join(__dirname, '/../.data/');
    }
    // Write data to a file
    create(dir, file, data, callback) {
        fs.open(`${this.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                const stringData = JSON.stringify(data);
                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if (!err) {
                        fs.close(fileDescriptor, (err) => {
                            if (!err) {
                                callback(false);
                            }
                            else {
                                callback('Error closing new file');
                            }
                        });
                    }
                    else {
                        callback('Error writing to new file');
                    }
                });
            }
            else {
                callback('Could not to create new file, it may already exist!');
            }
        });
    }
    ;
    // Read data from a file
    read(dir, file, callback) {
        fs.readFile(`${this.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
            if (!err && data) {
                const parseData = parseJsonToObject(data);
                callback(false, parseData);
            }
            else {
                callback(err, data);
            }
        });
    }
    // Update data from a file
    update(dir, file, data, callback) {
        fs.open(`${this.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                const stringData = JSON.stringify(data);
                fs.ftruncate(fileDescriptor, (err) => {
                    if (!err) {
                        fs.writeFile(fileDescriptor, stringData, (err) => {
                            if (!err) {
                                fs.close(fileDescriptor, (err) => {
                                    if (!err) {
                                        callback(false);
                                    }
                                    else {
                                        callback('Error closing new file');
                                    }
                                });
                            }
                            else {
                                callback('Error writing to exist file');
                            }
                        });
                    }
                    else {
                        callback('Error truncating file');
                    }
                });
            }
            else {
                callback('Could not open the file for updating, it may not exist yet');
            }
        });
    }
    // Delete a file
    delete(dir, file, callback) {
        fs.unlink(`${this.baseDir}${dir}/${file}.json`, (err) => {
            if (!err) {
                callback(false);
            }
            else {
                callback('Error deleting file');
            }
        });
    }
    verifyToken(id, phone, callback) {
        this.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            }
            else {
                callback(false);
            }
        });
    }
}
// Export the module
export default Lib;
