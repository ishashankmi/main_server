require('dotenv').config();
import { Lobby } from "../../../models/lobby";
import { LobbyRequest } from "../../../models/lobby";
import { asyncHandler } from "../../../../utils/handlers/asyncHandler";
import e, { Request, Response } from "express";
import { responseHandler } from "../../../../utils/handlers/responseHandler";
import { throwError } from "../../../../utils/error";
import { LOBBY_ENUM, REQUEST_ERROR, SOCKET_DATA_TYPE, SOCKET_EVENTS, SOCKET_MESSAGE, STATUS_CODE, USER_ERRORS } from "../../../config/enums";
import { SocketEvents } from "../../../services/socket";
import { UserProfile } from "../../../models/user";
import is_empty_object from "../../../../utils/checkEmpty";
import { SOCKET_DATA, SOCKET_PAYLOAD, USER_INFO } from "../../../interface/interface";
import LiveKit from "../../../services/livekit";
import mongoose from "mongoose";


class Main {
    /*
        VERIFY IF WANT TO PERMANENTLY KICK USER FROM THIS LOBBY IF STATUS IS REJECTED
    */

    public async requestLobbyJoin(req: Request, resp: Response): Promise<any> {

        let data: any = [];
        let msg, error: any = '';
        let status_code: number = STATUS_CODE.CREATED;
        let success: string | boolean = 'ok';
        let max_lobby_req: string | undefined | number = process.env.MAX_LOBBY_REQUEST || 25;

        try{
            
            let { user_id } = req?.body?.custom;
            let { lobby_id } = req?.body;

            if( !lobby_id ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);

            [data, error] = await asyncHandler(
                Lobby.findOne({
                    _id: lobby_id,
                    is_expired: false,
                }, { title: 1, for_game: 1, owner_id: 1, maxCapacity: 1}).lean()
            );

            data = data == null || error != null ? [] : [data];

            if( !data.length ) throwError(LOBBY_ENUM.NOT_FOUND);

            [data] = data;
            
            let { owner_id, for_game, title } = data;

            owner_id = owner_id.toString();

            if( !data.maxCapacity ) throwError(LOBBY_ENUM.LOBBY_IS_FULL);

            [ data, error ] = await asyncHandler(
                LobbyRequest.count({
                    lobby_id,
                    status: 0,
                }).lean()
            );
            
            if( error != null ) throwError(USER_ERRORS.SOMETHING_WENT_WRONG);
            
            // CANNOT SEND MORE REQUEST IF REACH TRASHHOLD
            if( data >= max_lobby_req ) throwError(LOBBY_ENUM.CANNOT_SEND_MORE_REQUESTS);

            [data, error] = await asyncHandler(
                LobbyRequest.findOne({
                    lobby_id,
                    user_id
                }).lean()
            );

            data = data == null || error != null ? [] : [data];            
            
            if( data.length ) throwError(LOBBY_ENUM.JOIN_REQUEST_ALREADY_SENT);

            [data, error] = await asyncHandler(
                LobbyRequest.create({
                    lobby_id,
                    user_id
                })
            );

            data = data == null || error != null ? [] : [data];

            if( !data.length ) throwError(LOBBY_ENUM.FAILED_TO_JOIN_LOBBY);

            [data] = data;


            let [ user, userError ] = await asyncHandler(
                UserProfile.findOne(
                    { _id : user_id },
                    { ign: 1, tag_line: 1, profile_image_url: 1}
                )
            )

            let socket_payload: SOCKET_DATA = {
                type: SOCKET_EVENTS.NOTIFICATION,
                user_id: owner_id,
                lobby_id,
                ign: user.ign,
                tag_line: user.tag_line,
                game: for_game,
                lobby_title: title,
                profile_img_url: user.profile_img_url || null,
                msg: SOCKET_MESSAGE.JOIN_LOBBY_REQUEST
            }
            
            SocketEvents.emit(SOCKET_EVENTS.JOIN_LOBBY_REQUEST, socket_payload);
            
            msg = LOBBY_ENUM.LOBBY_JOIN_REQUEST_SENT;


        }catch(error: any){
            const error_message: any = error.message;
            console.log(error_message)
            
            msg = error_message;
            success = false;
            status_code = STATUS_CODE.FORBIDDEN;
            data = [];

            if(error_message == LOBBY_ENUM.NOT_FOUND) status_code = STATUS_CODE.NOT_FOUND;

            if(![LOBBY_ENUM.FAILED_TO_JOIN_LOBBY, LOBBY_ENUM.LOBBY_IS_FULL, 
                    LOBBY_ENUM.NOT_FOUND, LOBBY_ENUM.JOIN_REQUEST_ALREADY_SENT, REQUEST_ERROR.INVALID_PARAMETERS
                ].includes(error_message)){
                status_code = STATUS_CODE.SERVER_ERROR;
                msg = USER_ERRORS.SOMETHING_WENT_WRONG;
            }
        };

        responseHandler({
            resp,
            data,
            success,
            status_code,
            msg
        })

    }

