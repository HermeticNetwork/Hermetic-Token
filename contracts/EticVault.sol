// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./vaults/TokenVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct VaultInfo {
    uint256 _amount;
    string _symbol;
    ERC20 _asset;
    address _address;
}

contract EticVault is Ownable {
    TokenVault[] public _vaults;
    address public immutable HERM_ADDRESS;

    constructor(address[] memory _vault_address, address _herm_address) {
        HERM_ADDRESS = _herm_address;

        for (uint256 i = 0; i < _vault_address.length; i++) {
            TokenVault _contract = TokenVault(_vault_address[i]);

            _vaults.push(_contract);
        }
    }

    function setVault(address _address) public onlyOwner {
        TokenVault _contract = TokenVault(_address);

        _vaults.push(_contract);
    }

    function implementVault(ERC20 _asset) public onlyOwner {
        string memory name = string(abi.encodePacked("vault", _asset.name()));
        string memory symbol = string(abi.encodePacked("v", _asset.symbol()));

        TokenVault _vault = new TokenVault(_asset, name, symbol, HERM_ADDRESS);
        
        _vaults.push(_vault);
    }

    function vaultBalances() public view returns (VaultInfo[] memory) {
        uint256 numVaults = _vaults.length;
        VaultInfo[] memory balances = new VaultInfo[](numVaults);

        for (uint256 i = 0; i < numVaults; i++) {
            uint256 amount = _vaults[i].totalAssets();
            address vaultAddress = address(_vaults[i]);

            balances[i] = VaultInfo(
                amount,
                _vaults[i].getAssetSymbol(),
                _vaults[i].getAssetAddress(),
                vaultAddress
            );
        }

        return balances;
    }
}