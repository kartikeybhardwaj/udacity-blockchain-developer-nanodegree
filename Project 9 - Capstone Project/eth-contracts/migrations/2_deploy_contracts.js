// migrating the appropriate contracts
var SquareVerifier = artifacts.require("./SquareVerifier.sol");
var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");

module.exports = function (deployer) {
  deployer.deploy(SquareVerifier);
  deployer.deploy(SolnSquareVerifier);
};

module.exports = function (deployer) {
  deployer.deploy(SquareVerifier)
    .then(() => {
      return deployer.deploy(SolnSquareVerifier, SquareVerifier.address)
    });
}