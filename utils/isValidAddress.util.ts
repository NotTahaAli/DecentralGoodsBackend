export default function isValidAddress(address: string): boolean {
    if (address.length != 42) return false;
    if (address.substring(0, 2) != "0x") return false;
    for (let i = 2; i < address.length; i++) {
        if (address[i] >= '0' && address[i] <= '9') continue;
        if (address[i] >= 'a' && address[i] <= 'f') continue;
        if (address[i] >= 'A' && address[i] <= 'F') continue;
        return false;
    }
    return true;
}