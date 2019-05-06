const BlockChain = require('../helpers/BlockChain.js');
const Block = require('../models/Block.js');
const myBlockChain = new BlockChain.Blockchain();

module.exports = {

    /*************************************************************
     ** Post request which validates request *********************
     *************************************************************/

    requestValidation: async (req, res) => {
        let responseToUser = {};
        const body = req.body;
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