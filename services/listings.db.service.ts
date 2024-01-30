import databasePool from "./db.service";
type Listing = {
    ListingId: string,
    title: string,
    description: string,
    imageUrl: string
}

export async function getListingDetailsFromId(ListingId: bigint): Promise<false | Listing> {
    if (ListingId <= 0) return false;
    let resp = await databasePool.query(`SELECT * FROM "Listings" WHERE "ListingId" = $1`, [ListingId]);
    if (resp.rowCount == 0) return false;
    return resp.rows[0];
}

export async function setListingDetails(ListingId: bigint, title: string, description: string, imageUrl: string) : Promise<boolean> {
    if (ListingId <= 0) return false;
    await databasePool.query(`INSERT INTO "Listings"("ListingId", "title", "description", "imageUrl") VALUES($1, $2, $3, $4) ON CONFLICT("ListingId") DO UPDATE SET "title" = $2, "description" = $3, "imageUrl" = $4;`, [ListingId, title, description, imageUrl]);
    return true;
}

export async function setListingTitle(ListingId: bigint, title: string) : Promise<boolean> {
    if (ListingId <= 0) return false;
    let resp = await databasePool.query(`UPDATE "Listings" SET "title" = $2 WHERE "ListingId" = $1 RETURNING "ListingId"`, [ListingId, title]);
    return (resp.rowCount == 0) ? false : true;
}

export async function setListingDescription(ListingId: bigint, description: string) : Promise<boolean> {
    if (ListingId <= 0) return false;
    let resp = await databasePool.query(`UPDATE "Listings" SET "description" = $2 WHERE "ListingId" = $1 RETURNING "ListingId"`, [ListingId, description]);
    return (resp.rowCount == 0) ? false : true;
}

export async function setListingImageUrl(ListingId: bigint, imageUrl: string) : Promise<boolean> {
    if (ListingId <= 0) return false;
    let resp = await databasePool.query(`UPDATE "Listings" SET "imageUrl" = $2 WHERE "ListingId" = $1 RETURNING "ListingId"`, [ListingId, imageUrl]);
    return (resp.rowCount == 0) ? false : true;
}

export async function createTable() {
    await databasePool.query(`CREATE TABLE IF NOT EXISTS "Listings" (
        "ListingId" numeric PRIMARY KEY,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "imageUrl" text NOT NULL
      );`);
}