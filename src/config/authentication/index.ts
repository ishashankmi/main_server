/*
  THIS IS AS AN AUTHENTICATION MIDDLEWARE AND CHECKS IF TOKEN IS VALID OR NOT 
  ALSO CHECKS IF WANT FORWARD REQUEST OR NOT
*/
import { Request, Response, NextFunction } from "express";
import Encryption from "../../../utils/encryption";
import { asyncHandler } from "../../../utils/handlers/asyncHandler";
import { CacheUtil } from "../../services/redis";
import { responseHandler } from "../../../utils/handlers/responseHandler";
import { STATUS_CODE, USER_ERRORS } from "../enums";
import { throwError } from "../../../utils/error";

export function AutheticateUser( token_required : boolean ): any {
  return async function(
    req: Request,
    resp: Response,
    next: NextFunction
  ): Promise<boolean | void> {

    //const method: string = req.method;
    //let key: string = method == 'GET' ? req?.headers?.key : req?.body?.key;
    
    let key: string | undefined = req?.headers?.key as string ?? '';

    let decypt: any = undefined; 
    let error: string = '';
    let user_logged_in : boolean = false;
    let status_code = 200;
    
    try{

      let token: string = (req.headers.authorization)?.split(' ')[1] || '';
      
      if( !token || !key ){

        if( !token_required ){  
          req.body.custom = {
            user_id: null,
            user_logged_in
          }
          next();
          return;
        }
        throwError(USER_ERRORS.INVALID_TOKEN);
      };

      
      const cache_data = await CacheUtil.getCache(key);

      if( !token_required && cache_data == null ){
        req.body.custom = {
          user_id: null,
          user_logged_in
        }
        next();
        return;
      }

      if( !cache_data ) throwError(USER_ERRORS.UNAUTHORIZED_ACCESS);

      [decypt, error] = await asyncHandler(
          Encryption.decrypt(token)
      );
  
      decypt = JSON.parse(decypt);

      if(!decypt || error != null) throwError(USER_ERRORS.UNAUTHORIZED_ACCESS);

      const mdHash: string = decypt.tk;

      if( mdHash != cache_data ) throwError(USER_ERRORS.INVALID_TOKEN);

      user_logged_in = true;

    }catch(error:any){

      let error_message: any = error.message;
      status_code = STATUS_CODE.UNAUTHRIZED;

      if( error_message == USER_ERRORS.INVALID_TOKEN ) status_code = STATUS_CODE.FORBIDDEN;

      if( ![USER_ERRORS.UNAUTHORIZED_ACCESS, USER_ERRORS.INVALID_TOKEN].includes(error_message) ){
        error_message = USER_ERRORS.SOMETHING_WENT_WRONG;
        status_code = STATUS_CODE.SERVER_ERROR;
      }

      return responseHandler({
        resp,
        status_code,
        msg: error_message,
        success: USER_ERRORS.SUCCESS_FALSE,
        data:[]
      })

    }

    req.body.custom = {
      user_id : decypt == undefined ? null : decypt?.id,
      username: decypt == undefined ? null : decypt?.un,
      user_logged_in
    }
    next();
   
  }
}
