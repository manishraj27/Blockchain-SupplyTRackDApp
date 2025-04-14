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
        
        if (!contractJson.abi || !contractJson.evm || !contractJson.evm.bytecode) {
            throw new Error('Invalid contract compilation output');
        }
        
        // Get account from private key
        const account = web3.eth.accounts.privateKeyToAccount(process.env.WALLET_PRIVATE_KEY);
        web3.eth.accounts.wallet.add(account);
        
        console.log('Deploying from account:', account.address);
        
        // Deploy contract
        const Contract = new web3.eth.Contract(contractJson.abi);
        const deploy = Contract.deploy({
            data: '0x' + contractJson.evm.bytecode.object,
            arguments: []
        });
        
        // Estimate gas for deployment (optional but recommended)
        let gasEstimate;
        try {
            gasEstimate = await deploy.estimateGas({ from: account.address });
            console.log(`Estimated gas: ${gasEstimate}`);
        } catch (err) {
            console.warn('Gas estimation failed, using fixed value:', err.message);
            gasEstimate = 3000000; // Fallback gas limit
        }

        console.log('Deploying contract...');
        const deployedContract = await deploy.send({
            from: account.address,
            gas: Math.min(5000000, Math.ceil(gasEstimate * 1.2)), // Add 20% buffer to estimated gas, with a cap
            gasPrice: await web3.eth.getGasPrice()
        });
        
        console.log('Contract deployed at:', deployedContract.options.address);
        
        // Update .env file
        const envPath = path.resolve(__dirname, '../.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Check if CONTRACT_ADDRESS exists in the .env file
        if (envContent.includes('CONTRACT_ADDRESS=')) {
            envContent = envContent.replace(
                /CONTRACT_ADDRESS=.*/,
                `CONTRACT_ADDRESS=${deployedContract.options.address}`
            );
        } else {
            // If not, append it
            envContent += `\nCONTRACT_ADDRESS=${deployedContract.options.address}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        
        console.log('Updated .env file with new contract address');
        
    } catch (error) {
        console.error('Deployment failed:', error);
        process.exit(1);
    }
}

deployContract();