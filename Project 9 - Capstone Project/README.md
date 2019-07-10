# Project 9 - Capstone Project

# Capstone: Real Estate Marketplace

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Node.js runtime environment is required.

### Installing

Install all required dependencies

```
$ npm install
```

Install truffle

```
$ npm install -g truffle
```

### Steps to run a local ethereum network, and deploy your token contract to this local network

1) Open a Terminal window, and make sure you are inside your project directory

2) Run the command `truffle develop` (to run a local ethereum network)

3) Use the command `compile` (to compile your solidity contract files)

4) Use the command `migrate --reset --network development` (to deploy your contract to the locally running ethereum network)

5) Use the command `test` (to unit tests the contract)

## Zocrates integrateion

__Zokrates__ is invoked in docker with the following command. Steps below have already been done, they are here just for documentation purpose.

Replace the ```<absolute path>``` with your path to the project.

```
../../../../zokrates compile -i square.code
```

```
../../../../zokrates setup --proving-scheme pghr13
```

```
../../../../zokrates compute-witness -a 2 4
```

```
../../../../zokrates generate-proof --proving-scheme pghr13
```

```
../../../../zokrates export-verifier --proving-scheme pghr13
```

## Rinkeby network

__Verifier__ contract address

```
0xdb9C1b09b7b0c7e58cE42f168C086E18eD017e77
```

__SolnSquareVerifier__ contract address

```
0x8293d345D5f5E092cFe72242EbF64D097B5Ae2D6
```

## ABI

[View __SolnSquareVerifier__ ABI](https://github.com/kartikeybhardwaj/udacity-blockchain-developer-nanodegree/blob/master/Project%209%20-%20Capstone%20Project/SolnSquareVerifierABI.txt)

## OpenSea assets

[https://rinkeby.opensea.io/assets/housingtoken](https://rinkeby.opensea.io/assets/housingtoken)

# Project Resources

* [Remix - Solidity IDE](https://remix.ethereum.org/)
* [Visual Studio Code](https://code.visualstudio.com/)
* [Truffle Framework](https://truffleframework.com/)
* [Ganache - One Click Blockchain](https://truffleframework.com/ganache)
* [Open Zeppelin ](https://openzeppelin.org/)
* [Interactive zero knowledge 3-colorability demonstration](http://web.mit.edu/~ezyang/Public/graph/svg.html)
* [Docker](https://docs.docker.com/install/)
* [ZoKrates](https://github.com/Zokrates/ZoKrates)
