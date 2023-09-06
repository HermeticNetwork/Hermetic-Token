# Hermetic Token

This is an ERC-20 standard token used in the Hermetic DAO Ecosystem.

### Installing the dependencies and deploying

Install all required dependencies via NPM:
```sh
npm install
```

or if you prefer, via YARN:
```sh
yarn install
```

#### 1. Serving a Hardhat Network

```sh
npm run serve 
```

or directly from Hardhat:

```sh
npx hardhat node 
```

#### 2. Deploying the Contract

In a new terminal tab, deploy the contract:

```sh
npm run deploy 
```
or directly from Hardhat:

```sh
npx hardhat run --network localhost scripts/deploy.ts
```

As a result, your contract is already functional on the Hardhat network.

Explore the scripts present in `package.json` and their respective files, there you can transfer, mine and burn units and it is an efficient way to test and develop.

It is important to say that some variables need to be populated in these files inside `./scripts/`, check it out.

### Configuring in MetaTask

On the tab where the Hardhat network was served, the first output from the terminal is the network IP + the port, we will need this information.

```sh
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

Now in your MetaTask:

1. Click "Select Network"
2. Now go to "Add Network"
3. And then "Add a network manually"
4. Fill in the required fields

Give the name of the Network, it can be something like: `Hardhat`.
In the RPC URL you need to use the information obtained earlier.
The port will usually be `31337` in this case.
Give the currency symbol any name, `ETH` itself will do.

Just save and that's it.

#### How to send balance to my wallet

As by default in ERC-20 the owner of the contract is the one who sent it, we can consider opening the Hardhat network tab and see the first account.

From there we will edit the `mint.js` script.

Get the `privateKey` from the first account and fill in the variable.

In `tokenContractAddress` you need to get the information from the second tab, or, in the Hardhat network tab, find the "Contract address" of the deploy.

And finally, copy your MetaTask address and change it to `recipientAddress`.

With that, you just have to run:
```sh
yarn script:mint
```

And that should be enough to send funds to your MetaTask wallet.