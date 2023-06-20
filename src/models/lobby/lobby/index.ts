import { db } from "../../../database/connection";
import { LobbySchema } from "../../../database/schema";

export const LobbyModel = db.model("Lobby", LobbySchema);
