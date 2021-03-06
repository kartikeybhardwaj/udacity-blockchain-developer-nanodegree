/* ===== Persist data with LevelDB ================== |
|  Learn more: level: https://github.com/Level/level  |
|  ================================================= */

const level = require('level');
const chainDB = './databases/chaindata';

class LevelSandbox {

  constructor() {
    this.db = level(chainDB);
  }

  // Get data from levelDB with key (Promise)
  getLevelDBData(key) {
    return new Promise((resolve, reject) => {
      this.db.get(key, (error, value) => {
        if (error) {
          reject('Not found!');
        } else {
          resolve(value);
        }
      });
    });
  }

  // Add data to levelDB with key and value (Promise)
  addLevelDBData(key, value) {
    return new Promise((resolve, reject) => {
      this.db.put(key, value, (err) => {
        if (err) {
          reject(`Block ${key} submission failed`);
        } else {
          resolve(`Block added with key ${key} and value ${value}`);
        }
      });
    });
  }

  // Method that return the height
  getBlocksCount() {
    return new Promise((resolve, reject) => {
      let i = 0;
      this.db.createReadStream()
        .on('data', (data) => {
          i += 1;
        })
        .on('error', (error) => {
          console.error(error);
          reject('Unable to read data stream!');
        })
        .on('close', () => {
          resolve(i);
        });
    });
  }
}

module.exports.LevelSandbox = LevelSandbox;