# Project #3. Connect Private Blockchain to Front-End Client via APIs

This project has RESTful APIs built using Express Node.js framework that interfaces with the private blockchain built in [Project 2](https://github.com/kartikeybhardwaj/udacity-blockchain-developer-nanodegree/tree/master/Project%202%20-%20Blockchain%20Data).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

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

## Get Block API

REQUEST:

```
TYPE: GET
URL: http://localhost:8000/block/{block_height}
```

RESPONSE:

```
{
    "hash": "19eb3cd3c81b45457ded2ecfb6c9b0ccd9e7ab493c7f0b3c5e6dd551cd3736f8",
    "height": 0,
    "body": "First block in the chain - Genesis block",
    "time": "1556966325",
    "previousBlockHash": ""
}
```

## Add Block API

REQUEST:

```
TYPE: POST
URL: http://localhost:8000/block
HEADER: { Content-Type: application/json }
BODY:
{
	"body": "Test Block 1"
}
```

RESPONSE:

```
{
    "hash": "fba83a7cfbda11b31e788ecd7c25bb45622b1be485d64d0cd3eee4791325f3df",
    "height": 1,
    "body": "Test Block 1",
    "time": "1556971343",
    "previousBlockHash": "19eb3cd3c81b45457ded2ecfb6c9b0ccd9e7ab493c7f0b3c5e6dd551cd3736f8"
}
```

## Built With

* [level](https://www.npmjs.com/package/level) - A Node.js-style LevelDB wrapper for Node.js
* [crypto-js](https://www.npmjs.com/package/crypto-js) - JavaScript library of crypto standards
* [Express](https://expressjs.com/) - Web framework for Node.js