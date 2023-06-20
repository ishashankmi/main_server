import { generateRandomText } from "./randomText";
import Encryption from "./encryption";
import { TOKEN_DATA } from "../src/interface/interface";
import { asyncHandler } from "./handlers/asyncHandler";
import { CacheUtil } from "../src/services/redis";

export async function getToken(data: any, username?: string) {

    username = !username ? data.username : username;  

    const md5Hash = Encryption.convertMd5(generateRandomText(32));

    let key: number | string = (
      Math.random() *
      new Date().getTime() *
      100000
    ).toFixed();

    let token_data: TOKEN_DATA | string = {
      id: data._id,
      un: username,
      tk: md5Hash,
      cr: new Date(),
    };

    let [token] = await asyncHandler(
      Encryption.encrypt(JSON.stringify(token_data))
    );

    data["token"] = token;
    data["key"] = key;

    let isCacheSet: boolean = await CacheUtil.setCache(key, md5Hash);
    return data;
    
  }