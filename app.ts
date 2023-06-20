require("dotenv").config();
import express, { Express } from "express";
import { ApiRoutes } from "./src/routes";
import { WebSocketServer } from "./src/services";
import { InitialzeSocketEvents } from "./src/services";
import { SERVER_ENUMS } from "./src/config";
class Main {
  private app: Express;
  private port: number | string;
  private webSocketServer: any;
  private webSocketPort: number | string;
  private InitialzeSocketEvents: any;
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8000;
    this.webSocketServer = WebSocketServer;
    this.webSocketPort = process.env.WEB_SOCKET_PORT || 8001;
    this.InitialzeSocketEvents = InitialzeSocketEvents;
  }
  public startServer(): void {
    this.app.disable("etag");
    this.app.use(ApiRoutes);
    this.app.listen(this.port, () => {
      this.InitialzeSocketEvents();
      console.log(SERVER_ENUMS.WEB_SERSVER_STARTED, this.port);
      this.webSocketServer.listen(
        this.webSocketPort,
        console.log(SERVER_ENUMS.WEBSOCKET_STARTED, this.webSocketPort)
      );
    });
  }
}

process.on("uncaughtException", (error: any) => {
  console.error("[x] Uncaught Error:", error.message);
});
process.on("unhandledRejection", (error: any) => {
  console.error("[x] Unhandeled Error:", error.message);
});

new Main().startServer();
