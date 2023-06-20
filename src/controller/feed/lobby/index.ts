require('dotenv').config();
import { Request, Response } from "express";
import { responseHandler } from "../../../../utils/handlers/responseHandler";
import { LOBBY_ENUM, REQUEST_ERROR, STATUS_CODE, USER_ERRORS } from "../../../config/enums";
import { Lobby } from "../../../models/lobby";
import { asyncHandler } from "../../../../utils/handlers/asyncHandler";
import { throwError } from "../../../../utils/error";

class Main {

    public async getUserLobby(req: Request, resp: Response): Promise<void>{

        let data: any = [];
        let error, msg: string = '';
        let success: boolean | string = 'ok';
        let status_code: number = STATUS_CODE.SUCCESS;

        try{
            const { user_id } = req?.body?.custom;
            let { game, pageNumber }: any = req.query;

            if( !game ) throwError(REQUEST_ERROR.INVALID_PARAMETERS);

            game = game.toLowerCase();
            pageNumber = pageNumber || 1;
            const pageSize = 10;

            const query = {
                visibility: 0,
                for_game: game,
                is_expired: false,
                maxCapacity: { $ne: 0 },
                owner_id: { $ne: user_id }
            };

            const projection = {
                __v: 0,
                // users: 0,
                allowChat: 0,
                visibility: 0,
                modified_at: 0,
                is_expired: 0
            };

            const sort: any = { date_created: -1 };

            const populate = { path: 'owner_id', select: 'username ign tag_line' };

            const skip: number = (pageNumber - 1) * pageSize;

            const limit: number = pageSize;


            [data, error] = await asyncHandler(
                Lobby.find(query, projection)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate(populate)
                .lean()
            );
            
            data = data == null || error != null ? [] : data;

            if( !data.length ){
                data = [];
                msg = LOBBY_ENUM.LOBBY_NOT_CREATED;
            }else{
                [data] = data;
                let data_users = data.users;
                if(data_users.length){
                    for(var users of data_users){
                        users._id == user_id;
                        data.is_joined = true;
                    };

                    if(!data.is_joined){
                        data.is_joined = false;
                        delete data.users;
                    }

                };

                console.log(data);
                const owner_info = data['owner_id'];
                data['owner_info'] = owner_info;
                delete data.owner_id;
                data = [data];

                msg = LOBBY_ENUM.LOBBY_LIST;
            }

        }catch(error: any){
            const error_msg = error.message;
            status_code = 403;
            data = [];
            success = false;
            msg = error_msg;            
            if( ![LOBBY_ENUM.LOBBY_NOT_CREATED, REQUEST_ERROR.INVALID_PARAMETERS].includes(error_msg) ){
                msg = USER_ERRORS.SOMETHING_WENT_WRONG;
                status_code = 500;
            }
        }

        return responseHandler({
            resp,
            data,
            success,
            status_code,
            msg,
        })

    }

}

const FeedLobbyController = new Main();

export { FeedLobbyController };