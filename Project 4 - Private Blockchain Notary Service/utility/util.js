const BlockChain = require('../helpers/BlockChain.js');
const Block = require('../models/Block.js');
const myBlockChain = new BlockChain.Blockchain();

const Mempool = require('../helpers/Mempool.js');
const myMempool = new Mempool.Mempool();

const hex2ascii = require('./hex2ascii.js');

const bitcoinMessage = require('bitcoinjs-message');

module.exports = {

    /*************************************************************
     ** Post request which validates request *********************
     *************************************************************/

    requestValidation: async (req, res) => {
        let responseToUser = {};
        const body = req.body;
        // check if address is valid
        if (body && body.address && body.address.length > 0) {
            // get transaction by address
            await myMempool.getTransactionByAddress(body.address)
                .then((tx) => {
                    // get validation window
                    const currentTimeStamp = new Date().getTime().toString().slice(0, -3);
                    let requestTimeStamp = currentTimeStamp;
                    let validationWindow = myMempool.timeoutRequestsWindowTime / 1000;
                    // check existence of transaction
                    if (tx === undefined) {
                        // add to transaction mempool
                        myMempool.addToTransactionList(body.address, currentTimeStamp);
                    } else {
                        // calculate remaining validation window
                        requestTimeStamp = tx.requestedAt;
                        const timeElapse = currentTimeStamp - requestTimeStamp;
                        const timeLeft = (myMempool.timeoutRequestsWindowTime / 1000) - timeElapse;
                        validationWindow = timeLeft;
                    }
                    // prepare response for user
                    responseToUser = {
                        walletAddress: body.address,
                        requestTimeStamp: requestTimeStamp,
                        message: body.address.concat(':').concat(requestTimeStamp).concat(':').concat('starRegistry'),
                        validationWindow: validationWindow
                    };
                    res.status(201);
                });
        } else {
            responseToUser.error = 'Address does not meet requirements';
            res.status(406);
        }
        return responseToUser;
    },

    /*************************************************************
     ** Post request which validates message signature ***********
     *************************************************************/

    validateMessageSignature: async (req, res) => {
        let responseToUser = {};
        const body = req.body;
        // check id address and signature are valid
        if (body && body.address && body.address.length > 0 &&
            body.signature && body.signature.length > 0) {
            // get transaction by address
            await myMempool.getTransactionByAddress(body.address)
                .then(async (tx) => {
                    // check existence of transaction
                    if (tx !== undefined) {
                        // check if signature is valid or not
                        const message = tx.address.concat(':').concat(tx.requestedAt).concat(':').concat('starRegistry')
                        let isValid = false;
                        try {
                            isValid = bitcoinMessage.verify(message, tx.address, body.signature);
                        } catch (error) {
                            console.error(error);
                        }
                        if (isValid) {
                            // calculate time left which is validation window
                            const currentTimeStamp = new Date().getTime().toString().slice(0, -3);
                            const timeElapse = currentTimeStamp - tx.requestedAt;
                            const timeLeft = (myMempool.timeoutRequestsWindowTime / 1000) - timeElapse;
                            // remove transaction from transaction mempool as signature is acknowledged
                            await myMempool.removeTransaction(tx).then(async (wasTxAvailableAndRemoved) => {
                                if (wasTxAvailableAndRemoved) {
                                    // check if validated transaction already exists as a validated transaction mempool
                                    await myMempool.getValidatedTransactionByAddress(tx.address)
                                        .then(async (vtx) => {
                                            if (vtx !== undefined) {
                                                // remove old transaction from validated transaction mempool
                                                // as we dont support multiple validated transactions for same address in mempool
                                                await myMempool.removeValidatedTransaction(vtx);
                                            }
                                        });
                                    // add to validated transaction mempool
                                    myMempool.addToValidatedTransactionList(tx.address, currentTimeStamp);
                                    // prepare response for user
                                    responseToUser = {
                                        registerStar: true,
                                        status: {
                                            address: tx.address,
                                            requestTimeStamp: tx.requestedAt,
                                            message: message,
                                            validationWindow: timeLeft,
                                            messageSignature: true
                                        }
                                    };
                                    res.status(201);
                                }
                            });
                        } else {
                            responseToUser.error = 'Invalid signature';
                            res.status(406);
                        }
                    } else {
                        responseToUser.error = 'Transaction does not exist';
                        res.status(404);
                    }
                });
        } else {
            responseToUser.error = 'Address or Signature does not meet requirements';
            res.status(406);
        }
        return responseToUser;
    },

    /*************************************************************
     ** Post request which submits the Star information **********
     *************************************************************/

    addStarInformation: async (req, res) => {
        let responseToUser = {};
        const body = req.body;
        // check if address and star data is valid
        if (body && body.address && body.address.length > 0 && body.star &&
            body.star.dec && body.star.dec.length > 0 &&
            body.star.ra && body.star.ra.length > 0 &&
            body.star.story && body.star.story.length > 0) {
            // get transaction from validated transaction mempool using address
            await myMempool.getValidatedTransactionByAddress(body.address)
                .then(async (vtx) => {
                    if (vtx !== undefined) {
                        // as transaction exists, prepare to add it in blockchain
                        // convert star story to hex
                        const blockData = {
                            address: body.address,
                            star: {
                                ra: body.star.ra,
                                dec: body.star.dec,
                                story: Buffer.from(body.star.story).toString('hex')
                            }
                        };
                        // create a block
                        const block = new Block.Block(blockData);
                        // add block in chain
                        await myBlockChain.addBlock(block)
                            .then(async (response) => {
                                // block has been added
                                // get height of last block
                                await myBlockChain.getBlockHeight()
                                    .then(async (blockHeight) => {
                                        // get block details of last block in chain
                                        await myBlockChain.getBlock(blockHeight)
                                            .then(async (block) => {
                                                responseToUser = block;
                                                res.status(201);
                                                // on success of everything, remove transation
                                                // from validated transaction from mempool
                                                await myMempool.removeValidatedTransaction(vtx);
                                            })
                                            .catch((error) => {
                                                responseToUser.error = error;
                                                res.status(404);
                                            });
                                    })
                                    .catch((error) => {
                                        responseToUser.error = error;
                                        res.status(500);
                                    });
                            })
                            .catch((error) => {
                                responseToUser.error = error;
                                res.status(500);
                            });
                        res.status(201);
                    } else {
                        responseToUser.error = 'Address is not validated';
                        res.status(405);
                    }
                });
        } else {
            responseToUser.error = 'Address or Star does not meet requirements';
            res.status(406);
        }
        return responseToUser;
    },

    /*************************************************************
     ** Get Star block by hash ***********************************
     *************************************************************/

    getStarByHash: async (req, res) => {
        let responseToUser = {};
        const params = req.params;
        // check if has is valid
        if (params && params.hash && params.hash.length > 0) {
            // get block by hash
            await myBlockChain.getBlockByHash(params.hash)
                .then((block) => {
                    if (block !== null) {
                        // block exist
                        // decode story and add it in star body
                        block.body.star.storyDecoded = hex2ascii.hex2ascii(block.body.star.story);
                        // send block to user
                        responseToUser = block;
                        res.status(201);
                    } else {
                        responseToUser.error = 'Star not found';
                        res.status(404);
                    }
                })
                .catch((error) => {
                    console.error('error', error);
                    responseToUser.error = error;
                    res.status(500);
                });
        } else {
            responseToUser.error = 'Hash does not meet requirements';
            res.status(406);
        }
        return responseToUser;
    },

    /*************************************************************
     ** Get Star block by wallet address *************************
     *************************************************************/

    getStarByAddress: async (req, res) => {
        let responseToUser = {};
        const params = req.params;
        // check if address is valid
        if (params && params.address && params.address.length > 0) {
            // get all blocks by an address
            await myBlockChain.getBlocksByAddress(params.address)
                .then((blocks) => {
                    const blocksCount = blocks.length;
                    if (blocksCount > 0) {
                        // blocks exists
                        for (let i = 0; i < blocksCount; i++) {
                            // decode story and add it in star body
                            blocks[i].body.star.storyDecoded = hex2ascii.hex2ascii(blocks[i].body.star.story);
                        }
                        // send blocks to user
                        responseToUser = blocks;
                        res.status(201);
                    } else {
                        responseToUser.error = 'Star not found';
                        res.status(404);
                    }
                })
                .catch((error) => {
                    console.error('error', error);
                    responseToUser.error = error;
                    res.status(500);
                });
        } else {
            responseToUser.error = 'Address does not meet requirements';
            res.status(406);
        }
        return responseToUser;
    },

    /*************************************************************
     ** Get star block by star block height **********************
     *************************************************************/

    getStarByBlockHeight: async (req, res) => {
        let responseToUser = {};
        const params = req.params;
        // get requested block id from parameters
        const requestedBlockId = parseInt(params.blockHeight);
        // given block should be a number and greater than -1
        if (!isNaN(params.blockHeight) && requestedBlockId > -1) {
            // get block by height
            await myBlockChain.getBlock(requestedBlockId)
                .then((block) => {
                    if (requestedBlockId !== 0) {
                        // block exist
                        // decode story and add it in star body
                        block.body.star.storyDecoded = hex2ascii.hex2ascii(block.body.star.story);
                    }
                    // send block to user
                    responseToUser = block;
                    res.status(201);
                })
                .catch((error) => {
                    responseToUser.error = 'Star not found';
                    res.status(404);
                });
        } else {
            responseToUser.error = 'Block height does not meet requirements';
            res.status(406);
        }
        return responseToUser;
    }

};