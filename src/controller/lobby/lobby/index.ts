require('dotenv').config();
import { Lobby } from "../../../models/lobby";
import { LobbyRequest } from "../../../models/lobby";
import { Request, Response } from "express";
import { asyncHandler } from "../../../../utils/handlers/asyncHandler";
import { throwError } from "../../../../utils/error";
import { responseHandler } from "../../../../utils/handlers/responseHandler";
import { LOBBY_ENUM, REQUEST_ERROR, SOCKET_DATA_TYPE, SOCKET_EVENTS, STATUS_CODE, USER_ERRORS } from "../../../config/enums";
import { SocketEvents } from "../../../services/socket";
import LiveKit from "../../../services/livekit";
import { UserProfile } from "../../../models";
import { SOCKET_DATA } from "../../../interface";

class Main {

    /*  
        ------------------------- GET LOBBY BY ID ------------------------------
    */

    public async getLobbyById(req: Request, resp: Response): Promise<any>{
        
        let data: any = [];
        let msg : any = ''; 
        let error: any = '';
        let status_code: number = STATUS_CODE.SUCCESS;
        let success: string | boolean = 'ok';
        
        try{
            
            let { user_id } = req?.body?.custom;
            let { lobby_id } = req?.params;

            if( !lobby_id ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);

            [data, error] = await asyncHandler(
                Lobby.findOne({
                    _id: lobby_id,
                }, {
                    __v: 0
                }).lean()
            );
            
            data = data == null || error ? [] : [data];
            if( !data.length || error != null ) throwError( LOBBY_ENUM.NOT_FOUND );
            [data] = data;

            if( data.is_expired ) throwError(LOBBY_ENUM.LOBBY_EXPIRED);

            if( data.owner_id != user_id){
                let [ userPermission, userPermissionError] = await asyncHandler(
                    LobbyRequest.findOne({
                        user_id,
                        lobby_id,
                    }).lean()
                );

                /*
                    IF USER DON'T HAVE PERMISSION TO VIEW THE LOBBY THEN DON'T SHOW WHO HAS JOINED THE LOBBY
                    ELSE SHOW HIM SOME FIELS OF THE LOBBY
                */

                if( userPermission != null ){
                    if(userPermission.status == 0){
                        msg = LOBBY_ENUM.JOIN_REQUEST_PENDING;
                        userPermission = null;
                    };

                    if(userPermission.status >= 2){
                        msg = LOBBY_ENUM.CANNOT_JOIN_LOBBY;
                        userPermission = null;
                    }
                }
                
                if( userPermission == null || userPermissionError != null ) {
                    data = [{
                        _id: data._id,
                        icon: data.icon,
                        created_at: data.created_at,
                        for_game: data.for_game,
                        maxCapacity: data.maxCapacity,
                        title: data.title,
                        description: data.description,
                        visibility: data.visibility
                    }];

                    msg = ![LOBBY_ENUM.CANNOT_JOIN_LOBBY, LOBBY_ENUM.JOIN_REQUEST_PENDING].includes(msg) ? LOBBY_ENUM.NEED_PERMISSION_TO_JOIN : msg;
                }else{
                    msg = LOBBY_ENUM.CAN_JOIN_LOBBY;
                }
            }else{

                let [pendingUsers, pendingUsersError] = await asyncHandler(
                    LobbyRequest.find({ lobby_id, status: 0 }, { __v: 0, status: 0, created_at: 0, modified_at: 0, lobby_id:0 })
                    .populate({
                        path: 'user_id',
                        select: 'ign tag_line username -_id',
                    })
                )
                console.log(data);
                data['pending_request'] = pendingUsers;
                msg = LOBBY_ENUM.LOBBY_FOUND;
                
            }


        }catch(error: any){

            const error_message = error.message;
            data = [];
            success = false,
            msg = error_message;
            status_code = STATUS_CODE.FORBIDDEN;

            if(![LOBBY_ENUM.NO_PERMISSION, LOBBY_ENUM.NOT_FOUND, REQUEST_ERROR.INVALID_PARAMETERS, LOBBY_ENUM.LOBBY_EXPIRED].includes(error_message)){
                status_code = STATUS_CODE.SERVER_ERROR;
                msg = USER_ERRORS.SOMETHING_WENT_WRONG;
            }

        }

        return responseHandler({
            resp,
            success,
            data,
            msg,
            status_code
        })

    }

    /*
       ------------------ GET LOBBY LIST OF THE USERS ----------------------
    */

