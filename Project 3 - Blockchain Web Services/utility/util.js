const BlockChain = require('../helpers/BlockChain.js');
const Block = require('../models/Block.js');
const myBlockChain = new BlockChain.Blockchain();

module.exports = {

    /*****************************************************
     ** Get request which return Block Data of given id **
     *****************************************************/

    getBlock: async (req, res) => {
        let responseToUser = {};
        const params = req.params;
        // get requested block id from parameters
        const requestedBlockId = parseInt(params.blockId);
        // given block should be a number and greater than -1
        if (!isNaN(params.blockId) && requestedBlockId > -1) {
            // get block details of requested block id
            await myBlockChain.getBlock(requestedBlockId)
                .then((block) => {
                    responseToUser = block;
                    res.status(200);
                })
                .catch((error) => {
                    responseToUser.error = error;
                    res.status(404);
                });
        } else {
            responseToUser.error = 'Invalid block id';
            res.status(406);
        }
        return responseToUser;
    },

    /*************************************************************
     ** Post request which insert block in chain for given body **
     *************************************************************/

    addBlock: async (req, res) => {
        let responseToUser = {};
        // new block to be added should have body length greater than 0
        if (req.body && req.body.body && req.body.body.length > 0) {
            await myBlockChain.addBlock(new Block.Block(req.body.body))
                .then(async (result) => {
                    // block has been added
                    // get height of last block
                    await myBlockChain.getBlockHeight()
                        .then(async (blockHeight) => {
                            // get block details of last block in chain
                            await myBlockChain.getBlock(blockHeight)
                                .then((block) => {
                                    responseToUser = block;
                                    res.status(201);
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
        } else {
            responseToUser.error = 'Block body not available';
            res.status(406);
        }
        return responseToUser;
    }

};