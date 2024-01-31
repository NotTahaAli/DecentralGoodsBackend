import {config} from "dotenv";
import isValidAddress from "../utils/isValidAddress.util";
config();

if (!process.env.CONTRACT_ADDRESS || !isValidAddress(process.env.CONTRACT_ADDRESS)) {
    console.log("Contract Address not Configured correctly.");
    process.exit(1);
}

export const contractAddress:string = process.env.CONTRACT_ADDRESS

//Contract ABI from JSON file abi.config.json
import ABI from "./abi.config.json";
if (!ABI) {
    console.log("Contract ABI not Configured correctly.");
    process.exit(1);
}

export const contractAbi = ABI;

if (!process.env.ALCHEMY_API_KEY) {
    console.log("Alchemy API Key not Configured correctly.");
    process.exit(1);
}

export const alchemyApiKey = process.env.ALCHEMY_API_KEY;

export default {
    contractAddress,
    contractAbi,
    alchemyApiKey
}