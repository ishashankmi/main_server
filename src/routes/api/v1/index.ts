import express from "express";
import { LobbyRouter } from "./lobby";
import { UserRoute } from "./user";
import { Feed } from "./feed";
import { AuthRouter } from "./auth";
const routes = express.Router();

routes.use("/user", UserRoute);
routes.use('/lobby', LobbyRouter);
routes.use('/feed', Feed);

// LOGIN, SIGNUP, GOOGLE LOGIN ROUTER 
routes.use(AuthRouter);


export { routes as MainRoutes };
