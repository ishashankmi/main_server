import { Router } from 'express';
import { AutheticateUser } from '../../../../../config/authentication';
import { LobbyController } from '../../../../../controller/lobby';

const router = Router();

router.get('/:lobby_id', AutheticateUser(true), LobbyController.getLobbyById);
router.get('/', AutheticateUser(true), LobbyController.getLobbyList);
router.post('/', AutheticateUser(true), LobbyController.addLobby);
router.delete('/', AutheticateUser(true), LobbyController.deleteLobby);
router.put('/', AutheticateUser(true), LobbyController.updateLobby);


export { router as UserLobbyRouter };