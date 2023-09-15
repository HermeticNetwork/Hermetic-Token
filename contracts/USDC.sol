// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDC is ERC20, Ownable {
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function getDecimal(uint256 value) private view returns (uint256) {
        return value * (10 ** uint256(decimals()));
    }

    uint256 public MAX_SUPPLY = 30000000000.000000;

    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, MAX_SUPPLY);
    }
}
