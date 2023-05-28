import express from 'express';
import {
  createGameHistory,
  deleteGameHistory,
  getGameHistory,
  updateGameHistory,
} from '../controllers/gameHistoryController.js';
import { verifyToken } from '../jwt/verifyToken.js';
const router = express.Router();

// create gameHistory
router.post('/', verifyToken, createGameHistory);

// update gameHistory
// router.put('/:id', verifyToken, updateGameHistory);
router.put('/:id', updateGameHistory);

// delete gameHistory
router.delete('/:id', deleteGameHistory);

// get a gameHistory
router.get('/find/:id', verifyToken, getGameHistory);

export default router;
