import { SOCKET_DATA } from "../../interface";
import { SOCKET_USERS } from "../../../utils/constants";
import { throwError } from "../../../utils/error";
import { USER_ERRORS } from "../../config/enums";


class Main{

    public BufferMsg(event: any, data: any){
        return Buffer.from(JSON.stringify([event, data]));
    }

    public async SendToUser(event: string, data: SOCKET_DATA){
        const { user_id } = data;
        try{
            
            if( !user_id ) throwError(USER_ERRORS.INVALID_USER_ID);
            if(SOCKET_USERS.has(user_id)){
                let UserWs = SOCKET_USERS.get(user_id);
                UserWs.map((ws: any)=>{
                    ws.send(this.BufferMsg(event, data));
                });
            }

        }catch(error: any){
            console.log(error.message);
        }
    }
}

const SocketHelper = new Main();
export { SocketHelper };