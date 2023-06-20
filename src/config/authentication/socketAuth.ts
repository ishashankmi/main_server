import { throwError } from "../../../utils/error";
import { USER_ERRORS } from "../enums";
import { CacheUtil } from "../../services/redis";
import Encryption from "../../../utils/encryption";
import { asyncHandler } from "../../../utils/handlers/asyncHandler";

export async function SocketAuth(key: string, token: string) {
  try {
    
    if ( !token || !key ) throwError(USER_ERRORS.INVALID_TOKEN);

    const cache_data = await CacheUtil.getCache(key);
    if ( !cache_data ) throwError(USER_ERRORS.INVALID_TOKEN);

    let [decypt, error] = await asyncHandler(Encryption.decrypt(token));

    decypt = JSON.parse(decypt);

    if ( !decypt || error != null ) throwError(USER_ERRORS.UNAUTHORIZED_ACCESS);

    const mdHash: string = decypt.tk;

    if (mdHash != cache_data) throwError(USER_ERRORS.INVALID_TOKEN);

    return {
      decypt,
      auth_user: true,
    };
    
  } catch (error: any) {
    return false;
  }
}
