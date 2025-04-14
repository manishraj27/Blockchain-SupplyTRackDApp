const path = require('path');
const fs = require('fs');
const solc = require('solc');

// Read the Solidity contract source code
const contractPath = path.resolve(__dirname, '../contracts/SupplyChain.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Create the input object for the compiler with specific compiler version
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
        },
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};

// Compile the contract
console.log('Compiling contract...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Check for errors
if (output.errors) {
    output.errors.forEach(error => {
        console.log(error.formattedMessage);
    });
}

// Check if there were any compilation errors that should stop the process
if (output.errors && output.errors.some(error => error.severity === 'error')) {
    console.error('Compilation failed!');
    process.exit(1);
}

// Export the compiled contract
const contract = output.contracts['SupplyChain.sol']['SupplyChain'];
fs.writeFileSync(
    path.resolve(__dirname, '../contracts/SupplyChain.json'),
    JSON.stringify(contract, null, 2)
);

console.log('Contract compiled successfully');