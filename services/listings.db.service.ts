import { QueryResult } from "pg";
import isValidAddress from "../utils/isValidAddress.util";
import databasePool from "./db.service";

export type Listing = {
    ListingId: string,
    title: string,
    description: string,
    imageUrl: string,
    sellerAddress: string
}

export async function getAllListings(limit: number | undefined = undefined, endingPoint: string | undefined = undefined): Promise<Listing[]> {
    let resp: QueryResult<Listing>;
    console.log(limit);
    if (endingPoint == undefined) {
        if (limit == undefined) {
            resp = await databasePool.query<Listing>(`SELECT * FROM "Listings" ORDER BY "ListingId" DESC`);
        } else {
            resp = await databasePool.query<Listing>(`SELECT * FROM "Listings" ORDER BY "ListingId" DESC LIMIT $1`, [limit]);
        }
    } else {
        if (limit == undefined) {
            resp = await databasePool.query<Listing>(`SELECT * FROM "Listings" WHERE "ListingId" < $1 ORDER BY "ListingId" DESC`, [endingPoint]);
        } else {
            resp = await databasePool.query<Listing>(`SELECT * FROM "Listings" WHERE "ListingId" < $2 ORDER BY "ListingId" DESC LIMIT $1`, [limit, endingPoint]);
        }
    }
    return resp.rows;
}

export async function getListingsFromSellerAddress(sellerAddress: string): Promise<Listing[]> {
    if (!isValidAddress(sellerAddress)) return [];
    let resp = await databasePool.query<Listing>(`SELECT * FROM "Listings" WHERE "sellerAddress" = $1`, [sellerAddress]);
    return resp.rows;
}

export async function getListingDetailsFromId(ListingId: bigint): Promise<false | Listing> {
    if (ListingId <= 0) return false;
    let resp = await databasePool.query<Listing>(`SELECT * FROM "Listings" WHERE "ListingId" = $1`, [ListingId]);
    if (resp.rowCount == 0) return false;
    return resp.rows[0];
}

export async function setListingDetails(ListingId: bigint, title: string, description: string, imageUrl: string, sellerAddress: string): Promise<boolean> {
    if (ListingId <= 0) return false;
    if (!isValidAddress(sellerAddress)) return false;
    await databasePool.query(`INSERT INTO "Listings"("ListingId", "title", "description", "imageUrl", "sellerAddress") VALUES($1, $2, $3, $4, $5) ON CONFLICT("ListingId") DO UPDATE SET "title" = $2, "description" = $3, "imageUrl" = $4;`, [ListingId, title, description, imageUrl, sellerAddress]);
    return true;
}

export async function setListingTitle(ListingId: bigint, title: string): Promise<boolean> {
    if (ListingId <= 0) return false;
    let resp = await databasePool.query(`UPDATE "Listings" SET "title" = $2 WHERE "ListingId" = $1 RETURNING "ListingId"`, [ListingId, title]);
    return (resp.rowCount == 0) ? false : true;
}

export async function setListingDescription(ListingId: bigint, description: string): Promise<boolean> {
    if (ListingId <= 0) return false;
    let resp = await databasePool.query(`UPDATE "Listings" SET "description" = $2 WHERE "ListingId" = $1 RETURNING "ListingId"`, [ListingId, description]);
    return (resp.rowCount == 0) ? false : true;
}

export async function setListingImageUrl(ListingId: bigint, imageUrl: string): Promise<boolean> {
    if (ListingId <= 0) return false;
    let resp = await databasePool.query(`UPDATE "Listings" SET "imageUrl" = $2 WHERE "ListingId" = $1 RETURNING "ListingId"`, [ListingId, imageUrl]);
    return (resp.rowCount == 0) ? false : true;
}

export async function createTable() {
    await databasePool.query(`CREATE TABLE IF NOT EXISTS "Listings" (
        "ListingId" numeric PRIMARY KEY,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "imageUrl" text NOT NULL,
        "sellerAddress" char(42) NOT NULL
      );`);
    await databasePool.query(`ALTER TABLE "Listings" ADD FOREIGN KEY ("sellerAddress") REFERENCES "Sellers" ("Address") ON DELETE CASCADE;`);
}