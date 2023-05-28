import express from 'express';
import userRouter from './userRouter.js';
import authRouter from './authRouter.js';
import roomRouter from './roomRouter.js';
import gameRouter from './gameRouter.js';
import gameHistoryRouter from './gameHistoryRouter.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/rooms', roomRouter);
router.use('/games', gameRouter);
router.use('/games_history', gameHistoryRouter);

export default router;
