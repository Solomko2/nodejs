import * as fs from 'fs';
import * as path from 'path';

interface ILib {
  baseDir: any;
  create: any;
}
// Container for the module (to be exported)
class Lib implements ILib {
  baseDir: any;
  constructor() {
    this.baseDir = path.join(__dirname, '/../.data/');
  }

  create(dir, file, data, callback) {
    fs.open(`${this.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
      if(!err && fileDescriptor) {
        const stringData = JSON.stringify(data);

        fs.writeFile(fileDescriptor, stringData, (err) => {
          if(!err) {
            fs.close(fileDescriptor, (err) => {
              if(!err) {
                callback(false);
              } else {
                callback('Error closing new file');
              }
            })
          } else {
            callback('Error writing to new file');
          }
        })
      } else {
        callback('Could not to create new file, it may already exist!');
      }
    })
  };
};

// Export the module
export default Lib;

