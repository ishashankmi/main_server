import { Router } from 'express';
import { STATUS_CODE } from '../../../../config';
const router = Router();
router.use('*', (req, resp)=>{
    resp.status(STATUS_CODE.BAD_REQUEST).end();
})

export {router as InvalidRoute};