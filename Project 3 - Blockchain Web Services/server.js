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

require('./routes/route.js')(server);

/**********************************
 * Status codes used:
 * Success ************************
 * 200: OK
 * 201: Created
 * Client Error *******************
 * 406: Not Acceptable
 * 404: Not Found
 * Server Error *******************
 * 500: Internal Server Error
 **********************************/