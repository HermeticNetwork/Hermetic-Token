// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenVault.sol";
import { ERC20 } from "../tokens/ERC20.sol";

contract VaultUSDC is TokenVault  {
    constructor(address _address, address _onwer) TokenVault(ERC20(_address), "vaultUSD Coin", "vUSDC", _onwer) {}
}