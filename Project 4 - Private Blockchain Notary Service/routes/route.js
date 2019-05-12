module.exports = (server) => {

    const util = require('../utility/util.js');

    /*************************************************************
     ** Post request which validates request *********************
     *************************************************************/

    server.post('/requestValidation', async (req, res) => {
        const responseToUser = await util.requestValidation(req, res);
        res.json(responseToUser);
    });

    /*************************************************************
     ** Post request which validates message signature ***********
     *************************************************************/

    server.post('/message-signature/validate', async (req, res) => {
        const responseToUser = await util.validateMessageSignature(req, res);
        res.json(responseToUser);
    });

    /*************************************************************
     ** Post request which submits the Star information **********
     *************************************************************/

    server.post('/block', async (req, res) => {
        const responseToUser = await util.addStarInformation(req, res);
        res.json(responseToUser);
    });

    /*************************************************************
     ** Get Star block by hash ***********************************
     *************************************************************/

    server.get('/stars/hash::hash', async (req, res) => {
        const responseToUser = await util.getStarByHash(req, res);
        res.json(responseToUser);
    });

    /*************************************************************
     ** Get Star block by wallet address *************************
     *************************************************************/

    server.get('/stars/address::address', async (req, res) => {
        const responseToUser = await util.getStarByAddress(req, res);
        res.json(responseToUser);
    });

    /*************************************************************
     ** Get star block by star block height **********************
     *************************************************************/

    server.get('/block/:blockHeight', async (req, res) => {
        const responseToUser = await util.getStarByBlockHeight(req, res);
        res.json(responseToUser);
    });

    /*****************************************************
     ** Unreachable GET route ****************************
     *****************************************************/

    server.get('*', (req, res) => {
        const responseToUser = {
            error: 'Unreachable GET route'
        };
        res.status(404).json(responseToUser);
    });

    /*****************************************************
     ** Unreachable POST route ***************************
     *****************************************************/

    server.post('*', (req, res) => {
        const responseToUser = {
            error: 'Unreachable POST route'
        };
        res.status(404).json(responseToUser);
    });

};