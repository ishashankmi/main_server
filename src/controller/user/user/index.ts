
require("dotenv").config();
import { Request, Response } from "express";
import { User } from "../../../models";
import { UserProfile } from "../../../models";
import { asyncHandler } from "../../../../utils/handlers";
import { responseHandler } from "../../../../utils/handlers";
import is_empty_object from "../../../../utils/checkEmpty";
import { generateRandomWord } from "../../../../utils/randomText";
import { Error } from "mongoose";
import { REQUEST_ERROR, STATUS_CODE, USER_ERRORS, USER_SUCCESS } from "../../../config/enums";
import { UserJoin } from "../../../models";
import { verifyIdToken } from "../../../services/firebase";
import { getToken } from "../../../../utils/getToken";
import mongoose from "mongoose";
import { throwError } from "../../../../utils/error";
import Encryption from "../../../../utils/encryption";

class Main {
  // REGISTER USER

  public async addUser(req: Request, resp: Response): Promise<any> {
    let { email, ign, tag_line, password, username, phone } = req.body;

    let has_error: boolean = false;

    let data: any = [];
    let msg,
      error: string = "";

    let replica_available = process.env.DB_REPLICA_SET;

    try {
      if (is_empty_object({ email, ign, tag_line, password }))
        throwError(REQUEST_ERROR.INVALID_PARAMETERS);

      [data, error] = await asyncHandler(
        User.find({
          email: email,
        })
      );

      if (error || data.length) throwError(USER_ERRORS.EMAIL_ALREADY_EXIST);

      password = await Encryption.hashPassword(password);

      [data, error] = await asyncHandler(
        User.create({
          email,
          password,
          phone,
        })
      );

      if (error) throwError(USER_ERRORS.SOMETHING_WENT_WRONG);

      ign.replace(/[^\w\s]+/g, "").replace(/_/g, " ");
      tag_line.replace(/[^\w\s]+/g, "").replace(/_/g, " ");

      ign = ign.trim();
      tag_line = tag_line.trim();

      let username: string = ign + "_" + tag_line;

      username = username.replace(/\s/g, "_");

      [data, error] = await asyncHandler(
        UserProfile.create({
          _id: data._id,
          ign,
          tag_line,
          username,
        })
      );

      if (error) {
        throwError(USER_ERRORS.FAILED_TO_CREATE);
      }

      msg = USER_SUCCESS.REGISTER_SUCCESS;
    } catch (error: any) {
      let error_msg: string = error.message;
      if (error_msg == USER_ERRORS.FAILED_TO_CREATE) {
        console.log(data);
        await User.deleteOne({
          email: email,
        });
      }

      has_error = true;
      msg = error_msg;
    }

    return responseHandler({
      resp,
      status_code: has_error ? 400 : 200,
      success: has_error ? false : USER_SUCCESS.SUCCESS_OK,
      data: has_error ? [] : data,
      msg,
    });
  }

  // LOGIN CONTROLLER
  public async login(req: Request, resp: Response): Promise<any> {

    let { user, password } = req.body;
    let has_error: boolean = false;

    let data = [];
    let msg,
      error: string = "";

    try {
      if (is_empty_object({ user, password })) {
        has_error = true;
      } else {
        [data, error] = await asyncHandler(
          User.aggregate([
            {
              $lookup: {
                from: "userprofiles",
                localField: "_id",
                foreignField: "_id",
                as: "profile",
              },
            },
            {
              $match: {
                $or: [
                  { email: user },
                  { phone: user },
                  { "profile.username": user },
                ],
              },
            },
            {
              $project: {
                email: 0,
                phone: 0,
                created_at: 0,
                modifiled_at: 0,
                __v: 0,
                "profile.id": 0,
                "profile._id": 0,
                "profile.created_at": 0,
                "profile.modified_at": 0,
                "profile.__v": 0,
              },
            },
          ])
        );
        if (error != null) {
          has_error = true;
        }
      }

      if (data != undefined && data.length > 0) {
        data = data[0];

        // COMPARE PASSWORD WITH STORED HASH IN DATABASE
        let user_password: string = data.password;
        let [is_match] = await asyncHandler(
          Encryption.comparePassword(password, user_password)
        );

        if (is_match) {
          let email_verified: String = data.email_verified;
          let is_banned: String = data.is_banned;
          let is_account_deactive: String = data.is_account_deactive;

          // ACCOUNT RELATED ERRORS
          if (is_banned) {
            has_error = true;
            msg = USER_ERRORS.ACCOUNT_BANNED;
          } else if (email_verified) {
            has_error = true;
            msg = USER_ERRORS.EMAIL_UNVERIFIED;
          } else if (is_account_deactive) {
            has_error = true;
            msg = USER_ERRORS.ACCOUNT_DEACTIVE;
          } else {
            // IF MATCH THEN DELETE PASSWORD COLUMN
            delete data.password;
            data = await getToken(data, data.profile[0].username);
          }
        } else {
          has_error = true;
          data = [];
        }
      } else {
        has_error = true;
      }
    } catch (error: any) {
      has_error = true;
      console.error(error.message);
    }

    return responseHandler({
      resp,
      status_code: has_error ? 400 : 200,
      success: has_error ? false : USER_SUCCESS.SUCCESS_OK,
      data: has_error ? [] : [data],
      msg: has_error
        ? USER_ERRORS.INVALID_CREDENTIALS
        : USER_SUCCESS.LOGIN_SUCCESS,
    });
  }

