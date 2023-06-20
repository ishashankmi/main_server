import express from "express";
const Router = express.Router();
import { UserController } from "../../../../../controller";
import { AutheticateUser } from "../../../../../config";


Router.use('/onlineUsers', AutheticateUser(true), UserController.getOnlineUsers);
Router.get("/:id", AutheticateUser(false), UserController.getById);

export { Router };
