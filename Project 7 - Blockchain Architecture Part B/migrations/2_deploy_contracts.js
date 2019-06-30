// migrating the appropriate contracts
const SellerRole = artifacts.require("./SellerRole.sol");
const TransporterRole = artifacts.require("./TransporterRole.sol");
const ConsumerRole = artifacts.require("./ConsumerRole.sol");
const SupplyChain = artifacts.require("./SupplyChain.sol");

module.exports = function(deployer) {
  deployer.deploy(SellerRole);
  deployer.deploy(TransporterRole);
  deployer.deploy(ConsumerRole);
  deployer.deploy(SupplyChain);
};
