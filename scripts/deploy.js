const hre = require("hardhat");

async function main() {
  const ERC20Token = await hre.ethers.getContractFactory("ERC20Token");
  const erc20Token = await ERC20Token.deploy(100000000, 100);

  await erc20Token.deployed();

  console.log("ERC20Token deployed: ", erc20Token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