    public async leaveLobby(req: Request, resp: Response): Promise<any> {

        let data: any = [];
        let msg, error: any = '';
        let status_code: number = STATUS_CODE.SUCCESS;
        let success: string | boolean = 'ok';

        try{
            
            let { user_id } = req?.body?.custom;
            let { lobby_id, request_id } = req?.body;

            if( !lobby_id || !request_id ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);

            [ data, error ] = await asyncHandler(
                LobbyRequest.findOneAndUpdate({
                    _id: request_id,
                    lobby_id,
                    user_id,
                    status: 1
                }, { status: 0 })
            );
            
            data = !data || error != null ? [] : [data];
            if( !data.length ) throwError(REQUEST_ERROR.INVALID_REQUEST);

            [ data, error ] = await asyncHandler(
                Lobby.findOneAndUpdate(
                    { _id: lobby_id },
                    { $pull: { users: { _id: user_id } }, $inc: { maxCapacity: 1 } },
                    { new: true }
                )
            );

            data = !data || error != null ? [] : [data];

            if( !data.length ){   
                await LobbyRequest.updateOne({
                    user_id: user_id,
                    lobby_id: lobby_id,
                }, { status: 1 });

                throwError(LOBBY_ENUM.FAILED_TO_LEAVE);
            };

        }catch(error: any){
            const error_message: any = error.message;
            msg = error_message;
            status_code = STATUS_CODE.BAD_REQUEST;
            success = false;
            data = [];

            if(![LOBBY_ENUM.FAILED_TO_LEAVE, REQUEST_ERROR.INVALID_REQUEST, REQUEST_ERROR.INVALID_PARAMETERS].includes(error_message)){
                status_code = STATUS_CODE.SERVER_ERROR;
                msg = USER_ERRORS.SOMETHING_WENT_WRONG;
            }

        }
        
        responseHandler({
            resp,
            data,
            msg,
            success
        })

    }
    

    /*
        --------------------- ACCEPT LOBBY JOIN REQUEST ----------------------------------
    */

