import express from "express";
import sendResponse from "../utils/response.util";
import verifySignedData from "../utils/verifySignedData.util";
import isValidAddress from "../utils/isValidAddress.util";
import { getAllListings, getListingDetailsFromId, getListingsFromSellerAddress, setListingDetails } from "../services/listings.db.service";
import { blockChainContract } from "../services/contract.service";

const listingsRoute = express.Router();

listingsRoute.get("/", async (_req, res) => {
    const {limit, lastId} = _req.query;
    if (typeof(limit) != "undefined" && (typeof (limit) != "string" || !/^[0-9]+$/.test(limit))) {
        sendResponse(res, 400, "Invalid Limit");
        return;
    }
    if (typeof(limit) != "undefined" && ![10, 25, 50, 100].includes(parseInt(limit))) {
        sendResponse(res, 400, "Invalid Limit");
        return;
    }
    if (typeof(lastId) != "undefined" && (typeof (lastId) != "string" || !/^[0-9]+$/.test(lastId))) {
        sendResponse(res, 400, "Invalid Last Listing ID");
        return;
    }
    let listings = await getAllListings(limit ? parseInt(limit) : undefined, lastId);
    sendResponse(res, 200, listings);
});

listingsRoute.get("/seller/:sellerAddress", async (req, res) => {
    let sellerAddress = req.params.sellerAddress.toLowerCase();
    if (typeof (sellerAddress) != "string" || !isValidAddress(sellerAddress)) {
        sendResponse(res, 400, "Invalid Seller Address");
        return;
    }
    let listings = await getListingsFromSellerAddress(sellerAddress);
    sendResponse(res, 200, listings);
});

listingsRoute.get("/:listingId", async (req, res) => {
    let listingId = req.params.listingId;
    if (typeof (listingId) != "string" || !/^[0-9]+$/.test(listingId)) {
        sendResponse(res, 400, "Invalid Listing ID");
        return;
    }
    let listing = await getListingDetailsFromId(BigInt(listingId));
    if (listing) {
        sendResponse(res, 200, listing);
    } else {
        sendResponse(res, 404, "No Listing Found");
    }
});

listingsRoute.post("/:listingId", async (req, res) => {
    let listingId = req.params.listingId;
    if (typeof (listingId) != "string" || !/^[0-9]+$/.test(listingId)) {
        sendResponse(res, 400, "Invalid Listing ID");
        return;
    }
    const { title, description, imageUrl, signature, timestamp, address } = req.body;
    if (typeof (title) != "string" || typeof (description) != "string" || typeof (imageUrl) != "string" || typeof (signature) != "string" || typeof (timestamp) != "number" || typeof (address) != "string") {
        sendResponse(res, 400, "Invalid Body");
        return;
    }
    if (!isValidAddress(address)) {
        sendResponse(res, 400, "Invalid Address");
        return;
    }
    const isValidOrError: true | string = verifySignedData(address, JSON.stringify({ title, description, imageUrl, listingId }, ["listingId","title","description","imageUrl"]), timestamp, signature);
    if (isValidOrError !== true) {
        sendResponse(res, 400, isValidOrError);
        return;
    }
    try {
        let listingInfo = await blockChainContract.getListingInfo(listingId);
        console.log(listingInfo);
        if (listingInfo[2].toLowerCase() !== address.toLowerCase()) {
            sendResponse(res, 400, "Address Does Not Own Listing");
            return;
        }
    } catch (err:any) {
        if (err?.code === 'CALL_EXCEPTION' && err?.reason === 'Listing does not exist') {
            sendResponse(res, 404, "Listing Does Not Exist in the Blockchain");
            return;
        }
        console.log(err);
        sendResponse(res, 500, "Blockchain Error");
        return;
    }
    let success = await setListingDetails(BigInt(listingId), title, description, imageUrl, address.toLowerCase());
    if (success) {
        sendResponse(res, 200);
    } else {
        sendResponse(res, 500);
    }
});

export default listingsRoute;