    public async getLobbyList(req: Request, resp: Response): Promise<any>{
        let data: any = [];
        let msg, error: any = '';
        let status_code: number = STATUS_CODE.SUCCESS;
        let success: string | boolean = 'ok';
        try{
            let { user_id } = req?.body?.custom;
            [data, error] = await asyncHandler(
                Lobby.find({
                    owner_id: user_id
                })
                .sort({ created_at: -1 }).lean()
            );

            data = data == null ? [] : data;
            if( error != null ) throwError(USER_ERRORS.SOMETHING_WENT_WRONG);

            msg = LOBBY_ENUM.LIST_SUCCESS;

        }catch(error: any){
            //const error_message: any = error.message;
            msg = USER_ERRORS.SOMETHING_WENT_WRONG;
            status_code = STATUS_CODE.SERVER_ERROR;
            data = [];
            success = false;

            // if(![USER_ERRORS.SOMETHING_WENT_WRONG].includes(error_message)){
            //     msg = USER_ERRORS.SOMETHING_WENT_WRONG;
            //     status_code = STATUS_CODE.SERVER_ERROR;
            // };
        };

        return responseHandler({
            resp,
            success,
            data,
            msg,
            status_code
        })
    }

    /* 
       ---------------------------- ADD LOBBY -----------------------------
    */

    public async addLobby(req: Request, resp: Response): Promise<any>{
        let data: any = [];
        let msg, error: any = '';
        let status_code: number = STATUS_CODE.CREATED;
        let success : boolean | string = 'ok';

        let lobby_expire_time: any = process.env.LOBBY_EXPIRE_TIME || 2;

        try{
            const { user_id, username } = req?.body?.custom;
            const currentTime = new Date();
            const pastTime = new Date(currentTime.getTime() - lobby_expire_time * 60000);

            [data, error] = await asyncHandler(
                Lobby.findOne({
                    owner_id: user_id,
                    created_at: { $gt: pastTime },
                    is_expired: false,
                }).lean()
            );            

            data = data != null || error != null ? [] : [data];
            
            if( !data.length ) throwError(LOBBY_ENUM.WAIT);

            [data, error] = await asyncHandler(
                Lobby.updateMany({
                    owner_id: user_id,
                    is_expired: true,
                })
            );
            
            req.body.for_game = req?.body?.for_game.toLowerCase();
            [data, error] = await asyncHandler(
                Lobby.create({
                    owner_id: user_id,
                    ...req?.body
                })
            );

            data = data == null || error != null ? [] : [data];
            if( !data.length ) throwError(LOBBY_ENUM.FAILED);

            [data] = data;

            data = data.toObject();
            const lobby_id: string = data._id.toString();

            let [userData, userDataError] = await asyncHandler(
                UserProfile.findOne({
                    _id: data.owner_id,
                }, {ign: 1, tag_line: 1, _id: 0, profile_image_url: 1})
            )

            let name, profile_img_url: string | undefined = undefined;

            if( userData!= null && error == null){
                name = `${userData.ign}#${userData.tag_line}`;
                profile_img_url = userData.profile_image_url;
            }

            const socketPayload: SOCKET_DATA  = {
                user_id,
                type: SOCKET_DATA_TYPE.NOTIFICATION,
                lobby_id: data._id,
                lobby_title: data.title,
                game: data.for_game,
                msg: LOBBY_ENUM.LOBBY_CREATED,
                by: name,
                profile_img_url
            }

            data['livekit_token'] = await LiveKit.getLobbyToken(lobby_id, username, true);

            SocketEvents.emit(SOCKET_EVENTS.LOBBY_CREATED, socketPayload);

            // await Lobby.deleteOne({
            //     _id: lobby_id
            // });
            
            msg = LOBBY_ENUM.SUCCESS;

        }catch(error: any){

            const error_message = error.message;
            msg = error_message;
            status_code = STATUS_CODE.FORBIDDEN;
            data = [];
            success = false;

            if(![LOBBY_ENUM.WAIT, LOBBY_ENUM.FAILED].includes(error_message)){
                console.log(error_message)
                msg = USER_ERRORS.SOMETHING_WENT_WRONG;
                status_code = STATUS_CODE.SERVER_ERROR;
            }
        }

        responseHandler({
            resp,
            success,
            data,
            msg,
            status_code
        })

    };


    /*
       -------------------------- DELETE LOBBY ------------------------------
    */

