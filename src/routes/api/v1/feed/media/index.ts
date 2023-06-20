import { Router } from "express";

const router = Router();

router.get('/', (req, resp)=>{
    console.log('media feed here');
    resp.json({success:'ok'});
});

export { router as MediaFeedRoute };