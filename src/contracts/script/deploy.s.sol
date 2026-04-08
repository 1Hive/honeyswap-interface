// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import {Marquee} from "../src/Marquee.sol";

import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract Deploy is Script {
    function run() external {
        vm.createSelectFork("gnosis");
        vm.startBroadcast(vm.envUint("PK"));

        Marquee marquee = new Marquee();
        ERC1967Proxy marqueeProxy =
            new ERC1967Proxy(address(marquee), abi.encodeWithSelector(marquee.initialize.selector));
        marquee = Marquee(address(marqueeProxy));

        vm.stopBroadcast();
    }
}
