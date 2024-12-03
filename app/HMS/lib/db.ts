import mysql from 'mysql2/promise'
import { unstable_noStore as noStore } from "next/cache";

let connectionParams = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: "proj_hms",
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

export const pool = mysql.createPool(connectionParams);
export { noStore };
