pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
// import "@openzeppelin/contracts/access/Ownable.sol"; 
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract Web3Marquee {

  event SetPurpose(address sender, string purpose);

  string public purpose = "premium rugs at a great discount";

  constructor() payable {
    // what should we do on deploy?
  }

  function setPurpose(string memory newPurpose) public payable {
      require(msg.value >= .0001 ether, "nope");
      purpose = newPurpose;
      console.log(msg.sender,"set purpose to",purpose);
    // emit SetPurpose(msg.sender, purpose);
  }

  // to support receiving ETH by default
  receive() external payable {}
  fallback() external payable {}
}
