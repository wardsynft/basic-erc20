const { expect } = require("chai");
const hre = require("hardhat");

describe("ERC20Token contrat", function() {
    // global vars
    let Token;
    let erc20Token;
    let owner;
    let addr1;
    let addr2;
    let tokenCap = 100000000;
    let tokenBlockReward = 100;

    beforeEach(async function () {
        // Get ContractFactory and Signers
        Token = await ethers.getContractFactory("ERC20Token");
        [owner, addr1, addr2] = await hre.ethers.getSigners();

        erc20Token = await Token.deploy(tokenCap, tokenBlockReward);
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
          expect(await erc20Token.owner()).to.equal(owner.address);
        });
    
        it("Should assign the total supply of tokens to the owner", async function () {
          const ownerBalance = await erc20Token.balanceOf(owner.address);
          expect(await erc20Token.totalSupply()).to.equal(ownerBalance);
        });
    
        it("Should set the max capped supply to the argument provided during deployment", async function () {
          const cap = await erc20Token.cap();
          expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
        });
    
        it("Should set the blockReward to the argument provided during deployment", async function () {
          const blockReward = await erc20Token.blockReward();
          expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(tokenBlockReward);
        });
      });
    
      describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
          // Transfer 100 tokens from owner to addr1
          await erc20Token.transfer(addr1.address, 100);
          const addr1Balance = await erc20Token.balanceOf(addr1.address);
          expect(addr1Balance).to.equal(100);
    
          // Transfer 100 tokens from addr1 to addr2
          // We use .connect(signer) to send a transaction from another account
          await erc20Token.connect(addr1).transfer(addr2.address, 100);
          const addr2Balance = await erc20Token.balanceOf(addr2.address);
          expect(addr2Balance).to.equal(100);
        });
    
        it("Should fail if sender doesn't have enough tokens", async function () {
          const initialOwnerBalance = await erc20Token.balanceOf(owner.address);
          // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
          // `require` will evaluate false and revert the transaction.
          await expect(
            erc20Token.connect(addr1).transfer(owner.address, 1)
          ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    
          // Owner balance shouldn't have changed.
          expect(await erc20Token.balanceOf(owner.address)).to.equal(
            initialOwnerBalance
          );
        });
    
        it("Should update balances after transfers", async function () {
          const initialOwnerBalance = await erc20Token.balanceOf(owner.address);
    
          // Transfer 100 tokens from owner to addr1.
          await erc20Token.transfer(addr1.address, 100);
    
          // Transfer another 75 tokens from owner to addr2.
          await erc20Token.transfer(addr2.address, 75);
    
          // Check balances.
          const finalOwnerBalance = await erc20Token.balanceOf(owner.address);
          expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(175));
    
          const addr1Balance = await erc20Token.balanceOf(addr1.address);
          expect(addr1Balance).to.equal(100);
    
          const addr2Balance = await erc20Token.balanceOf(addr2.address);
          expect(addr2Balance).to.equal(75);
        });
      });
});