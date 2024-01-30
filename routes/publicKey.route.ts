import express from "express";
import sendResponse from "../utils/response.util";
import { setPublicKey, getPublicKeyFromAddress } from "../services/sellers.db.service";
import isValidAddress from "../utils/isValidAddress.util";
import verifySignedData from "../utils/verifySignedData.util";

const publicKeyRoute = express.Router();

publicKeyRoute.get("/", (_req, res) => {
    sendResponse(res, 200);
});

publicKeyRoute.get("/:address", async (req, res) => {
    let address = req.params.address;
    if (!isValidAddress(address)) {
        sendResponse(res, 400, "Invalid Address");
        return;
    }
    let publicKey = await getPublicKeyFromAddress(address);
    if (publicKey) {
        sendResponse(res, 200, publicKey);
    } else {
        sendResponse(res, 404, "No Public Key Found");
    }
})

publicKeyRoute.post("/:address", async (req, res) => {
    let address = req.params.address;
    if (!isValidAddress(address)) {
        sendResponse(res, 400, "Invalid Address");
        return;
    }
    let {publicKey, signature, timestamp} = req.body;
    if (typeof(publicKey) != "string" || typeof(signature) != "string" || typeof(timestamp) != "number") {
        sendResponse(res, 400, "Invalid Body");
        return;
    }
    const isValidOrError: true | string = verifySignedData(address, publicKey, timestamp, signature);
    if (isValidOrError !== true) {
        sendResponse(res, 400, isValidOrError);
        return;
    }
    let success = await setPublicKey(address, publicKey);
    if (success) {
        sendResponse(res, 200);
    } else {
        sendResponse(res, 500);
    }
});

export default publicKeyRoute;