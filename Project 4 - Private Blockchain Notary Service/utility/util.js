// const BlockChain = require('../helpers/BlockChain.js');
// const Block = require('../models/Block.js');
// const myBlockChain = new BlockChain.Blockchain();

const Mempool = require('../helpers/Mempool.js');
const myMempool = new Mempool.Mempool();

module.exports = {

    /*************************************************************
     ** Post request which validates request *********************
     *************************************************************/

    requestValidation: async (req, res) => {
        let responseToUser = {};
        const body = req.body;
        if (body && body.address && body.address.length > 0) {
            await myMempool.addTransaction(body.address)
                .then((response) => {
                    responseToUser = response;
                });
        } else {
            responseToUser.error = 'Address not available';
            res.status(404);
        }
        return responseToUser;
    },

    /*************************************************************
     ** Post request which validates message signature ***********
     *************************************************************/

    validateMessageSignature: async (req, res) => {
        let responseToUser = {};
        const body = req.body;
        return responseToUser;
    },

    /*************************************************************
     ** Post request which submits the Star information **********
     *************************************************************/

    addStarInformation: async (req, res) => {
        let responseToUser = {};
        const body = req.body;
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