    public async acceptLobbyJoin(req: Request, resp: Response): Promise<any> {

        let data: any = [];
        let msg, error: any = '';
        let status_code: number = STATUS_CODE.SUCCESS;
        let success: string | boolean = 'ok';

        try{
            
            let { user_id } = req?.body?.custom;
            let { lobby_id, request_id } = req?.body;

            if(is_empty_object({lobby_id, request_id})) throwError(REQUEST_ERROR.INVALID_PARAMETERS);

            [data, error] = await asyncHandler(
                Lobby.findOne(
                    {   
                        _id: lobby_id,
                        owner_id: user_id,
                        is_expired: false
                    }, 
                    {
                        maxCapacity: 1,
                        users: 1,
                        title: 1,
                        for_game: 1,
                    }
                )
            );

            data = data == null || error != null ? [] : [data];

            if( !data.length ) throwError(LOBBY_ENUM.LOBBY_NOT_EXIST);

            [ data ] = data;

            let users = data.users;
            let title: string = data.title;
            let for_game: string = data.for_game;

            if( !data.maxCapacity ) throwError(LOBBY_ENUM.CANNOT_ADD_MORE_USERS);

            let rid = new mongoose.Types.ObjectId(request_id);
            [data, error] = await asyncHandler(
                LobbyRequest.findOne({ _id: rid, status: 0 }, { _id: 0, __v: 0, status: 0, created_at: 0, modified_at: 0})
                .populate({
                    path: 'user_id',
                    select: 'ign tag_line username',
                }).lean()
            );
            console.log(data);
            data = data == null || error != null ? [] : [data];
            if( !data.length ) throwError(REQUEST_ERROR.INVALID_REQUEST);
            [data] = data;


            let newUsers = data.user_id;
            
            let requested_user_id = (newUsers._id).toString();
            let username: string = newUsers.username;

            [data, error] = await asyncHandler(
                Lobby.findOneAndUpdate(
                    { _id: lobby_id },
                    {
                      $push: { users: newUsers },
                      $inc: { maxCapacity: -1 }
                    },
                    { new: true }
                  )
            );

            data = data == null || error != null ? [] : [data];
            
            if( !data.length ) throwError(LOBBY_ENUM.FAILED_TO_ACCEPT_REQUEST);

            [data, error] = await asyncHandler(
                LobbyRequest.updateOne({
                    _id: request_id
                }, { status: 1 })
            );

            data = data == null || error != null ? [] : [data];

            if( !data.length ) {

                await Lobby.findOneAndUpdate(
                    { _id: lobby_id },
                    { $pull: { users: { _id: requested_user_id } }, $inc: { maxCapacity: 1 } },
                    { new: true }
                );

                await LobbyRequest.updateOne({
                    user_id: requested_user_id,
                    lobby_id: lobby_id,
                }, { status: 0 })

                throwError(LOBBY_ENUM.FAILED_TO_ACCEPT_REQUEST);
            }

            [data] = data;

            let livekit_token = await LiveKit.getLobbyToken(lobby_id, username, false);

            data['livekit_token'] = livekit_token;

            const socketPayload: SOCKET_PAYLOAD | SOCKET_DATA = { 
                user_id: requested_user_id,
                lobby_id,
                lobby_token: livekit_token,
                lobby_title: title,
                game: for_game,
                type: SOCKET_DATA_TYPE.NOTIFICATION
            };

            // await LobbyRequest.updateOne({
            //     user_id: requested_user_id,
            //     lobby_id: lobby_id,
            // }, { status: 0 })

            SocketEvents.emit(SOCKET_EVENTS.LOBBY_REQ_ACCEPT, socketPayload);

            msg = LOBBY_ENUM.REQUEUST_ACCEPTED;

        }catch(error: any){

            let error_message = error.message;
            console.log(error_message)
            status_code = STATUS_CODE.FORBIDDEN;
            msg = error_message,
            data = [];
            success = false;

            if( error_message == LOBBY_ENUM.LOBBY_NOT_EXIST ) status_code = STATUS_CODE.NOT_FOUND;

            if(![LOBBY_ENUM.FAILED_TO_ACCEPT_REQUEST, REQUEST_ERROR.INVALID_REQUEST, 
                LOBBY_ENUM.CANNOT_ADD_MORE_USERS, LOBBY_ENUM.LOBBY_NOT_EXIST, REQUEST_ERROR.INVALID_PARAMETERS]
                .includes(error_message)){
                    status_code = STATUS_CODE.SERVER_ERROR;
                    msg = USER_ERRORS.SOMETHING_WENT_WRONG;
            }

        }

        return responseHandler({
            resp,
            success,
            data,
            status_code,
            msg
        })
    }
    

    /*
        -------------------------- REJECT JOIN REQUEST -----------------------------
    */

        public async rejectLobbyJoin(req: Request, resp: Response): Promise<any> {

            let data: any = [];
            let msg, error: any = '';
            let status_code: number = STATUS_CODE.SUCCESS;
            let success: string | boolean = 'ok';
    
            try{
                
                let { user_id } = req?.body?.custom;
                let { lobby_id, request_id } = req?.body;
                
                if( !lobby_id || !request_id ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);

                [data, error] = await asyncHandler(
                    Lobby.findOne(
                        {   
                            _id: lobby_id,
                            owner_id: user_id,
                            is_expired: false
                        }, 
                        {
                            owner_id: 1,
                        }
                    )
                );
    
                data = !data || error != null ? [] : [data];
    
                if( !data.length ) throwError(LOBBY_ENUM.LOBBY_NOT_EXIST);

                [data, error] = await asyncHandler(
                    LobbyRequest.findOneAndUpdate({
                        _id: request_id,
                        status: 0,
                    }, { status: 2 })
                );

                data = data == null || error != null ? [] : [data];
                if( !data.length ) throwError (LOBBY_ENUM.FAILED_TO_REJECT_REQUEST)
                msg = LOBBY_ENUM.REQUEUST_REJECTED;
    
            }catch(error: any){
    
                let error_message = error.message;
                status_code = STATUS_CODE.FORBIDDEN;
                msg = error_message,
                data = [];
                success = false;
    
                if( error_message == LOBBY_ENUM.LOBBY_NOT_EXIST ) status_code = STATUS_CODE.NOT_FOUND;
    
                if(![LOBBY_ENUM.FAILED_TO_REJECT_REQUEST, LOBBY_ENUM.LOBBY_NOT_EXIST, REQUEST_ERROR.INVALID_PARAMETERS]
                    .includes(error_message)){
                        status_code = STATUS_CODE.SERVER_ERROR;
                        msg = USER_ERRORS.SOMETHING_WENT_WRONG;
                }   
    
            }
    
            return responseHandler({
                resp,
                success,
                data,
                status_code,
                msg
            })
        };

