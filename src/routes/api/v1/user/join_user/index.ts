import { JoinUserController } from "../../../../../controller";
import { Router } from "express";
const router = Router();

router.post('/', JoinUserController.addUserJoin);
router.get('/', JoinUserController.pendinglist);
router.put('/', JoinUserController.updateById);
router.delete('/', JoinUserController.deleteById);

export { router as UserJoinRouter };