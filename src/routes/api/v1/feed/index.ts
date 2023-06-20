import { Router } from "express";
import { LobbyFeedRoute } from "./lobby";
import { MediaFeedRoute } from "./media";
import { AutheticateUser } from "../../../../config/authentication";

const router = Router();

router.use('/lobby', AutheticateUser(true), LobbyFeedRoute);
router.use('/', MediaFeedRoute);

export { router as Feed }