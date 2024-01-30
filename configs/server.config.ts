import {config} from "dotenv";
config();

export const httpPort: number = parseInt(process.env.HTTP_PORT || "80");
export const httpsPort: number | undefined = (process.env.HTTPS_PORT != undefined) ? parseInt(process.env.HTTPS_PORT) : undefined;

export const corsURLS: Array<string> = (process.env.CORS_URLS) ? process.env.CORS_URLS.split(" ") : [];
corsURLS.push("http://localhost:"+httpPort);
if (httpsPort) corsURLS.push("https://localhost:"+httpsPort);

export default {
    httpPort,
    httpsPort,
    corsURLS
}