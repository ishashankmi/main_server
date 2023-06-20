import { db } from "../../../database/connection";
import { LobbyRequestSchema } from "../../../database/schema";

export const LobbyRequestModel = db.model('LobbyRequest', LobbyRequestSchema);
