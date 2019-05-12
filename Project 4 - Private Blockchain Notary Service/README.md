# Project #4. Private Blockchain Notary Service

This project is a Star Registry Service that allows users to claim ownership of their favorite star in the night sky.
This project has RESTful APIs built using Express Node.js framework that interfaces with the private blockchain built in [Project 2](https://github.com/kartikeybhardwaj/udacity-blockchain-developer-nanodegree/tree/master/Project%202%20-%20Blockchain%20Data) and is built upon the structure of [Project 3](https://github.com/kartikeybhardwaj/udacity-blockchain-developer-nanodegree/tree/master/Project%203%20-%20Blockchain%20Web%20Services).
This project has six endpoints:
* Three POST endpoints
* Three GET endpoints

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Node.js runtime environment is required.

### Installing

Install all required dependencies

```
$ npm install
```

Run server

```
$ node server.js
```

## POST Block Endpoints

### #01. Validate request

This endpoint posts an address. The response in JSON format for the endpoint provides message which user has to sign in given validation window. To sign message user can use Electrum. If user requests again using same address, validation window reduces until it expires.

REQUEST:

```
TYPE: POST
URL: http://localhost:8000/requestValidation
HEADER: { Content-Type: application/json }
Example BODY:
{
    "address": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j"
}
```

RESPONSE:

```
{
    "walletAddress": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j",
    "requestTimeStamp": "1557596493",
    "message": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j:1557596493:starRegistry",
    "validationWindow": 300
}
```

### #02. Validate message signature

This endpoint posts an address with signature of message generated from previous request. If signature is valid, transaction moves to validated transaction mempool. The response in JSON format for the endpoint tells whether upon validation, the user is granted access to register a single star or not.

REQUEST:

```
TYPE: POST
URL: http://localhost:8000/message-signature/validate
HEADER: { Content-Type: application/json }
Example BODY:
{
	"address": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j",
	"signature": "H7ZrgSjNuSvK7yG2Mz2hTg4TSjpToFk9aF7uDdkj9WVkRX2oPPvruweOgIE8sd9ZUM1F98Kf3l9ajOMi5+hsGAE="
}
```

RESPONSE:

```
{
    "registerStar": true,
    "status": {
        "address": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j",
        "requestTimeStamp": "1557596493",
        "message": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j:1557596493:starRegistry",
        "validationWindow": 268,
        "messageSignature": true
    }
}
```

### #03. Submit the Star information

This endpoint posts star information if transaction is in validated transaction mempool. It converts star story to hex string and adds transaction as block in blockchain removing validated transaction from mempool. The response in JSON format for the endpoint provides block data in blockchain.

REQUEST:

```
TYPE: POST
URL: http://localhost:8000/message-signature/validate
HEADER: { Content-Type: application/json }
Example BODY:
{
    "address": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j",
    "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "Found star using https://www.google.com/sky/"
    }
}
```

RESPONSE:

```
{
    "hash": "e5fe47ba3f0e5ff960a8d3ffe4ffe6b1c3edab27f8c3944dd895fdf50a276c3c",
    "height": 1,
    "body": {
        "address": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1557596987",
    "previousBlockHash": "2fb0fe3ac26da51427f2ba614b73d7bad2d0eca1352334e818069dc95b3b6042"
}
```

## GET Block Endpoints

### #01. Get Star block by hash

This endpoint has a GET request which uses a URL path with a block hash parameter. If star is found, its story is decoded back to ASCII. The response for this endpoint provides block object in JSON format.

REQUEST:

```
TYPE: GET
URL: http://localhost:8000/stars/hash::[blockhash]
Example URL path:
http://localhost:8000/stars/hash:e5fe47ba3f0e5ff960a8d3ffe4ffe6b1c3edab27f8c3944dd895fdf50a276c3c, where 'e5fe47ba3f0e5ff960a8d3ffe4ffe6b1c3edab27f8c3944dd895fdf50a276c3c' is the block hash
```

RESPONSE:

```
{
    "hash": "e5fe47ba3f0e5ff960a8d3ffe4ffe6b1c3edab27f8c3944dd895fdf50a276c3c",
    "height": 1,
    "body": {
        "address": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1557596987",
    "previousBlockHash": "2fb0fe3ac26da51427f2ba614b73d7bad2d0eca1352334e818069dc95b3b6042"
}
```

### #02. Get Star block by wallet address

This endpoint has a GET request which uses a URL path with a wallet address parameter. If stars are found, their stories are decoded back to ASCII. The response for this endpoint provides array of block objects in JSON format.

REQUEST:

```
TYPE: GET
URL: http://localhost:8000/stars/address::[walletaddress]
Example URL path:
http://localhost:8000/stars/address:1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j, where '1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j' is the wallet address
```

RESPONSE:

```
[
    {
        "hash": "e5fe47ba3f0e5ff960a8d3ffe4ffe6b1c3edab27f8c3944dd895fdf50a276c3c",
        "height": 1,
        "body": {
            "address": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j",
            "star": {
                "ra": "16h 29m 1.0s",
                "dec": "68° 52' 56.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1557596987",
        "previousBlockHash": "2fb0fe3ac26da51427f2ba614b73d7bad2d0eca1352334e818069dc95b3b6042"
    }
]
```

### #03. Get star block by star block height

This endpoint has a GET request which uses a URL path with block height parameter. If star is found, its story is decoded back to ASCII. The response for this endpoint provides array of block objects in JSON format.

REQUEST:

```
TYPE: GET
URL: http://localhost:8000/block/[blockheight]
Example URL path:
http://localhost:8000/block/1, where '1' is the block height
```

RESPONSE:

```
{
    "hash": "e5fe47ba3f0e5ff960a8d3ffe4ffe6b1c3edab27f8c3944dd895fdf50a276c3c",
    "height": 1,
    "body": {
        "address": "1MPUSndUm6NGZqv3yekP5JrLUkY8pthm6j",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1557596987",
    "previousBlockHash": "2fb0fe3ac26da51427f2ba614b73d7bad2d0eca1352334e818069dc95b3b6042"
}
```

## Built With

* [level](https://www.npmjs.com/package/level) - A Node.js-style LevelDB wrapper for Node.js
* [crypto-js](https://www.npmjs.com/package/crypto-js) - JavaScript library of crypto standards
* [bitcoinjs-message](https://www.npmjs.com/package/bitcoinjs-message) - JavaScript library to sign and verify bitcoin messages
* [Express](https://expressjs.com/) - Web framework for Node.js