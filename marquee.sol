pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Web3Marquee is Ownable {
  event SetMarquee(address sender, string marquee);

  string public marquee = "for the love of satoshi please just work dammit";
  uint public priceToChange = 1000000000000000;

  constructor() payable {}

  function setMarquee(string memory newMarquee) public payable {
    require(msg.value >= priceToChange, "You didn't pay enough");
    marquee = newMarquee;
    console.log(msg.sender, "set marquee to", marquee);
  }

  function getBalance() public view returns (uint) {
    return address(this).balance;
  }


  function withdrawMoney() public onlyOwner {
    address payable to = payable(msg.sender);
    to.transfer(getBalance());
  }

  function updatepriceToChange(uint newPrice) public onlyOwner {
    priceToChange = newPrice;
  }

  receive() external payable {}
  fallback() external payable {}
}
