pragma solidity ^0.8.13;
// SPDX-License-Identifier: MIT

import "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import "openzeppelin-contracts-upgradeable/contracts/proxy/utils/UUPSUpgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/security/PausableUpgradeable.sol";

import "openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";

contract Marquee is Initializable, PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
    uint256 public version; // Contract version

    uint256 public minValue; // Minimum payment required
    uint256 private price; // Current price for setting the marquee

    uint256 public maxLenMarquee; // Maximum length of the marquee message
    string private marquee; // The marquee message

    event SetMarquee(address sender, string marquee); // Event emitted when marquee is set

    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract with default values.
     */
    function initialize() public initializer {
        __Pausable_init();
        __Ownable_init();
        __UUPSUpgradeable_init();

        version = 1;
        minValue = 0 ether;
        price = 0.001 ether;
        marquee = "for the love of satoshi please just work dammit"; // Default marquee message
        maxLenMarquee = 200;
    }

    /**
     * @dev Sets the marquee message.
     * Emits a SetMarquee event when successful.
     * Requires payment equal to or greater than the current price.
     * Rejects messages that exceed the maximum length or insufficient payment.
     * @param newMarquee The new marquee message to set.
     */
    function setMarquee(string memory newMarquee) external payable whenNotPaused {
        uint256 currentPrice = getPrice();
        require(msg.value >= currentPrice, "[M01] You didn't pay enough");

        bool success = _checkLenLimit(newMarquee);
        if (!success) {
            (bool sent,) = msg.sender.call{value: currentPrice - minValue}("");
            require(sent, "[M02] Failed to send value back");
            revert("[M03] Your message is not allowed");
        }

        marquee = newMarquee;
        emit SetMarquee(msg.sender, newMarquee);
    }

    /**
     * @dev Retrieves the current marquee message.
     * Requires the contract to be not paused.
     * @return The current marquee message.
     */
    function getMarquee() public view whenNotPaused returns (string memory) {
        return marquee;
    }

    /**
     * @dev Checks if the length of the new marquee exceeds the maximum limit.
     * @param newMarquee The new marquee message to check.
     * @return A boolean indicating whether the length is within the limit.
     */
    function _checkLenLimit(string memory newMarquee) internal view returns (bool) {
        return bytes(newMarquee).length <= maxLenMarquee;
    }

    /**
     * @dev Retrieves the contract balance.
     * @return The current balance of the contract.
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Withdraws the contract balance to the specified address.
     * Requires the target address to be non-zero.
     * @param to The address to withdraw the balance to.
     */
    function withdrawTo(address payable to) public onlyOwner {
        require(to != address(0), "[M04] Cannot withdraw to zero address");
        (bool sent,) = to.call{value: getBalance()}("");
        require(sent, "[M05] Failed to withdraw Ether");
    }

    /**
     * @dev Withdraws the contract balance to the owner's address.
     */
    function withdraw() public onlyOwner {
        address payable to = payable(msg.sender);
        withdrawTo(to);
    }

    /**
     * @dev Updates the price for setting the marquee.
     * Requires the sender to be the contract owner.
     * @param newPrice The new price to set.
     */
    function updatePrice(uint256 newPrice) external onlyOwner {
        price = newPrice;
    }

    /**
     * @dev Updates the minimum payment required.
     * Requires the sender to be the contract owner.
     * @param newMinValue The new minimum payment value to set.
     */
    function updateMinValue(uint256 newMinValue) external onlyOwner {
        minValue = newMinValue;
    }

    /**
     * @dev Updates the maximum length of the marquee message.
     * Requires the sender to be the contract owner.
     * @param newMaxLenMarquee The new maximum length to set.
     */
    function updateMaxLenMarquee(uint256 newMaxLenMarquee) external onlyOwner {
        maxLenMarquee = newMaxLenMarquee;
    }

    /**
     * @dev Overrides the default upgrade authorization.
     * Requires the sender to be the contract owner.
     * @param newImplementation The address of the new implementation.
     */
    function _authorizeUpgrade(address newImplementation) internal virtual override onlyOwner {}

    /**
     * @dev Pauses the contract.
     * Requires the sender to be the contract owner.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract.
     * Requires the sender to be the contract owner.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Retrieves the current price for setting the marquee.
     * @return The current price in wei.
     */
    function getPrice() public view returns (uint256) {
        return price;
    }
}