    public async deleteLobby(req: Request, resp: Response): Promise<any>{

        let data: any = [];
        let msg, error: any = '';
        let status_code: number = STATUS_CODE.ACCEPTED;
        let success: string | boolean = 'ok';
        try{

            const { user_id } = req?.body?.custom;
            const { lobby_id } = req?.body;

            if( !lobby_id ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);

            [data, error] = await asyncHandler(
                Lobby.findOne({
                    owner_id: user_id,
                    _id: lobby_id
                }).lean()
            );

            data = data == null || error != null ? [] : [data];
            if( !data.length ) throwError(REQUEST_ERROR.INVALID_REQUEST);

            [data, error] = await asyncHandler(
                Lobby.deleteOne({
                    owner_id: user_id,
                    _id: lobby_id
                }).lean()
            );

            if( error != null ) throwError(LOBBY_ENUM.FAILED_TO_DELETE);

            msg = LOBBY_ENUM.DELETED;

        }catch(error: any){
            
            const error_message: any = error.message;
            msg = error_message,
            status_code = STATUS_CODE.FORBIDDEN;
            success = false;
            data = [];
            if(![REQUEST_ERROR.INVALID_REQUEST, REQUEST_ERROR.INVALID_PARAMETERS].includes(error_message)){
                msg = USER_ERRORS.SOMETHING_WENT_WRONG;
                status_code = STATUS_CODE.SERVER_ERROR;
            }

        };

        return responseHandler({
            resp,
            success,
            data,
            msg,
            status_code
        })

    }

    /*
       ----------------- UPDATE LOBBY -----------------------
    */

    public async updateLobby(req: Request, resp: Response): Promise<any>{

        let data: any = [];
        let msg, error: any = '';
        let status_code: number = STATUS_CODE.SUCCESS;
        let success: string | boolean = 'ok';
        let max_lobby_capacity: any = process.env.MAX_LOBBY_CAPACITY ?? '15';
        let remove_user_length: number = 0;

        try{

            const { user_id } = req?.body?.custom;
            const { lobby_id, maxCapacity, visibility, allowChat, description } = req?.body;

            let lobby_expire_time: any = process.env.LOBBY_EXPIRE_TIME || '2';
            
            max_lobby_capacity = +max_lobby_capacity;

            if( !lobby_id ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);
            
            if(maxCapacity < 1) throwError(LOBBY_ENUM.MINIMUM_LOBBY_LIMIT);
            if( maxCapacity > max_lobby_capacity ) throwError(`${LOBBY_ENUM.MAX_LOBBY_CAPACITY} ${max_lobby_capacity} ${LOBBY_ENUM.USERS}`);
            

            const currentTime = new Date();
            const pastTime = new Date(currentTime.getTime() - lobby_expire_time * 60000);

            [data, error] = await asyncHandler(
                Lobby.findOne({
                    owner_id: user_id,
                    //created_at: { $gt: pastTime },
                    is_expired: false,
                }).lean()
            );   

            
            data = data == null || error != null ? [] : [data];

            if( !data.length ) throwError(REQUEST_ERROR.INVALID_REQUEST);
        
            [data] = data;

            
            let users_length: number = data?.users?.length;
            remove_user_length = Math.abs(users_length - maxCapacity);
            
            if( maxCapacity < users_length ) throwError(`${LOBBY_ENUM.CANNOT_UPDATE_LIMIT} ${remove_user_length} ${ remove_user_length > 1 ? LOBBY_ENUM.USERS : LOBBY_ENUM.USER }`);
            
            [data, error] = await asyncHandler(
                Lobby.updateOne({
                    description: description == '' ? null : description,
                    maxCapacity,
                    visibility: visibility > 3 || visibility < 0 ? 0 : visibility,
                    allowChat
                })
            );
            
            if( data == null || error != null) throwError(LOBBY_ENUM.FAILED_TO_UPDATE);

            msg = LOBBY_ENUM.UPDATED_LOBBY;


        }catch(error: any){
        
            let error_message: any = error.message;
            msg = error_message,
            status_code = STATUS_CODE.FORBIDDEN;
            success = false;
            data = [];
            if(![REQUEST_ERROR.INVALID_REQUEST, LOBBY_ENUM.FAILED_TO_UPDATE, LOBBY_ENUM.MINIMUM_LOBBY_LIMIT,
                `${LOBBY_ENUM.MAX_LOBBY_CAPACITY} ${max_lobby_capacity} ${LOBBY_ENUM.USERS}`, 
                `${LOBBY_ENUM.CANNOT_UPDATE_LIMIT} ${remove_user_length} 
                    ${ remove_user_length > 1 ? LOBBY_ENUM.USERS : LOBBY_ENUM.USER }`]
                    .includes(error_message)){
                        msg = USER_ERRORS.SOMETHING_WENT_WRONG;
                        status_code = STATUS_CODE.SERVER_ERROR;
            }
        }

        return responseHandler({
            resp,
            success,
            status_code,
            msg,
            data
        });

    }

}

const UserLobbyController = new Main();
export default UserLobbyController;
