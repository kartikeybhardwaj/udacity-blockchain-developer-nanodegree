/* ===== Using Express framework ====================
|  Web service to Get and Add Block 	        	|
|  ================================================*/

const server = require('express')();
const bodyParser = require('body-parser');
const port = 8000;

// for parsing application/json
server.use(bodyParser.json());
// start server
server.listen(port, () => console.log(`Project 3 is listening on port ${port}!`));

const BlockChain = require('./private-blockchain/BlockChain.js');
const Block = require('./private-blockchain/Block.js');
const myBlockChain = new BlockChain.Blockchain();

/*****************************************************
 ** Get request which return Block Data of given id **
 *****************************************************/

server.get('/block/:blockId', async (req, res) => {
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
    res.json(responseToUser);
});

/*************************************************************
 ** Post request which insert block in chain for given body **
 *************************************************************/

server.post('/block', async (req, res) => {
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
                                res.status(200);
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
    res.json(responseToUser);
});

/**********************************
 * Status codes used:
 * Success ************************
 * 200: OK
 * Client Error *******************
 * 406: Not Acceptable
 * 404: Not Found
 * Server Error *******************
 * 500: Internal Server Error
 **********************************/