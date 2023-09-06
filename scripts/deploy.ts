async function deploy() {
  const HermeticToken = await ethers.deployContract("HermeticToken");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", await deployer.getAddress());
  console.log("Token address:", await HermeticToken.getAddress());
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
