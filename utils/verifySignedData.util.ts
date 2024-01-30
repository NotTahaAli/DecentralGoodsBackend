import { verifyMessage } from "ethers";

export default function verifySignedData(address: string, data: string, timestamp: number, signature: string): true | string {
    if (Date.now() - timestamp > 5 * 60 * 1000 || timestamp > Date.now()) {
        return "Invalid Timestamp";
    }
    try {
        if (verifyMessage(data+" "+timestamp, signature).toLowerCase() != address.toLowerCase()) throw new Error();
    } catch (err) {
        return "Invalid Signature";
    }
    return true;
}