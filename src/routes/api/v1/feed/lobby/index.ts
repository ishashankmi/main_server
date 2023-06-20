import { Router } from "express";
import { FeedLobbyController } from "../../../../../controller";

const router = Router();

router.get("/", FeedLobbyController.getUserLobby);

export { router as LobbyFeedRoute };
