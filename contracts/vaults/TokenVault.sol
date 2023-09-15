// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";

import { ERC20 } from "../tokens/ERC20.sol";
import { ERC4626 } from "../tokens/ERC4626.sol";

contract TokenVault is ERC4626 {
    address _Owner;

    constructor(
        ERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _owner
    ) ERC4626(_asset, _name, _symbol) {
        _Owner = _owner;
    }

    function _deposit(address from, address to, uint256 amount) internal {
        require(amount > 0, "EMPTY_DEPOSIT_AMOUNT");
        require(asset.transferFrom(from, to, amount), "TRANSFER_FAILED");
    }

    function getAssetSymbol() public view returns (string memory) {
        return asset.symbol();
    }

    function getAssetAddress() public view returns (ERC20) {
        return asset;
    }

    function totalAssets() public view override returns (uint256) {
        return asset.balanceOf(address(this));
    }
}