        /*
            ---------------------------- KICK USER FROM LOBBY ------------------------------------
        */

        public async kickUserFromLobby(req: Request, resp: Response): Promise<any> {

            let data: any = [];
            let msg, error: any = '';
            let status_code: number = STATUS_CODE.SUCCESS;
            let success: string | boolean = 'ok';

            try{

                let { user_id } = req?.body?.custom;
                let { lobby_id, request_id } = req?.body;

                if( !lobby_id || !request_id ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);
    
                [data, error] = await asyncHandler(
                    Lobby.findOne(
                        {   
                            _id: lobby_id,
                            owner_id: user_id,
                            is_expired: false
                        }, 
                        {
                            owner_id: 1,
                        }
                    )
                );
    
                data = data == null || error != null ? [] : [data];
    
                if( !data.length ) throwError(LOBBY_ENUM.LOBBY_NOT_EXIST);

                [data, error] = await asyncHandler(
                    LobbyRequest.findOne({
                        _id: request_id,
                        status: 1
                    })
                );
                
                data = data == null || error != null ? [] : [data];

                if( !data.length ) throwError(REQUEST_ERROR.INVALID_REQUEST);

                [data] = data;
                
                const to_kick_user: string = data.user_id;

                [ data, error ] = await asyncHandler(
                    LobbyRequest.updateOne({
                        _id: request_id,
                    }, { status: 3 })
                );

                data = data == null || error != null ? [] : [data];

                if( !data.length ) throwError(LOBBY_ENUM.FAILED_TO_KICK_USER);
                

                [data, error] = await asyncHandler(
                    Lobby.findOneAndUpdate(
                        { _id: lobby_id },
                        { $pull: { users: { _id: to_kick_user } }, $inc: { maxCapacity: 1 } },
                        { new: true }
                    )
                )

                data = data == null || error != null ? [] : [data];

                if( !data.length ) {
                    await asyncHandler(
                        LobbyRequest.updateOne({
                            user_id: request_id,
                            lobby_id: lobby_id,
                        }, { status: 1 })
                    );

                    throwError(LOBBY_ENUM.FAILED_TO_KICK_USER);

                }

                msg = LOBBY_ENUM.KICKED_USER


            }catch(error: any){
    
                let error_message = error.message;
                status_code = STATUS_CODE.FORBIDDEN;
                msg = error_message,
                data = [];
                success = false;
    
                if( error_message == LOBBY_ENUM.LOBBY_NOT_EXIST ) status_code = STATUS_CODE.NOT_FOUND;
    
                if(![LOBBY_ENUM.FAILED_TO_KICK_USER, LOBBY_ENUM.LOBBY_NOT_EXIST, 
                    REQUEST_ERROR.INVALID_REQUEST, REQUEST_ERROR.INVALID_PARAMETERS]
                    .includes(error_message)){
                        status_code = STATUS_CODE.SERVER_ERROR;
                        msg = USER_ERRORS.SOMETHING_WENT_WRONG;
                }   
    
            }
    
            return responseHandler({
                resp,
                success,
                data,
                status_code,
                msg
            })

        };