  // GET USER DETAILS

  public async getById(req: Request, resp: Response): Promise<any> {
    let { id } = req.params;
    let { user_id, user_logged_in } = req?.body?.custom;

    console.error('is user logged in ===>', user_logged_in);
    /* 

      ADD THESE FEATURES 
        - IF AUTH USER THEN SEND IS OWNER FIELD TRUE

    */

    let data: any = [];
    let error, msg: string = '';
    let has_error: boolean = false;
    let status_code: number = STATUS_CODE.SUCCESS;
    let has_joined, has_joined_err : string = '';

    try{

      [data, error] = await asyncHandler(
        UserProfile.findOne({
          $or: [
            { _id: id },
            { username: id },
          ]
        }, { created_at: 0, modified_at: 0, __v: 0}).lean()
      )

      data = data == null ? [] : [data];
      
      if( !data.length || error != null) throwError(USER_ERRORS.USER_NOT_EXIST);
      [data] = data;

      if(user_logged_in && id != user_id){
        const salt: any = process.env.JOIN_GROUP_SALT;
        let group_hash: string = user_id+'_'+id+'_'+salt;
        group_hash = Encryption.convertMd5(group_hash);

        [has_joined, has_joined_err] = await asyncHandler(
          UserJoin.findOne(
            {
              group_id: group_hash
            },
            {
              status: 1,
              _id : 0
            }
          ).lean()
        )

        has_joined = has_joined == null || has_joined_err != null ? 0: has_joined;
        data[0].join_status = has_joined;
      
      };
      
      msg = USER_SUCCESS.USER_FOUND;
      
    }catch(error:any){
      let error_msg = error.message;
      if(error_msg == USER_ERRORS.USER_NOT_EXIST){
        status_code = STATUS_CODE.NOT_FOUND
      }else{
        status_code = STATUS_CODE.BAD_REQUEST;
      }
      msg = error_msg;
      has_error = true;
      data = [];
    }
    
    responseHandler({
      resp,
      status_code,
      data,
      msg: msg,
      success: has_error ? USER_ERRORS.SUCCESS_FALSE : USER_SUCCESS.SUCCESS_OK
    })
   
  }

  public async putById(req: Request, resp: Response): Promise<any> {
    resp.json({ success: USER_SUCCESS.SUCCESS_OK });
  }

