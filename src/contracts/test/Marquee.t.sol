// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Marquee.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract MarqueeTest is Test {
    Marquee marquee;

    ERC1967Proxy proxy;

    address someone = address(1);

    uint256 INITIAL_VALUE = 10 ether;

    string INITIAL_MARQUEE_TEXT;

    function setUp() public {
        marquee = new Marquee();
        proxy = new ERC1967Proxy(address(marquee), abi.encodeWithSelector(marquee.initialize.selector));
        marquee = Marquee(address(proxy));

        INITIAL_MARQUEE_TEXT = marquee.getMarquee();

        vm.deal(address(this), INITIAL_VALUE);
        vm.label(address(this), "Owner");
        vm.deal(someone, INITIAL_VALUE);
        vm.label(someone, "someone");
    }

    function xtestOwnership() public {
        address owner = marquee.owner();
        assertEq(owner, address(this));
    }

    function testMarqueText() public {
        string memory newMsg = "Hello, world!";
        vm.expectRevert(bytes("[M01] You didn't pay enough"));
        marquee.setMarquee(newMsg);

        vm.startPrank(someone);

        marquee.setMarquee{value: marquee.getPrice()}(newMsg);

        vm.stopPrank();

        assertEq(marquee.getMarquee(), newMsg);
        assertEq(someone.balance, INITIAL_VALUE - marquee.getPrice());
    }

    function testBigMarqueText() public {
        uint256 LENGHT_MARQUEE = marquee.maxLenMarquee() + 1;
        string memory newMsg = "";
        for (uint256 i = 0; i < LENGHT_MARQUEE; i++) {
            newMsg = string(abi.encodePacked(newMsg, "!"));
        }

        assertEq(bytes(newMsg).length, LENGHT_MARQUEE);

        vm.startPrank(someone);

        uint256 price = marquee.getPrice();

        vm.expectRevert(bytes("[M03] Your message is not allowed"));
        marquee.setMarquee{value: price}(newMsg);

        vm.stopPrank();

        assertEq(marquee.getMarquee(), INITIAL_MARQUEE_TEXT);
        assertEq(someone.balance, INITIAL_VALUE - marquee.minValue()); // minValue default is 0

        marquee.updateMaxLenMarquee(LENGHT_MARQUEE + 1);

        vm.startPrank(someone);

        marquee.setMarquee{value: price}(newMsg);

        vm.stopPrank();
    }

    function testZeroMarqueText() public {
        string memory newMsg = "";

        uint256 price = marquee.getPrice();

        vm.startPrank(someone);

        marquee.setMarquee{value: price}(newMsg);

        vm.stopPrank();
    }
}
