import { ethers } from 'ethers';
import SupplyChainABI from '../contracts/SupplyChain.json';

const CONTRACT_ADDRESS = '0x57B75fdDb9B40c115B2Fb85E142A129f66e94367';

export const getWeb3Provider = async () => {
  if (typeof window.ethereum === 'undefined') {
    console.warn('Please install MetaMask to use this application');
    return null;
  }
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  return new ethers.BrowserProvider(window.ethereum);
};

export const getContract = async () => {
  const provider = await getWeb3Provider();
  if (!provider) return null;
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, SupplyChainABI.abi, signer);
};