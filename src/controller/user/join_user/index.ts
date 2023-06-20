import { UserJoin, UserJoinedGroup, UserProfile } from "../../../models/user";
import { Request, Response } from "express";
import is_empty_object from "../../../../utils/checkEmpty";
import Encryption from "../../../../utils/encryption";
import { asyncHandler } from "../../../../utils/handlers/asyncHandler";
require('dotenv').config();
import { responseHandler } from "../../../../utils/handlers/responseHandler";
import { JOIN_REQUEST, REQUEST_ERROR, SOCKET_DATA_TYPE, SOCKET_MESSAGE, STATUS_CODE, USER_ERRORS, USER_JOIN_ENUMS, USER_SUCCESS } from "../../../config/enums";
import { User } from "../../../models/user";
import { throwError } from "../../../../utils/error";
import { SocketController } from "../..";
import { SOCKET_DATA } from "../../../interface";

class Main {

    /* 
        JOIN USERS WITH EACH OTHER 
    */

    public async addUserJoin(req: Request, resp: Response): Promise<any>{

        /* 
            POST SCENARIOS TO TACKLE
            - CHECK IF TARGET_ID EXISTS OR NOT
            - PREVENT USER FROM SWITCHING THE JOINER_ID 
            - CHECK IF USER AUTHORIZED TO JOIN THE JOINER
            
            ADD TRANSACTIONS AND ROLLBACK FEATURE

        */
       
        let data: any = [];
        let msg, error: string;
        let has_error: boolean = false;
        let group_hash: string = '';

        try{
            
            const { user_id } = req?.body?.custom;
            const { target_id, message } = req?.body;
            
            if(!target_id || user_id == target_id) throwError(USER_JOIN_ENUMS.INVALID_PARAMETERS);

                [data, error] = await asyncHandler(
                    User.findById(target_id).lean()
                );

                if(data == null || error != null) throwError(USER_JOIN_ENUMS.INVALID_JOIN);

                const salt: any = process.env.JOIN_GROUP_SALT;
                group_hash = await Encryption.getGroupHash(user_id, target_id);

                [data, error] = await asyncHandler(
                    UserJoinedGroup.findOne({
                        group_id: group_hash
                    }).lean()
                );

                data = data == null ? [] : [data];    
                
                if(data.length  || error != null) throwError(USER_JOIN_ENUMS.PROCESS_FAILED);
                
                // CREATE USER JOIN HASH AND ADD IT TO USERJOINEDGROUP TABLE

                [data, error] = await asyncHandler(
                    UserJoinedGroup.create({
                        group_id: group_hash,
                    })
                );

                if(error) throwError(USER_JOIN_ENUMS.PROCESS_FAILED);

                // CREATE USER JOIN MAIN WHERE JOINER AND TARGET ID DEFINED
                [data, error] = await asyncHandler(
                    UserJoin.create({
                        group_id: group_hash,
                        joiner_id: user_id,
                        target_id,
                        status: 1
                    })
                );

                if(error || data == null) throwError(USER_JOIN_ENUMS.FAILED);


                [data, error] = await asyncHandler(
                    UserProfile.updateOne({
                        _id : target_id
                    },
                    { $inc: { joined_users_count: 1 } }
                    )
                )

                if(error || data == null) throwError(USER_JOIN_ENUMS.FILED_TO_UPDATE);

                msg = USER_JOIN_ENUMS.SUCCESS;

        }catch(error: any){
            
            let error_message: string = error.message;
            
            if(error_message == USER_JOIN_ENUMS.FAILED){
                await UserJoinedGroup.deleteOne({
                    group_id: group_hash
                });
            }

            if(error_message == USER_JOIN_ENUMS.FILED_TO_UPDATE){
                await UserJoinedGroup.deleteOne({
                    group_id: group_hash
                });

                await UserJoin.deleteOne({
                    group_id: group_hash
                })
            }

            has_error = true;
            msg = error_message == '' ? USER_ERRORS.SOMETHING_WENT_WRONG : error_message;

        }

        return responseHandler({
            resp,
            status_code: has_error ? 400 : 201,
            success: has_error ? false : USER_SUCCESS.SUCCESS_OK,
            data: has_error ? [] : data,
            msg
        });

    };

