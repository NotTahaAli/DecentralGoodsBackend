import { QueryResult } from "pg";
import isValidAddress from "../utils/isValidAddress.util";
import databasePool from "./db.service";

export type Order = {
    orderId: string,
    listingId: string,
    buyerAddress: string,
    buyerInfo: string
}

export async function getAllOrders(limit = 100, endingPoint: string | undefined = undefined): Promise<Order[]> {
    let resp : QueryResult<Order>;
    if (endingPoint == undefined) {
        resp = await databasePool.query<Order>(`SELECT *, encode("buyerInfo", 'hex') as "buyerInfo" FROM "Orders" WHERE "orderId" < $2 ORDER BY "orderId" DESC LIMIT $1`, [limit, endingPoint]);
    } else {
        resp = await databasePool.query<Order>(`SELECT *, encode("buyerInfo", 'hex') as "buyerInfo" FROM "Orders" WHERE "orderId" < $2 ORDER BY "orderId" DESC LIMIT $1`, [limit, endingPoint]);
    }
    return resp.rows;
}

export async function getOrdersFromBuyerAddress(buyerAddress: string): Promise<Order[]> {
    if (!isValidAddress(buyerAddress)) return [];
    let resp = await databasePool.query<Order>(`SELECT *, encode("buyerInfo", 'hex') as "buyerInfo" FROM "Orders" WHERE "buyerAddress" = $1`, [buyerAddress]);
    return resp.rows;
}

export async function getOrdersFromListingId(listingId: bigint): Promise<Order[]> {
    if (listingId <= 0) return [];
    let resp = await databasePool.query<Order>(`SELECT *, encode("buyerInfo", 'hex') as "buyerInfo" FROM "Orders" WHERE "listingId" = $1`, [listingId]);
    return resp.rows;
}

export async function getOrdersFromSellerAddress(sellerAddress: string): Promise<Order[]> {
    if (!isValidAddress(sellerAddress)) return [];
    let resp = await databasePool.query<Order>(`SELECT "Orders".*, encode("buyerInfo", 'hex') as "buyerInfo" FROM "Orders", "Listings" WHERE "Orders"."listingId" = "Listings"."ListingId" AND "sellerAddress" = $1`, [sellerAddress]);
    return resp.rows;
}

export async function getOrderDetailsFromId(orderId: bigint): Promise<false | Order> {
    if (orderId <= 0) return false;
    let resp = await databasePool.query<Order>(`SELECT *, encode("buyerInfo", 'hex') as "buyerInfo" FROM "Orders" WHERE "orderId" = $1`, [orderId]);
    if (resp.rowCount == 0) return false;
    return resp.rows[0];
}

export async function setOrderDetails(orderId: bigint, listingId: bigint, buyerAddress: string, buyerInfo: string) : Promise<boolean> {
    if (orderId <= 0) return false;
    if (listingId <= 0) return false;
    if (!isValidAddress(buyerAddress)) return false;
    await databasePool.query(`INSERT INTO "Orders"("orderId", "listingId", "buyerAddress", "buyerInfo") VALUES($1, $2, $3, decode($4, 'hex'));`, [orderId, listingId, buyerAddress, buyerInfo]);
    return true;
}

export async function createTable() {
    await databasePool.query(`CREATE TABLE IF NOT EXISTS "Orders" (
        "orderId" numeric PRIMARY KEY,
        "listingId" numeric NOT NULL,
        "buyerAddress" char(42) NOT NULL,
        "buyerInfo" bytea NOT NULL
      );`);
    await databasePool.query(`ALTER TABLE "Orders" ADD FOREIGN KEY ("listingId") REFERENCES "Listings" ("ListingId") ON DELETE CASCADE;`);
}