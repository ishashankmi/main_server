/*

  THIS IS A ROUTE MIDDLEWARE ONLY CHECKS IF ROUTES ARE VALID

*/
require("dotenv").config();
import { LET_BYPASS_ROUTES } from "../../../../../utils/constants";
import { Router, Request, Response } from "express";
import express from "express";
import cors from "cors";
import { InvalidRoute } from "./invalidRoute";
import logger from "morgan";
import helment from "helmet";

const router: Router = Router();

let environment: any = process.env.ENV || "DEVELOPMENT";
if (environment != "STAGING") router.use(logger("dev"));

router.use(
  cors({
    optionsSuccessStatus: 200,
    origin: "*",
  })
);
router.use(helment());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

let api_route: string = process.env.API_ROUTE ?? "/api/v1";

router.use(
  `${api_route}/:path`,
  (req: Request, resp: Response, next): undefined | null | boolean => {
    const path: string = req.params.path;

    if (!path) {
      router.use(InvalidRoute);
      return;
    }

    const pathSegments: string[] = req?.originalUrl
      .split("/")
      .filter((segment) => segment !== "");

    const lastPathSegment = pathSegments[pathSegments.length - 1].split("?")[0];

    if (LET_BYPASS_ROUTES.includes(lastPathSegment)) {
      if (req.body == undefined) {
        resp.status(400).json({ success: false, msg: "invalid parameters" });
        return;
      }
      next();
      return;
    }

    next();
  }
);

export { router as AuthMiddleware };
