const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function deployContract() {
    try {
        const web3 = new Web3(process.env.BLOCKCHAIN_NETWORK);
        
        // Read contract data
        const contractPath = path.resolve(__dirname, '../contracts/SupplyChain.json');
        const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        
        // Get account from private key
        const account = web3.eth.accounts.privateKeyToAccount(process.env.WALLET_PRIVATE_KEY);
        web3.eth.accounts.wallet.add(account);
        
        console.log('Deploying from account:', account.address);
        
        // Deploy contract with modified parameters
        const Contract = new web3.eth.Contract(contractJson.abi);
        const deploy = Contract.deploy({
            data: '0x' + contractJson.evm.bytecode.object,
            arguments: []
        });
        
        console.log('Deploying contract...');
        const deployedContract = await deploy.send({
            from: account.address,
            gas: 3000000,  // Fixed gas limit
            gasPrice: await web3.eth.getGasPrice()
        });
        
        console.log('Contract deployed at:', deployedContract.options.address);
        
        // Update .env file
        const envPath = path.resolve(__dirname, '../.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(
            /CONTRACT_ADDRESS=.*/,
            `CONTRACT_ADDRESS=${deployedContract.options.address}`
        );
        fs.writeFileSync(envPath, envContent);
        
        console.log('Updated .env file with new contract address');
        
    } catch (error) {
        console.error('Deployment failed:', error);
    }
}

deployContract();