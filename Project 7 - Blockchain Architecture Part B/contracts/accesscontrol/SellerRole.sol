pragma solidity >= 0.4 .24;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'SellerRole' to manage this role - add, remove, check
contract SellerRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event SellerAdded(address indexed account);
  event SellerRemoved(address indexed account);

  // Define a struct 'sellers' by inheriting from 'Roles' library, struct Role
  Roles.Role private sellers;

  // In the constructor make the address that deploys this contract the 1st seller
  constructor() public {
    _addSeller(msg.sender);
  }

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlySeller() {
    require(isSeller(msg.sender));
    _;
  }

  // Define a function 'isSeller' to check this role
  function isSeller(address account) public view returns (bool) {
    return sellers.has(account);
  }

  // Define a function 'addSeller' that adds this role
  function addSeller(address account) public onlySeller {
    _addSeller(account);
  }

  // Define a function 'renounceSeller' to renounce this role
  function renounceSeller() public {
    _removeSeller(msg.sender);
  }

  // Define an internal function '_addSeller' to add this role, called by 'addSeller'
  function _addSeller(address account) internal {
    sellers.add(account);
    emit SellerAdded(account);
  }

  // Define an internal function '_removeSeller' to remove this role, called by 'removeSeller'
  function _removeSeller(address account) internal {
    sellers.remove(account);
    emit SellerRemoved(account);
  }
}