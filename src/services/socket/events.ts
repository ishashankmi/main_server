import { SocketEvents } from "./connection";
import { SOCKET_EVENTS } from "../../config";
import { SocketController } from "../../controller";

export function InitialzeSocketEvents() {
  
  SocketEvents.on(SOCKET_EVENTS.MESSAGE, (data) => {
    console.log("here")
  })
    .on(SOCKET_EVENTS.USER_ONLINE_STATUS, (data)=>{
      SocketController.updateOnlineStatus(data)
    })
    .on(SOCKET_EVENTS.NOTIFICATION, (data) => {
      console.log(data);
    })
    .on(SOCKET_EVENTS.JOIN_LOBBY, (data) => {
      SocketController.joinLobbySocket(data);
    })
    .on(SOCKET_EVENTS.EXIT_LOBBY, (data) => {
      console.log("exit", data);
    })
    .on(SOCKET_EVENTS.KICK_USER, (data) => {
      console.log("kick", data);
    })
    .on(SOCKET_EVENTS.LOBBY_CREATED, (data) => {
      SocketController.lobbyCreatedSocket(data);
    })
    .on(SOCKET_EVENTS.LOBBY_REQ_ACCEPT, (data) => {
      SocketController.lobbyRequestAccpetSocket(data);
    })
    .on(SOCKET_EVENTS.JOIN_REQ_ACCEPT, (data)=>{
      SocketController.joinReqAcceptSocket(data);
    })
    .on(SOCKET_EVENTS.JOIN_LOBBY_REQUEST, (data)=>{
      SocketController.joinLobbyRequest(data);
    })
}