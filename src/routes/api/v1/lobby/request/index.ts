import { Router } from 'express';
import { LobbyRequestController } from '../../../../../controller/lobby';
import { AutheticateUser } from '../../../../../config/authentication';
import { InvalidRoute } from '../../_middleware/invalidRoute';
const router = Router();

// FOR USER TO JOIN LOBBY
router.put('/', AutheticateUser(true),LobbyRequestController.requestLobbyJoin);

// FOR OWNER TO ACCEPT OR REJECT REQUEST
router.put('/startSession', AutheticateUser(true), LobbyRequestController.startLobbySession);
router.put('/accept', AutheticateUser(true), LobbyRequestController.acceptLobbyJoin);
router.put('/reject', AutheticateUser(true), LobbyRequestController.rejectLobbyJoin);
router.put('/kick', AutheticateUser(true), LobbyRequestController.kickUserFromLobby);
router.put('/leave', AutheticateUser(true), LobbyRequestController.leaveLobby);
router.post('/token', AutheticateUser(true), LobbyRequestController.getLobbyToken);

// ELSE INVALID ROUTES
router.use(InvalidRoute);

export { router as UserLobbyRequestRouter };