    /*
        GET JOIN PENDING LIST OF USERS
    */
    public async pendinglist(req: Request, resp: Response): Promise<any>{
        
        const { user_id } = req.body.custom;

        let data: any = [];
        let error, msg: string = '';
        let has_error : boolean = false;
        let joined_user_count: number = 0;
        let status_code : number = 200;

        try{

            [data, error] = await asyncHandler(
                UserJoin.find({
                    target_id: user_id,
                    status: 1
                })
            );


            
            data = data == null || error != null ? [] : data;
            
            if( !data.length ) throwError(JOIN_REQUEST.NO_PENDING_JOIN);
           
            const joinerIds = data.map((doc: any) => doc.joiner_id);

            joined_user_count = joinerIds.length;

            [data, error] = await asyncHandler(
                UserProfile.find({
                    _id: { $in: joinerIds },
                }, {  ign: 1, tag_line: 1}).lean()
            )

            data = data == null || error != null ? [] : data;

            if( !data.length ) throwError(JOIN_REQUEST.NO_PENDING_JOIN);

            data = [data];
            data.push({pending_users_count: joined_user_count});

            msg = USER_SUCCESS.PENDING_USERS_LIST;
        
        }catch(error: any){
            let error_message: string = error.message;
            has_error = true;
            msg = error_message == '' ? USER_ERRORS.SOMETHING_WENT_WRONG : error_message;
        }
        
        responseHandler({
            resp,
            status_code,
            data,
            msg,
            success : has_error ? USER_ERRORS.SUCCESS_FALSE : USER_SUCCESS.SUCCESS_OK
        })

    }

    /*
        ACCEPT PENDING REQUEST
    */

    public async updateById(req: Request, resp: Response): Promise<any>{


        let data: any = [];
        let msg, error : string = '';
        let has_error: boolean = false;
        let status_code: number = 201;
        let success : string | boolean = 'ok';

        try{

            const { user_id } = req.body.custom;
            const { joiner_id } = req.body;

            if( !joiner_id ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);

            [data, error] = await asyncHandler(
                UserProfile.findOne({
                    _id: joiner_id,
                }, { ign: 1, tag_line: 1, profile_image_url: 1, username: 1})
            );

            data = data == null || error != null ? [] : [data];

            if ( !data.length ) throwError(USER_ERRORS.USER_NOT_EXIST);
            [data] = data;
            
            const group_hash: string = await Encryption.getGroupHash(joiner_id, user_id);
            const user_info = { gamer_name: data.ign +'#'+ data.tag_line, username: data.username, profile_img_url: data.profile_image_url};

            [data, error] = await asyncHandler(
                UserJoin.findOneAndUpdate({
                    group_id: group_hash,
                    status: 1
                }, {
                    $set: {
                        status: 2
                    }
                }).lean()
            );

            if(data == null || error != null) throwError(REQUEST_ERROR.INVALID_REQUEST);

            data = [{
               accepted_request : 1
            }];

            let socketPayload: SOCKET_DATA = {
                user_id: joiner_id,
                msg: SOCKET_MESSAGE.JOIN_REQ_ACCEPT,
                by : user_info.gamer_name,
                username: user_info.username,
                profile_img_url: user_info.profile_img_url,
                type: SOCKET_DATA_TYPE.NOTIFICATION
            }

            SocketController.joinReqAcceptSocket(socketPayload);
            msg = JOIN_REQUEST.USER_JOIN_ACCEPTED;

        }catch(error: any){
    
            let error_message: any = error.message;
            msg = error_message;
            has_error = true;
            data = [];
            status_code = STATUS_CODE.BAD_REQUEST;
            success = false;

            if( ![REQUEST_ERROR.INVALID_REQUEST, USER_ERRORS.USER_NOT_EXIST, REQUEST_ERROR.INVALID_PARAMETERS].includes(error_message) ){
                status_code = STATUS_CODE.SERVER_ERROR;
                msg = USER_ERRORS.SOMETHING_WENT_WRONG;
            }

        }

        responseHandler({
            resp,
            data,
            status_code,
            msg,
            success,
        })

    }

    /*
        DELETE PENDING REQUEST
    */

    public async deleteById(req: Request, resp: Response): Promise<any>{

        const { user_id } = req.body.custom;
        const { joiner_id } = req.body;

        let data: any = [];
        let msg, error : string = '';
        let has_error: boolean = false;

        try{

            if( !joiner_id ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);
            let group_hash: string = await Encryption.getGroupHash(joiner_id, user_id);

            [data, error] = await asyncHandler(
                UserJoin.findOneAndUpdate({
                    group_id: group_hash,
                    status: 1
                }, {
                    $set: {
                        status: 3
                    }
                })
            );
            
            if(data == null || error != null) throwError(REQUEST_ERROR.INVALID_REQUEST);

            [data, error] = await asyncHandler(
                UserProfile.updateOne({
                    _id: user_id,
                },{
                    $inc: {
                        joined_users_count : -1
                    }
                })
            );

            data = [{
                request_removed: 1
            }];

            msg = JOIN_REQUEST.USER_JOIN_REJECTED;

        }catch(error: any){
            let error_message: string = error.message;
            msg = error_message == '' ? USER_ERRORS.SOMETHING_WENT_WRONG : error_message;
            has_error = true;      
            data = [];      
        }
        
        responseHandler({
            resp,
            data: data,
            status_code: 200,
            msg,
            success: has_error ? USER_ERRORS.SUCCESS_FALSE : USER_SUCCESS.SUCCESS_OK
        })

    };
    
}

const JoinUserMain = new Main();
export { JoinUserMain as JoinUserController }