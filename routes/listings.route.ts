import express from "express";
import sendResponse from "../utils/response.util";
import verifySignedData from "../utils/verifySignedData.util";
import isValidAddress from "../utils/isValidAddress.util";
import { getListingDetailsFromId, setListingDetails } from "../services/listings.db.service";

const listingsRoute = express.Router();

listingsRoute.get("/", (_req, res) => {
    sendResponse(res, 200);
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
    let { title, description, imageUrl, signature, timestamp, address } = req.body;
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
    // TODO: Verify If Listing Exists and Is Owned By Address on the Blockchain Contract
    let success = await setListingDetails(BigInt(listingId), title, description, imageUrl);
    if (success) {
        sendResponse(res, 200);
    } else {
        sendResponse(res, 500);
    }
});

export default listingsRoute;