    public async startLobbySession(req: Request, resp: Response): Promise<any> {

        let data: any = [];
        let msg, error: any = '';
        let status_code: number = STATUS_CODE.ACCEPTED;
        let success: string | boolean = 'ok';

        try{

            const { user_id } = req?.body?.custom;
            const { lobby_id } = req?.body;

            [data, error] = await asyncHandler(
                Lobby.findOne({
                    owner_id: user_id,
                    _id: lobby_id,
                    // is_expired: false,
                    // session_start: {
                    //     $ne: null
                    // }
                }, { is_expired: 1, session_start: 1 }).lean()
            );

            data = data == null || error != null ? [] : [data];

            if( !data.length ) throwError(LOBBY_ENUM.LOBBY_NOT_FOUND);

            [data] = data;

            if(data.is_expired) throwError(LOBBY_ENUM.LOBBY_EXPIRED);
            if( data.session_start != null ) throwError(LOBBY_ENUM.SESSION_ALREADY_RUNNING);
            
            [data, error] = await asyncHandler(
                Lobby.updateOne({
                    _id: lobby_id,
                    owner_id: user_id
                }, { session_start: Date() })
            )
            
            data = data == null || error != null ? [] : [data];

            if( !data.length ) throwError(LOBBY_ENUM.FAILED_TO_START_SESSION);

            msg = LOBBY_ENUM.LOBBY_SESSION_STARTED;

        }catch(error: any){
    
            let error_message = error.message;
            status_code = STATUS_CODE.FORBIDDEN;
            msg = error_message,
            data = [];
            success = false;

            if( error_message == LOBBY_ENUM.LOBBY_NOT_FOUND ) status_code = STATUS_CODE.NOT_FOUND;

            if(![LOBBY_ENUM.FAILED_TO_START_SESSION, LOBBY_ENUM.LOBBY_EXPIRED, 
                LOBBY_ENUM.SESSION_ALREADY_RUNNING, LOBBY_ENUM.LOBBY_NOT_FOUND]
                .includes(error_message)){
                    status_code = STATUS_CODE.SERVER_ERROR;
                    msg = USER_ERRORS.SOMETHING_WENT_WRONG;
            };

        }

        return responseHandler({
            resp,
            success,
            data,
            status_code,
            msg
        })

    };

    public async getLobbyToken(req: Request, resp: Response): Promise<any>{
        
        let data: any = [];
        let msg, error: any = '';
        let status_code: number = STATUS_CODE.CREATED;
        let success: string | boolean = 'ok';

        try{
            const { user_id, username } = req?.body?.custom;
            const { lobby_id } = req?.body;

            [data, error] = await asyncHandler(
                Lobby.findOne({
                    _id: lobby_id
                }, { owner_id: 1, is_expired: 1 }).lean()
            );
            
            data = data == null || error != null ? [] : [data];
            if( !data.length ) throwError(LOBBY_ENUM.LOBBY_NOT_FOUND);
            [data] = data;

            if( data.is_expired ) throwError(LOBBY_ENUM.LOBBY_EXPIRED);
            const owner_id: string = data.owner_id;
            
            if( owner_id == user_id ){

                const likeKitToken: string | null = await LiveKit.getLobbyToken(lobby_id, username, true);
                data = [
                    {
                        lobby_token: likeKitToken
                    }
                ];
                msg = LOBBY_ENUM.TOKEN_SUCCES;

            }else{

                [data, error] = await asyncHandler(
                    LobbyRequest.findOne({
                        lobby_id,
                        user_id,
                    }).lean()
                );
               
                data = data == null || error != null ? [] : [data];

                if( !data.length ) throwError(REQUEST_ERROR.INVALID_REQUEST);
                [data] = data;
                if(data.status != 1) throwError(LOBBY_ENUM.NO_PERMISSION);

                const likeKitToken: string | null = await LiveKit.getLobbyToken(lobby_id, username, false);
                data = 
                    {
                        lobby_token: likeKitToken
                    }
                
                msg = LOBBY_ENUM.TOKEN_SUCCES;
            }

        }catch(error: any){
    
            let error_message = error.message;
            status_code = STATUS_CODE.FORBIDDEN;
            msg = error_message,
            data = [];
            success = false;

            if( error_message == LOBBY_ENUM.LOBBY_NOT_FOUND ) status_code = STATUS_CODE.NOT_FOUND;

            if(![LOBBY_ENUM.NO_PERMISSION, REQUEST_ERROR.INVALID_REQUEST,
                LOBBY_ENUM.LOBBY_EXPIRED, LOBBY_ENUM.LOBBY_NOT_FOUND]
                .includes(error_message)){
                    status_code = STATUS_CODE.SERVER_ERROR;
                    msg = USER_ERRORS.SOMETHING_WENT_WRONG;
            };

        }

        return responseHandler({
            resp,
            success,
            data,
            status_code,
            msg
        })
        
    }

}

const MainRequestLobby = new Main();
export default MainRequestLobby;