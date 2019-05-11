const BlockChain = require('../helpers/BlockChain.js');
const Block = require('../models/Block.js');
const myBlockChain = new BlockChain.Blockchain();

const Mempool = require('../helpers/Mempool.js');
const myMempool = new Mempool.Mempool();

const bitcoinMessage = require('bitcoinjs-message');

module.exports = {

    /*************************************************************
     ** Post request which validates request *********************
     *************************************************************/

    requestValidation: async (req, res) => {
        let responseToUser = {};
        const body = req.body;
        if (body && body.address && body.address.length > 0) {
            await myMempool.getTransactionByAddress(body.address)
                .then((tx) => {
                    const currentTimeStamp = new Date().getTime().toString().slice(0, -3);
                    let requestTimeStamp = currentTimeStamp;
                    let validationWindow = myMempool.timeoutRequestsWindowTime / 1000;
                    if (tx === undefined) {
                        myMempool.addToTransactionList(body.address, currentTimeStamp);
                    } else {
                        requestTimeStamp = tx.requestedAt;
                        const timeElapse = currentTimeStamp - requestTimeStamp;
                        const timeLeft = (myMempool.timeoutRequestsWindowTime / 1000) - timeElapse;
                        validationWindow = timeLeft;
                    }
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
        if (body && body.address && body.address.length > 0 && body.signature && body.signature.length > 0) {
            await myMempool.getTransactionByAddress(body.address)
                .then(async (tx) => {
                    if (tx !== undefined) {
                        const message = tx.requestedAt.concat(':').concat(tx.requestedAt).concat(':').concat('starRegistry')
                        let isValid = false;
                        try {
                            isValid = bitcoinMessage.verify(message, tx.address, body.signature);
                        } catch (error) {
                            console.error(error);
                        }
                        if (isValid) {
                            const currentTimeStamp = new Date().getTime().toString().slice(0, -3);
                            const timeElapse = currentTimeStamp - tx.requestedAt;
                            const timeLeft = (myMempool.timeoutRequestsWindowTime / 1000) - timeElapse;
                            await myMempool.removeTransaction(tx).then(async (wasTxAvailableAndRemoved) => {
                                if (wasTxAvailableAndRemoved) {
                                    // check if validated transaction already exists as a validated transaction
                                    await myMempool.getValidatedTransactionByAddress(tx.address)
                                        .then(async (vtx) => {
                                            if (vtx !== undefined) {
                                                await myMempool.removeValidatedTransaction(vtx);
                                            }
                                        });
                                    myMempool.addToValidatedTransactionList(tx.address, currentTimeStamp);
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
        if (body && body.address && body.address.length > 0 && body.star &&
            body.star.dec && body.star.dec.length > 0 &&
            body.star.ra && body.star.ra.length > 0 &&
            body.star.story && body.star.story.length > 0) {
            await myMempool.getValidatedTransactionByAddress(body.address)
                .then(async (vtx) => {
                    if (vtx !== undefined) {
                        const blockData = {
                            address: body.address,
                            star: {
                                ra: body.star.ra,
                                dec: body.star.dec,
                                story: Buffer.alloc(body.star.story).toString('hex')
                            }
                        };
                        const block = new Block.Block(blockData);
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
        return responseToUser;
    },

    /*************************************************************
     ** Get Star block by wallet address *************************
     *************************************************************/

    getStarByAddress: async (req, res) => {
        let responseToUser = {};
        const params = req.params;
        return responseToUser;
    },

    /*************************************************************
     ** Get star block by star block height **********************
     *************************************************************/

    getStarByBlockHeight: async (req, res) => {
        let responseToUser = {};
        const params = req.params;
        return responseToUser;
    },

};