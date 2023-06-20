import { Router } from "express";
import { UserController } from "../../../../controller";

const routes = Router();

routes.post("/register", UserController.addUser);
routes.post("/login", UserController.login);
routes.post("/callback", UserController.googleAuth);

export { routes as AuthRouter }