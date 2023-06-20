import http from 'http';
import WebSocket from 'ws';
const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });
import { SocketAuth } from '../../config/authentication/socketAuth';
import { generateUUID } from '../../../utils/randomText';
import EventEmitter from 'events';
import { SOCKET_USERS } from '../../../utils/constants';
import { SOCKET_EVENTS } from '../../config/enums';
import { USER_INFO } from '../../interface';

let SocketEvents = new EventEmitter();

wss.on('connection', function connection(ws: any, request: any) {
    let data: any = request.customHeaders;
    let socket_key : string = data.socket_key;
    let { id } = data.decypt;
    console.log('USER CONNECTED ===>', id, socket_key);

    try{
        
        ws.socket_key = socket_key;
        if(SOCKET_USERS.has(id)){
            SOCKET_USERS.set(id, [...SOCKET_USERS.get(id), ws]);
        }else{
            SOCKET_USERS.set(id, [ws]);
        };

        let socket_payload: USER_INFO = {
            user_id: id,
            online_status: true,
            type: SOCKET_EVENTS.NOTIFICATION
        }

        SocketEvents.emit(SOCKET_EVENTS.USER_ONLINE_STATUS, socket_payload);

        ws.on('message', (data: any)=>{
            
            let user_event = JSON.parse(data);
            let [event, msg] = user_event;
            msg.user_id = id;
            msg.socket_key = socket_key;

            SocketEvents.emit(event, msg);
            
        })

        ws.on('close', ()=>{
            let dis_user = SOCKET_USERS.get(id);
            let filters = dis_user.filter((data: any)=>{
                return data.socket_key != ws.socket_key;
            });
            
            if( !filters.length ) {
                let socket_payload: USER_INFO = {
                    user_id: id,
                    online_status: false,
                    type: SOCKET_EVENTS.NOTIFICATION
                }
        
                SocketEvents.emit(SOCKET_EVENTS.USER_ONLINE_STATUS, socket_payload);
            }

            SOCKET_USERS.set(id, filters);
        });

    }catch(error: any){
        console.error(error.message);
    }

});

server.on('upgrade', async function upgrade(request: any, socket: any, head: any) {

    try{
        let [key, token]: [string, string] = request.headers['sec-websocket-protocol'].split(',');

        key = key.trim();
        token = token.trim();

        let user_data: any = await SocketAuth(key, token);

        if(!user_data){
            socket.destroy();
            return;
        };

        user_data['socket_key'] = generateUUID();
        request.customHeaders = user_data;

        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });

    }catch(error:any){
        socket.destroy();
        return;
    }
});


export { server as WebSocketServer, SocketEvents }