import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

import { Signer  } from "ethers";
import { HermeticToken } from "../typechain-types";

describe("Hermetic Token", function () {
  async function deployContract(): Promise<{
    token: HermeticToken;
    owner: Signer;
    otherAccounts: Signer[];
  }> {
    const [owner, ...otherAccounts] = await ethers.getSigners();

    const HermeticToken = await ethers.deployContract("HermeticToken");

    return {
      token: HermeticToken,
      owner,
      otherAccounts
    };
  }

  describe("Transfer", () => {
    it("Should transfer tokens between address with a fee", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      await HERM.transfer(recipient.getAddress(), 10);
      expect(await HERM.balanceOf(recipient.getAddress())).to.equal(5);
    });

    it("Should remove fee value from totalSupply after transactions", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      const TOTAL_SUPPLY = await HERM.INITIAL_SUPPLY();
      const EXPECT_SUPPLY = parseInt(TOTAL_SUPPLY) / 2;

      await HERM.transfer(recipient.getAddress(), HERM.totalSupply());
      expect(await HERM.totalSupply()).to.equal(EXPECT_SUPPLY);
    });

    it("Should throw an exception when the amount of transferred tokens is less than the address balance", async () => {
      const { otherAccounts, token: HERM } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      const AMOUNT = Math.floor(Math.random() * 3.3e12);

      try {
        await HERM.transfer(recipient.getAddress(), AMOUNT)
      } catch (error) {
        expect(error?.message).to.include("INSUFFICIENT_TRANSFER_AMOUNT");
      }
    });

    it("Should throw an exception when transferring tokens from a frozen address", async () => {
      const { token: HERM, owner: sender, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      await HERM.freezeAddress(sender.getAddress(), true);
      await HERM.freezeAddress(recipient.getAddress(), false);

      const ACCOUNT_AMOUNT = HERM.balanceOf(sender.getAddress());

      try {
        await HERM.transfer(sender.getAddress(), recipient.getAddress(), ACCOUNT_AMOUNT);
      } catch (error) {
        expect(error?.message).to.include("SENDER_ADDRESS_FROZEN");
      }
    });

    it("Should throw an exception when transferring tokens by a frozen address", async () => {
      const { token: HERM, owner: sender, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      await HERM.freezeAddress(recipient.getAddress(), true);
      await HERM.freezeAddress(sender.getAddress(), false);

      const ACCOUNT_AMOUNT = HERM.balanceOf(recipient.getAddress());

      try {
        await HERM.transfer(recipient.getAddress(), sender.getAddress(), ACCOUNT_AMOUNT);
      } catch (error) {
        expect(error?.message).to.include("RECIPIENT_ADDRESS_FROZEN");
      }
    });
  });

  describe("Deployment", () => {
    it("Should have correct name, symbol and decimals", async function () {
      const { token: HERM } = await loadFixture(deployContract);

      expect(await HERM.name()).to.equal("Hermetic Token");
      expect(await HERM.symbol()).to.equal("HERM");
      expect(await HERM.decimals()).to.equal(7);
    });

    it("Should correctly set the owner", async () => {
      const { token: HERM, owner } = await loadFixture(deployContract);

      expect(await HERM.owner()).to.equal(await owner.getAddress());
    });

    it("Should renounce ownership", async () => {
      const HERM = await ethers.deployContract("HermeticToken");

      await HERM.renounceOwnership()

      expect(await HERM.owner()).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("Should have the initial supply minted to the owner", async function () {
      const { token: HERM, owner } = await loadFixture(deployContract);

      expect(
        await HERM.balanceOf(await owner.getAddress())
      ).to.equal(
        await HERM.INITIAL_SUPPLY()
      );
    });
  });

  describe("Management", () => {
    it("Should mine tokens to address", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      const AMOUNT = 10;
      await HERM.mint(recipient.getAddress(), AMOUNT);

      expect(await HERM.balanceOf(recipient.getAddress())).to.equal(AMOUNT);
    });

    it("Should burn part of the funds of a frozen address with burn", async () => {
      const { token: HERM, owner } = await loadFixture(deployContract);

      const MINT_AMOUNT = 1000;
      const BURN_AMOUNT = MINT_AMOUNT / 2;

      await HERM.mint(await owner.getAddress(), MINT_AMOUNT);
      await HERM.freezeAddress(await owner.getAddress(), true);

      const OWNER_BALANCE = await HERM.balanceOf(await owner.getAddress());

      await HERM.burn(BURN_AMOUNT);

      const EXPECT_AMOUNT = parseInt(OWNER_BALANCE) - BURN_AMOUNT;

      expect(
        await HERM.balanceOf(await owner.getAddress())
      ).to.equal(EXPECT_AMOUNT);
    });

    it("Should burn part of the funds of a frozen address with burnOf", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      const MINT_AMOUNT = 10;
      const BURN_AMOUNT = MINT_AMOUNT / 2;

      await HERM.mint(recipient.getAddress(), MINT_AMOUNT);
      await HERM.freezeAddress(recipient.getAddress(), true);

      await HERM.burnOf(recipient.getAddress(), BURN_AMOUNT);

      const EXPECT_AMOUNT = MINT_AMOUNT - BURN_AMOUNT;

      expect(
        await HERM.balanceOf(recipient.getAddress())
      ).to.equal(EXPECT_AMOUNT);
    });

    it("Should burn all funds from a frozen address", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      const AMOUNT = 10;

      await HERM.mint(recipient.getAddress(), AMOUNT);
      await HERM.freezeAddress(recipient.getAddress(), true);

      await HERM.burnAll(recipient.getAddress());

      expect(await HERM.balanceOf(recipient.getAddress())).to.equal(0);
    });

    it("Should prevent burning of unfrozen address", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [_, recipient] = otherAccounts;

      const AMOUNT = 10;

      await HERM.freezeAddress(recipient.getAddress(), false);
      await HERM.mint(recipient.getAddress(), AMOUNT);

      try {
        await HERM.burnAll(recipient.getAddress());
      } catch (error) {
        expect(error?.message).to.include("ADDRESS_NOT_FROZEN");
      }
    });

    it("Should avoid burning a value greater than the address balance", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [_, recipient] = otherAccounts;

      const RECIPIENT_AMOUNT = await HERM.balanceOf(recipient.getAddress());
      await HERM.freezeAddress(recipient.getAddress(), true);

      try {
        await HERM.burnOf(recipient.getAddress(), parseInt(RECIPIENT_AMOUNT) + 10);
      } catch (error) {
        expect(error?.message).to.include("INSUFFICIENT_BURN_AMOUNT");
      }
    });
  });

  describe("Transactions", () => {
    it("Should throw an exception when a transfer has value equal to 0", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      try {
        await HERM.transfer(recipient.getAddress(), 0)
      } catch (error) {
        expect(error?.message).to.include("EMPTY_TRANSFER_AMOUNT");
      }
    });

    it("Should not allow transfer to the same address", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      const AMOUNT = 100;

      await HERM.freezeAddress(recipient.getAddress(), false);

      try {
        await HERM.transfer(recipient.getAddress(), recipient.getAddress(), AMOUNT);
      } catch (error) {
        expect(error?.message).to.include("UNSUPPORTED_OPERATION");
      }
    });
  });

  describe("Miner", () => {
    it("Should handle exceeding MAX_SUPPLY limit when minting", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      const MAX_SUPPLY = parseFloat(await HERM.MAX_SUPPLY());
      await HERM.freezeAddress(recipient.getAddress(), false);

      try {
        await HERM.mint(recipient.getAddress(), MAX_SUPPLY + 10);
      } catch (error) {
        expect(error?.message).to.include("MAX_SUPPLY_LIMIT_EXCEEDED");
      }
    });

    it("Should handle frozen account when minting", async () => {
      const { token: HERM, owner: recipient } = await loadFixture(deployContract);

      const ACCOUNT_AMOUNT = parseInt(await HERM.balanceOf(recipient.getAddress()));
      await HERM.freezeAddress(recipient.getAddress(), true);

      try {
        await HERM.mint(recipient.getAddress(), ACCOUNT_AMOUNT + 10);
      } catch (error) {
        expect(error?.message).to.include("ADDRESS_IS_FROZEN");
      }
    });
  });

  describe("Others", () => {
    it("Should get unit value based on getBallast", async () => {
      const { token: HERM } = await loadFixture(deployContract);

      const BALLAST = parseInt(await HERM.getBallast());
      const TOTAL_SUPPLY = parseInt(await HERM.totalSupply());

      const PRICE = BALLAST / TOTAL_SUPPLY;

      expect(await HERM.getPrice()).to.be.equal(PRICE);
    });

    it("Should get real value from an address", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const anyAccount = otherAccounts[2];

      await HERM.mint(anyAccount.getAddress(), 10);

      const ACCOUNT_BALANCE = parseInt(await HERM.balanceOf(anyAccount.getAddress()));
      const HERM_PRICE = parseInt(await HERM.getPrice());

      const PRICE = (ACCOUNT_BALANCE / 2) * HERM_PRICE;

      expect(await HERM.balanceValueOf(anyAccount.getAddress())).to.be.equal(PRICE);
    });

    it("Should handle empty balance when getting real value from an address", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const anyAccount = otherAccounts[3];

      try {
        await HERM.balanceValueOf(anyAccount.getAddress())
      } catch (error) {
        expect(error?.message).to.include("EMPTY_BALANCE_AMOUNT");
      }
    });
  });

  describe("Account Freezing", () => {
    it("Should freeze an address", async () => {
      const { token: HERM, owner: anyAccount } = await loadFixture(deployContract);


      await HERM.freezeAddress(anyAccount.getAddress(), true);
      const IS_ADDRESS_FROZEN = await HERM.isAddressFrozen(anyAccount.getAddress());

      expect(IS_ADDRESS_FROZEN).to.be.equal(true);
    });

    it("Should unfreeze an address", async () => {
      const { token: HERM, owner: anyAccount } = await loadFixture(deployContract);


      await HERM.freezeAddress(anyAccount.getAddress(), false);
      const IS_ADDRESS_FROZEN = await HERM.isAddressFrozen(anyAccount.getAddress());

      expect(IS_ADDRESS_FROZEN).to.be.equal(false);
    });
  });

  describe("Additional Tests", () => {
    it("Should correctly handle token freezing and unfreezing", async () => {
      const { token: HERM, owner, otherAccounts } = await loadFixture(deployContract);
      const [recipient] = otherAccounts;

      // Freeze and unfreeze addresses and verify their status
      await HERM.freezeAddress(recipient.getAddress(), true);
      let isRecipientFrozen = await HERM.isAddressFrozen(recipient.getAddress());
      expect(isRecipientFrozen).to.equal(true);

      await HERM.freezeAddress(recipient.getAddress(), false);
      isRecipientFrozen = await HERM.isAddressFrozen(recipient.getAddress());
      expect(isRecipientFrozen).to.equal(false);
    });

    it("Should correctly handle token minting and burning", async () => {
      const { token: HERM, owner } = await loadFixture(deployContract);

      const OWNER_BALANCE_BEFORE_MINT = await HERM.balanceOf(await owner.getAddress());

      const MINT_AMOUNT = 100;
      await HERM.mint(await owner.getAddress(), MINT_AMOUNT);

      const OWNER_BALANCE_AFTER_MINT = await HERM.balanceOf(owner.getAddress());

      expect(OWNER_BALANCE_AFTER_MINT).to.equal(parseInt(OWNER_BALANCE_BEFORE_MINT.toString()) + MINT_AMOUNT);

      const BURN_AMOUNT = 50;
      await HERM.burn(BURN_AMOUNT);

      const OWNER_BALANCE = parseInt(
        (await HERM.balanceOf(await owner.getAddress()))
          .toString()
      );

      const EXPECT_AMOUNT = parseInt(OWNER_BALANCE_BEFORE_MINT.toString()) + (MINT_AMOUNT - BURN_AMOUNT);

      expect(OWNER_BALANCE).to.equal(EXPECT_AMOUNT);
    });

    it("Should handle edge cases for token transfers", async () => {
      const { token: HERM, otherAccounts } = await loadFixture(deployContract);
      const [sender, recipient] = otherAccounts;

      const SENDER_BALANCE = parseInt(await HERM.balanceOf(sender.getAddress()));
      const TRANSFER_AMOUNT = SENDER_BALANCE + 1;

      try {
        await HERM.transfer(recipient.getAddress(), TRANSFER_AMOUNT);
      } catch (error) {
        expect(error?.message).to.include("INSUFFICIENT_TRANSFER_AMOUNT");
      }

      try {
        await HERM.transfer(recipient.getAddress(), 0);
      } catch (error) {
        expect(error?.message).to.include("EMPTY_TRANSFER_AMOUNT");
      }

      try {
        await HERM.transfer(sender.getAddress(), sender.getAddress(), 10);
      } catch (error) {
        expect(error?.message).to.include("UNSUPPORTED_OPERATION");
      }
    });
  });
});
