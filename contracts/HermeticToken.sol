// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HermeticToken is ERC20, Ownable {
    function decimals() public view virtual override returns (uint8) {
        return 7;
    }

    function getDecimal(uint256 value) private view returns (uint256) {
        return value * (10 ** uint256(decimals()));
    }

    uint256 public MAX_SUPPLY = getDecimal(330000);
    uint16 public INITIAL_SUPPLY = 10000;

    enum TransactionType { Deposit, Withdraw }

    struct Transaction {
        uint256 value;
        TransactionType transactionType;
    }

    Transaction[] public BALLAST_TRANSACTIONS;

    mapping(address => bool) public isAddressFrozen;
    // mapping(address => string) public freezingReasons;

    constructor() ERC20("Hermetic Token", "HERM") {
        // This is the fixed prize for creating this ERC-20.
        _mint(msg.sender, INITIAL_SUPPLY); // 0.0010000
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {   
        uint256 senderBalance = balanceOf(sender);

        require(isAddressFrozen[sender] != true, "SENDER_ADDRESS_FROZEN");
        require(isAddressFrozen[recipient] != true, "RECIPIENT_ADDRESS_FROZEN");
        
        require(amount > 0, "EMPTY_TRANSFER_AMOUNT");
        require(amount <= senderBalance, "INSUFFICIENT_TRANSFER_AMOUNT");

        require(sender != address(0), "INVALID_SENDER");
        require(recipient != address(0), "INVALID_RECIPIENT");
        
        require(sender != recipient, "UNSUPPORTED_OPERATION");

        uint256 tranferAmount = amount / 2;
        uint256 burnAmount = amount - tranferAmount; 

        super._transfer(sender, recipient, tranferAmount);
        super._burn(sender, burnAmount);
    }

    function getBallast() public view returns (uint256) {
        uint256 balance = 0;

        for (uint256 i = 0; i < BALLAST_TRANSACTIONS.length; i++) {
            if (BALLAST_TRANSACTIONS[i].transactionType == TransactionType.Deposit) {
                balance += BALLAST_TRANSACTIONS[i].value;
            } else {
                balance -= BALLAST_TRANSACTIONS[i].value;
            }
        }
        
        return balance * 1e5;
    }

    function getPrice() public view returns (uint256) {
        return getBallast() / totalSupply();
    }

    function balanceValueOf(address account) public view returns (uint256) {
        uint256 accountBalance = balanceOf(account);
        require(accountBalance > 0, "EMPTY_BALANCE_AMOUNT");

        return (accountBalance / 2) * getPrice();
    }

    function freezeAddress(address account, bool status) public onlyOwner {
        isAddressFrozen[account] = status;
    }

    function mint(address account, uint256 amount) public onlyOwner {
        require(isAddressFrozen[account] != true, "ADDRESS_IS_FROZEN");
        require(totalSupply() + amount <= MAX_SUPPLY, "MAX_SUPPLY_LIMIT_EXCEEDED");

        _mint(account, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function burnOf(address account, uint256 amount) public onlyOwner {
        uint256 accountBalance = balanceOf(account);

        require(isAddressFrozen[account] != false, "ADDRESS_NOT_FROZEN");
        require(accountBalance >= amount, "INSUFFICIENT_BURN_AMOUNT");
        
        uint256 burnAmount = amount;

        _burn(account, burnAmount);
    }

    function burnAll(address account) public onlyOwner {
        uint256 accountBalance = balanceOf(account);

        require(isAddressFrozen[account] != false, "ADDRESS_NOT_FROZEN");
        require(accountBalance > 0, "INSUFFICIENT_BURN_AMOUNT");
        
        _burn(account, accountBalance);
    }

    function deposit(uint256 value) public onlyOwner {
        require(value > 0, "EMPTY_DEPOSIT_AMOUNT");

        Transaction memory depositTransaction = Transaction(value, TransactionType.Deposit);

        BALLAST_TRANSACTIONS.push(depositTransaction);
    }

    function withdraw(uint256 value) public onlyOwner {
        require(getBallast() >= value, "INSUFFICIENT_WITHDRAW_AMOUNT");
        require(value > 0, "EMPTY_WITHDRAW_AMOUNT");

        Transaction memory withdrawTransaction = Transaction(value, TransactionType.Withdraw);

        BALLAST_TRANSACTIONS.push(withdrawTransaction);
    }
}
