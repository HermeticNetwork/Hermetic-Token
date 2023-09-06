async function mint() {
    const URL_PROVIDER = "http://127.0.0.1:8545/";
    const provider = new ethers.JsonRpcProvider(URL_PROVIDER);

    const privateKey = "";
    const wallet = new ethers.Wallet(privateKey, provider);

    const tokenContractAddress = "";
    const contractAbi = ['function mint(address account, uint256 amount)', 'function balanceOf(address account)'];

    const contract = new ethers.Contract(tokenContractAddress, contractAbi, wallet);

    const recipientAddress = "";

    const amount = 33000000000;

    const transaction = await contract.mint(recipientAddress, amount);
    await transaction.wait();

    console.log(`Tx Hash: ${transaction.hash}`);
}

mint()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
