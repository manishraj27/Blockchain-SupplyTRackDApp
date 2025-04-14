const path = require('path');
const fs = require('fs');
const solc = require('solc');

// Read the Solidity contract source code
const contractPath = path.resolve(__dirname, '../contracts/SupplyChain.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Create the input object for the compiler
const input = {
    language: 'Solidity',
    sources: {
        'SupplyChain.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

// Compile the contract
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Export the compiled contract
const contract = output.contracts['SupplyChain.sol']['SupplyChain'];
fs.writeFileSync(
    path.resolve(__dirname, '../contracts/SupplyChain.json'),
    JSON.stringify(contract, null, 2)
);

console.log('Contract compiled successfully');