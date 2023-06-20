import { SOCKET_USERS } from "../../../utils/constants";
import { SOCKET_EVENTS } from "../../config/enums";
import { USERS_LOBBY } from "../../../utils/constants";
import { throwError } from "../../../utils/error";
import { SOCKET_DATA } from "../../interface/interface";
import { SocketHelper } from "../../services";
import { asyncHandler } from "../../../utils/handlers";
import { UserJoin, UserProfile } from "../../models";
import mongoose from "mongoose";

class Main{

    public async lobbyCreatedSocket(data: any): Promise<void> {
        const { user_id } = data;
        let mainData: any = null, error: any;
        try{
            [mainData, error] = await asyncHandler(
                UserJoin.find({
                    target_id: user_id,
                    status: 2,
                }, { joiner_id: 1} )
            );
            if( mainData.length && error == null) {
                for(var user of mainData){
                    // CHANGED USER_ID TO JOINER_USER TO CHECK AND SEND DATA THROUGH SOCKET
                    data['user_id'] = user.joiner_id.toString();
                    await SocketHelper.SendToUser(SOCKET_EVENTS.CREATE_LOBBY, data);
                }
            }
        }catch(error: any){
            console.log(error.message);
        }

    };

    /*
        --------------- JOIN LOBBY REQUEST ---------------------
    */

    public async joinLobbySocket(data: any): Promise<void> {
        try{
            const { user_id, lobby_id } = data;
            if(SOCKET_USERS.has(user_id) && USERS_LOBBY.has(lobby_id)){
                let data = SOCKET_USERS.get(user_id);
                USERS_LOBBY.set(lobby_id, [...data, ...USERS_LOBBY.get(lobby_id)]);
            }else{
                throwError('USER OFFILINE');
            }

            console.log(USERS_LOBBY);

        }catch(error: any){
            console.log(error.message);
        }
    }

    /*
        ------------ LOBBY REQUEST ACCEPTED ------------------------
    */

    public async lobbyRequestAccpetSocket(data: SOCKET_DATA): Promise<void> {
        try{
            await SocketHelper.SendToUser(SOCKET_EVENTS.LOBBY_REQ_ACCEPT, data);
        }catch(error: any){
            console.log(error.message);
        }
    };

    public async joinReqAcceptSocket(data: SOCKET_DATA): Promise<void> {
        try{
            await SocketHelper.SendToUser(SOCKET_EVENTS.JOIN_REQ_ACCEPT, data);
        }catch(error: any){
            console.log(error.message);
        }
    };

    public async updateOnlineStatus(data: SOCKET_DATA): Promise<void> {
        try{
            const { user_id, online_status } = data;
            let user_object_id = new mongoose.Types.ObjectId(user_id);
            let userProfileData, userProfileError : any;

            let is_online: boolean = online_status ? false : true;

            [userProfileData, userProfileError] = await asyncHandler(
                UserProfile.findOneAndUpdate(
                    {
                      _id: user_object_id,
                      is_online: is_online
                    },
                    { $set: { is_online: online_status } },
                    { new: true }
                  )
                  .lean()
            );

            let [mainData, error] = await asyncHandler(
                UserJoin.find({
                    target_id: user_id,
                    status: 2,
                }, { joiner_id: 1} ).lean()
            );

            if( mainData.length && error == null) {
                for(var user of mainData){
                    // CHANGED USER_ID TO JOINER_USER
                    data['user_id'] = user.joiner_id.toString();
                    data['msg'] = user_id + ' is online';
                    await SocketHelper.SendToUser(SOCKET_EVENTS.USER_ONLINE_STATUS, data);
                }
            }
        }catch(error: any){
            console.log(error.message);
        }
    };

    public async joinLobbyRequest(data: SOCKET_DATA): Promise<void> {
        try{
            const { user_id, lobby_id, request_id } = data;
            await SocketHelper.SendToUser(SOCKET_EVENTS.JOIN_LOBBY_REQUEST, data);
        }
        catch(error: any){
            console.log(error.message);
        }
    }
    

}

const SocketMainController = new Main();

export { SocketMainController as SocketController };