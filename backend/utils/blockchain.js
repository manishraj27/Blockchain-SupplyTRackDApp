const { Web3 } = require('web3');  // Changed this line
const path = require('path');
const fs = require('fs');
const contractPath = path.resolve(__dirname, '../contracts/SupplyChain.json');
const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
require('dotenv').config();

const web3 = new Web3(process.env.BLOCKCHAIN_NETWORK);

let contract;
try {
    contract = new web3.eth.Contract(
        contractJson.abi,
        process.env.CONTRACT_ADDRESS
    );
} catch (error) {
    console.error('Contract initialization failed:', error.message);
    contract = null;
}

const account = process.env.WALLET_PRIVATE_KEY 
    ? web3.eth.accounts.privateKeyToAccount(process.env.WALLET_PRIVATE_KEY)
    : null;

if (account) {
    web3.eth.accounts.wallet.add(account);
}

module.exports = {
    web3,
    contract,
    account: account ? account.address : null,
    contractAbi: contractJson.abi
};