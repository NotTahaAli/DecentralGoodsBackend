import { Contract, JsonRpcProvider } from "ethers";
import { alchemyApiKey, contractAbi, contractAddress } from "../configs/contract.config";

let provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/"+alchemyApiKey);

export const blockChainContract = new Contract(contractAddress, contractAbi, provider);