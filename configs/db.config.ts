import {config} from "dotenv";
config();

if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
    console.log("Database Credentials Not Configured, Exiting Program, Please Configure Database Credentials in .env File.");
    process.exit(1);
}

export const host: string = process.env.DB_HOST || "localhost";
export const port: number = parseInt(process.env.DB_PORT || "5432");
export const user: string = process.env.DB_USER;
export const password: string = process.env.DB_PASSWORD;
export const database: string = process.env.DB_NAME || "backendskeleton";

export default {
    host,
    port,
    user,
    password,
    database
}