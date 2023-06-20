import { MainRoutes } from "./api/v1";
import { Router } from "express";
import { AuthMiddleware } from "./api/v1/_middleware";
import { InvalidRoute } from "./api/v1/_middleware/invalidRoute";

require("dotenv").config();
const route = Router();

let api_route: string = process.env.API_ROUTE || "/api";

route.use(AuthMiddleware);
route.use(api_route, MainRoutes);
route.use("*", InvalidRoute);

export { route as ApiRoutes };
