async function burn() {
    const URL_PROVIDER = "http://127.0.0.1:8545/";
    const provider = new ethers.JsonRpcProvider(URL_PROVIDER);

    const privateKey = "";
    const wallet = new ethers.Wallet(privateKey, provider);

    const tokenContractAddress = "";
    const contractAbi = ['function burn(uint256 amount)'];

    const amount = 10000000;

    const contract = new ethers.Contract(tokenContractAddress, contractAbi, wallet);

    const transaction = await contract.burn(amount);
    await transaction.wait();

    console.log(`Tx Hash: ${transaction.hash}`);
}

burn()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
