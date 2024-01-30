import databasePool from "./db.service";
type Seller = {
    Address: string,
    PublicKey: string
}

export async function getPublicKeyFromAddress(userAddress: string): Promise<false | string> {
    let resp = await databasePool.query(`SELECT "PublicKey" FROM "Sellers" WHERE "Address" = $1`, [userAddress]);
    if (resp.rowCount == 0) return false;
    return resp.rows[0].PublicKey;
}

export async function addPublicKey(userAddress: string, publicKey: string): Promise<boolean> {
    let resp = await databasePool.query(`INSERT INTO "Sellers"("Address", "PublicKey") VALUES($1, $2) RETURNING "Address"`, [userAddress, publicKey]);
    return (resp.rowCount && resp.rowCount > 0) ? true : false;
}

export async function changePublicKey(userAddress: string, publicKey: string): Promise<boolean> {
    let resp = await databasePool.query(`UPDATE "Sellers" SET "PublicKey" = $2 WHERE "Address" = $1 RETURNING "Address"`, [userAddress, publicKey]);
    return (resp.rowCount && resp.rowCount > 0) ? true : false;
}

export async function createTable() {
    await databasePool.query(`CREATE TABLE IF NOT EXISTS "Sellers" (
        "Address" char(42) PRIMARY KEY,
        "PublicKey" text UNIQUE NOT NULL
      );`);
}