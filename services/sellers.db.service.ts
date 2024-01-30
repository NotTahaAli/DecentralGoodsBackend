import isValidAddress from "../utils/isValidAddress.util";
import databasePool from "./db.service";
// type Seller = {
//     Address: string,
//     PublicKey: string
// }

export async function getPublicKeyFromAddress(userAddress: string): Promise<false | string> {
    if (!isValidAddress(userAddress)) return false;
    let resp = await databasePool.query(`SELECT "PublicKey" FROM "Sellers" WHERE "Address" = $1`, [userAddress]);
    if (resp.rowCount == 0) return false;
    return resp.rows[0].PublicKey;
}

export async function setPublicKey(userAddress: string, publicKey: string): Promise<boolean> {
    if (!isValidAddress(userAddress)) return false;
    await databasePool.query(`INSERT INTO "Sellers"("Address", "PublicKey") VALUES($1, $2) ON CONFLICT("Address") DO UPDATE SET "PublicKey" = $2;`, [userAddress, publicKey]);
    return true;
}

export async function createTable() {
    await databasePool.query(`CREATE TABLE IF NOT EXISTS "Sellers" (
        "Address" char(42) PRIMARY KEY,
        "PublicKey" text UNIQUE NOT NULL
      );`);
}