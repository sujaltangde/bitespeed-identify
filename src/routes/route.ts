import { Router } from 'express';
import { identify } from '../controllers/controller';

const router = Router();

router.post('/', identify);

export default router;
