module.exports = (server) => {

    const view = require('../views/view.js');

    /*****************************************************
     ** Get request which return Block Data of given id **
     *****************************************************/

    server.get('/block/:blockId', async (req, res) => {
        const responseToUser = await view.getBlock(req, res);
        res.json(responseToUser);
    });

    /*************************************************************
     ** Post request which insert block in chain for given body **
     *************************************************************/

    server.post('/block', async (req, res) => {
        const responseToUser = await view.addBlock(req, res);
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