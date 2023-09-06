
async function transfer() {
    const URL_PROVIDER = "http://127.0.0.1:8545/";
    const provider = new ethers.JsonRpcProvider(URL_PROVIDER);

    const privateKey = "";
    const wallet = new ethers.Wallet(privateKey, provider);

    const recipientAddress = "";
    const tokenContractAddress = "";
    const amount = 10000000;

    const contractAbi = ['function transfer(address to, uint256 amount)'];
    const contract = new ethers.Contract(tokenContractAddress, contractAbi, wallet);

    const transaction = await contract.transfer(recipientAddress, amount);
    await transaction.wait();

    console.log(`Tx Hash: ${transaction.hash}`);
}

transfer()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
