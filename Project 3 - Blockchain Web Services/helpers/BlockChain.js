/* ===== Blockchain Class ========================== |
|  Class with a constructor for new blockchain       |
|  ================================================ */

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {
  constructor() {
    this.bd = new LevelSandbox.LevelSandbox();
    this.generateGenesisBlock();
  }

  // Helper method to create a Genesis Block (always with height= 0)
  // You have to options, because the method will always execute when you create your blockchain
  // you will need to set this up statically or instead you can verify if the height !== 0 then you
  // will not create the genesis block
  generateGenesisBlock() {
    this.getBlockHeight()
      .then((blockHeight) => {
        if (blockHeight === -1) {
          this.addBlock(new Block.Block('First block in the chain - Genesis block'))
            .then((response) => {
              console.info(response);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // Get block height, it is a helper method that return the height of the blockchain
  getBlockHeight() {
    return new Promise((resolve, reject) => {
      this.bd.getBlocksCount()
        .then((response) => {
          resolve(response - 1);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // Add new block
  addBlock(block) {
    const newBlock = block;
    return new Promise((resolve, reject) => {
      // Block height
      this.getBlockHeight()
        .then((blockHeight) => {
          newBlock.height = blockHeight + 1;
          // UTC timestamp
          newBlock.time = new Date().getTime().toString().slice(0, -3);
          // previous block hash
          newBlock.previousBlockHash = '';
          if (newBlock.height > 0) {
            this.getBlock(blockHeight)
              .then((previousBlock) => {
                newBlock.previousBlockHash = previousBlock.hash;
                // Block hash with SHA256 using block and converting to a string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Adding block object to chain
                this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString())
                  .then((response) => {
                    resolve(response);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            // Block hash with SHA256 using block and converting to a string
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            // Adding block object to chain
            this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString())
              .then((response) => {
                resolve(response);
              })
              .catch((error) => {
                reject(error);
              });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // Get Block By Height
  getBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      this.bd.getLevelDBData(blockHeight)
        .then((response) => {
          resolve(JSON.parse(response));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // Validate if Block is being tampered by Block Height
  validateBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      // get block object
      this.getBlock(blockHeight)
        .then((response) => {
          const block = response;
          // get block hash
          const blockHash = block.hash;
          // remove block hash to test block integrity
          block.hash = '';
          // generate block hash
          const validBlockHash = SHA256(JSON.stringify(block)).toString();
          // Compare
          if (blockHash === validBlockHash) {
            resolve(true);
          } else {
            console.log(`Block #${blockHeight} invalid hash:\n${blockHash} <> ${validBlockHash}`);
            resolve(false);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // Validate Blockchain
  validateChain() {
    return new Promise((resolve, reject) => {
      const errorLog = [];
      this.getBlockHeight()
        .then(async (blockHeight) => {
          const allPromises = [];
          for (let i = 0; i <= blockHeight; i += 1) {
            // validate block
            allPromises.push(this.validateBlock(i)
              .then((valid) => {
                if (!valid) {
                  errorLog.push(`Invalid block ${i}`);
                }
                // compare blocks hash link
                this.getBlock(i)
                  .then((block) => {
                    this.getBlock(i + 1)
                      .then((blockNext) => {
                        const blockHash = block.hash;
                        const previousHash = blockNext.previousBlockHash;
                        if (blockHash !== previousHash) {
                          errorLog.push(`Invalid hash link on ${i}`);
                        }
                      }).catch((error) => {
                        reject(error);
                      });
                  }).catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              }));
          }
          await Promise.all(allPromises);
          resolve(errorLog);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // Utility Method to Tamper a Block for Test Validation
  // This method is for testing purpose
  _modifyBlock(height, block) {
    return new Promise((resolve, reject) => {
      this.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
        resolve(blockModified);
      }).catch((error) => {
        console.error(error);
        reject(error);
      });
    });
  }
}

module.exports.Blockchain = Blockchain;