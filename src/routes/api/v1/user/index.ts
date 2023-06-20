import express from "express";
const router = express.Router();

import { AutheticateUser } from "../../../../config/authentication";
import { UserJoinRouter } from "./join_user";
import { Router } from "./user";

router.use(Router);
router.use('/join', AutheticateUser(true), UserJoinRouter);


export { router as UserRoute };
