import express from 'express';
import {
  createGame,
  deleteGame,
  getGame,
  updateGame,
  getAllGames,
  getGamesHistory,
} from '../controllers/gameController.js';
import { verifyToken } from '../jwt/verifyToken.js';
const router = express.Router();

// update game
router.post('/', verifyToken, createGame);

// update game
router.put('/:id', verifyToken, updateGame);

// delete game
router.delete('/:id', verifyToken, deleteGame);

// get a game
router.get('/find/:id', getGame);

// get all games
router.get('/findall', getAllGames);

router.get('/getHistory/:id', getGamesHistory);

export default router;
