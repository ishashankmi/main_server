import { AccessToken } from 'livekit-server-sdk';
import { LIVEKIT_SERVER } from '../../config/enums';
require('dotenv').config();

const livekitHost: string = process.env.LIVEKIT_HOST ?? '';
const api_key: string = process.env.LIVEKIT_API_KEY ?? '';
const api_token: string = process.env.LIVEKIT_API_TOKEN ?? '';

class Main{
    public async getLobbyToken(roomName: string, participantUsername: string, isAdmin?: boolean): Promise<any>{
        try{
            isAdmin = !isAdmin ? false : true;
            const at = new AccessToken(api_key, api_token, {
                identity: participantUsername,
            });
            at.addGrant({ roomJoin: true, room: roomName, roomAdmin: isAdmin, recorder:false });
            const token: string = at.toJwt();
            return token;
        }catch(error){
            console.log(LIVEKIT_SERVER.FAILED_TO_CREATE_TOKEN);
            return null;
        }
    }
}

const LiveKit = new Main();

export default LiveKit;