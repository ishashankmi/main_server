import { DB_CREDENTIALS } from "../../interface/interface";

export const db_credentials: DB_CREDENTIALS = {
    db_host: process.env.DB_HOST || "127.0.0.1",
    db_port: process.env.DB_PORT || 27017,
    db_name: process.env.DB_NAME,
    db_user: process.env.USER,
    db_pass: process.env.PASSWORD
  };