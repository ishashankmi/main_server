import { Router } from 'express';
import { UserLobbyRouter } from './lobby';
import { UserLobbyRequestRouter } from './request';

const router = Router();

router.use('/request', UserLobbyRequestRouter);
router.use(UserLobbyRouter);

export { router as LobbyRouter }