  // CALLBACK FOR GOOGLE SIGNUP
  public async googleAuth(req: Request, resp: Response): Promise<any> {

    let data: any = [];
    let msg: string = "";
    let email : string = '';
    let success: string | boolean = 'ok';
    let status_code: number = 201;

    try {
        const { authorization } = req.headers;
        if (!authorization) throw new Error(USER_ERRORS.INVALID_TOKEN);

        const [_, token] = authorization.split(" ");

        let [decodedUser, error] = await asyncHandler(verifyIdToken(token));

        if (error) throw new Error(USER_ERRORS.INVALID_TOKEN);

        let { name, email_verified, picture } = decodedUser;

        email = (decodedUser.email).toLowerCase();

        if (!email_verified) throw new Error(USER_ERRORS.EMAIL_UNVERIFIED);

        let { username, ign, tag_line }: any = req?.body;

        [data, error] = await asyncHandler(
          User.aggregate([
            {
              $lookup: {
                from: "userprofiles",
                localField: "_id",
                foreignField: "_id",
                as: "profile",
              },
            },
            {
              $match: {
                email: email,
                email_verified: true
              }
            },
            {
              $project: {
                email: 0,
                phone: 0,
                created_at: 0,
                modifiled_at: 0,
                __v: 0,
                "profile.created_at": 0,
                "profile.modified_at": 0,
                "profile.__v": 0,
              },
            },
          ])
        );

        data = data == null || error != null ? [] : data;
        
        if( !data.length ){

          if( !data.name && ( !ign || !tag_line) ) throwError(USER_ERRORS.IGN_TAGLINE_REQUIRED);
          
          ign = !ign ? name.replace(/[^\w\s]+/g, "").replace(/_/g, " ").trim() : ign;
          tag_line = !tag_line ? generateRandomWord(5) : tag_line;

          username = !username ? ign+'_'+tag_line+'_'+generateRandomWord(5) : username;
          
          /*
            ----------- ALSO SEND PASSWORD TO REGISTERED EMAIL AFTER SUCCESS LOGIN INCASE REQUIRED ---------
          */
          let password: string = await Encryption.hashPassword(generateRandomWord(10));
          // auto-fill
               
          [data, error] = await asyncHandler(
            User.create({
              email: email,
              password,
              email_verified: true,
            })
          );

          if(data == null || error != null) throwError(USER_ERRORS.FAILED_TO_CREATE);

          [data, error] = await asyncHandler(
            UserProfile.create({
              _id: data._id,
              ign,
              tag_line,
              username,
              profile_image_url: picture,
              is_online: true, 
            })
          );

          if(data == null || error != null ) {
            await User.deleteOne({
              _id: data._id
            }).lean();

            await UserProfile.deleteOne({
              _id: data._id
            }).lean();

            if(data == null || error != null) throwError(USER_ERRORS.FAILED_TO_CREATE);
          };

          data = data.toObject();
          data = await getToken(data);
          
          msg = USER_SUCCESS.REGISTER_SUCCESS;

        }else{

          [data] = data;
          [data] = data.profile;
          data = await getToken(data);
          msg = USER_SUCCESS.LOGIN_SUCCESS;
          status_code = STATUS_CODE.SUCCESS;
        }
        
    }catch(error: any){
      let error_message: any = error.message;
      console.log(error_message);
      msg = error_message;
      data = [];
      success = false;
      status_code = STATUS_CODE.FORBIDDEN;
      if(![USER_ERRORS.FAILED_TO_CREATE, USER_ERRORS.FAILED_TO_CREATE].includes(error_message)){
        status_code = STATUS_CODE.SERVER_ERROR;
        msg = USER_ERRORS.SOMETHING_WENT_WRONG;
      }
    };
      
    return responseHandler({
      resp,
      status_code,
      success,
      data,
      msg,
    });
  };

  public async getOnlineUsers(req: Request, resp: Response): Promise<any> {

    let data: any = [];
    let error, msg: string = '';
    let status_code: number = STATUS_CODE.SUCCESS;
    let success: string | boolean = 'ok';

    try{

      let { user_id } = req?.body?.custom;
      
      let user_object_id = new mongoose.Types.ObjectId(user_id);

      [data, error] = await asyncHandler(

        UserProfile.aggregate([
          {
            $lookup: {
              from: 'userjoins',
              localField: '_id',
              foreignField: 'joiner_id',
              as: 'joinData'
            }
          },
          {
            $match: {
              'joinData.target_id': user_object_id,
              'joinData.status': 2,
              is_online: true
            }
          },
          {
            $project: {
              _id: 1,
              ign: 1,
              tag_line: 1,
              is_online: 1,
              username: 1,
              profile_image_url: 1
            }
          }
        ])
      );
        
      
      if( !data.length || error != null ) throwError(USER_ERRORS.NO_USER_ONLINE);

      status_code = STATUS_CODE.SUCCESS;
      msg = USER_SUCCESS.ONLINE_USERS

    }catch(error: any){

      const error_message: any = error.message;
      data = [];
      msg = error_message;
      success = false;
      
      if( ![USER_ERRORS.NO_USER_ONLINE].includes(error_message) ){
        status_code = STATUS_CODE.SERVER_ERROR;
        msg = USER_ERRORS.SOMETHING_WENT_WRONG;
      }
    }

    return responseHandler({
      resp,
      data,
      msg,
      status_code,
      success
    })

  }

}

const user = new Main();

export { user as UserController };
