require("dotenv").config();
import mongoose from "mongoose";
import { db_credentials } from "../../config/dbConfig";
import { ConsoleTextColor } from "../../../utils";
const pro_db_url = process.env.PRO_DB_URL;
const environment = process.env.ENV;


if (pro_db_url != undefined && environment != "DEVELOPMENT") {
  mongoose
    .connect(pro_db_url, {
      dbName: "NoiceServer",
      maxPoolSize: 10,
    })
    .then((e) => {
      console.log("[!] Production Database Connected\n");
    })
    .catch((e) => {
      console.log(ConsoleTextColor.fg.red+"[x] Production Database Error: Failed To Connect,", e.message + ConsoleTextColor.reset);
    });
} else {
  mongoose
    .connect(`mongodb://${db_credentials.db_host}:${db_credentials.db_port}`, {
      dbName: db_credentials.db_name,
      maxPoolSize: 100,
      // user: db_credentials.db_user || "",
      // pass: db_credentials.db_pass || ""
    })
    .then((e) => {
      console.log("[!] Database Connected");
    })
    .catch((e) => {
      console.log(ConsoleTextColor.fg.red+"[x] Database Error: Failed To Connect,", e.message + ConsoleTextColor.reset);
    });
}

export { mongoose as db };
