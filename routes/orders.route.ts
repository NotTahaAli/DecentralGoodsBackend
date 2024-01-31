import express from "express";
import sendResponse from "../utils/response.util";
import verifySignedData from "../utils/verifySignedData.util";
import isValidAddress from "../utils/isValidAddress.util";
import { blockChainContract } from "../services/contract.service";
import { getAllOrders, getOrderDetailsFromId, getOrdersFromBuyerAddress, getOrdersFromSellerAddress, setOrderDetails } from "../services/orders.db.service";

const ordersRoute = express.Router();

ordersRoute.get("/", async (_req, res) => {
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
        sendResponse(res, 400, "Invalid Last Order ID");
        return;
    }
    let listings = await getAllOrders(limit ? parseInt(limit) : undefined, lastId);
    sendResponse(res, 200, listings);
});

ordersRoute.get("/seller/:sellerAddress", async (req, res) => {
    let sellerAddress = req.params.sellerAddress;
    if (typeof (sellerAddress) != "string" || !isValidAddress(sellerAddress)) {
        sendResponse(res, 400, "Invalid Seller Address");
        return;
    }
    let listings = await getOrdersFromSellerAddress(sellerAddress);
    sendResponse(res, 200, listings);
});

ordersRoute.get("/buyer/:buyerAddress", async (req, res) => {
    let buyerAddress = req.params.buyerAddress;
    if (typeof (buyerAddress) != "string" || !isValidAddress(buyerAddress)) {
        sendResponse(res, 400, "Invalid Buyer Address");
        return;
    }
    let listings = await getOrdersFromBuyerAddress(buyerAddress);
    sendResponse(res, 200, listings);
});


ordersRoute.get("/:orderId", async (req, res) => {
    let orderId = req.params.orderId;
    if (typeof (orderId) != "string" || !/^[0-9]+$/.test(orderId)) {
        sendResponse(res, 400, "Invalid Order ID");
        return;
    }
    let listing = await getOrderDetailsFromId(BigInt(orderId));
    if (listing) {
        sendResponse(res, 200, listing);
    } else {
        sendResponse(res, 404, "No Order Found");
    }
});

ordersRoute.post("/:orderId", async (req, res) => {
    let orderId = req.params.orderId;
    if (typeof (orderId) != "string" || !/^[0-9]+$/.test(orderId)) {
        sendResponse(res, 400, "Invalid Order ID");
        return;
    }
    const { buyerInfo, signature, timestamp, address } = req.body;
    if (typeof(buyerInfo) != "string" || typeof (signature) != "string" || typeof (timestamp) != "number" || typeof (address) != "string") {
        sendResponse(res, 400, "Invalid Body");
        return;
    }
    if (!isValidAddress(address)) {
        sendResponse(res, 400, "Invalid Address");
        return;
    }
    const isValidOrError: true | string = verifySignedData(address, JSON.stringify({ buyerInfo, orderId }, ["orderId", "buyerInfo"]), timestamp, signature);
    if (isValidOrError !== true) {
        sendResponse(res, 400, isValidOrError);
        return;
    }
    if (await getOrderDetailsFromId(BigInt(orderId)) !== false) {
        sendResponse(res, 400, "Order Info Already Exists");
        return;
    }
    let ListingId = "0";
    try {
        let orderInfo = await blockChainContract.getOrderInfo(orderId);
        console.log(orderInfo);
        if (orderInfo[4].toLowerCase() !== address.toLowerCase()) {
            sendResponse(res, 400, "Address Does Not Own Order");
            return;
        }
        ListingId = orderInfo[2];
    } catch (err:any) {
        if (err?.code === 'CALL_EXCEPTION' && err?.reason === 'Order does not exist') {
            sendResponse(res, 404, "Order Does Not Exist in the Blockchain");
            return;
        }
        console.log(err);
        sendResponse(res, 500, "Blockchain Error");
        return;
    }
    let success = await setOrderDetails(BigInt(orderId), BigInt(ListingId), address.toLowerCase(), buyerInfo);
    if (success) {
        sendResponse(res, 200);
    } else {
        sendResponse(res, 500);
    }
});

export default ordersRoute;