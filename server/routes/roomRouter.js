import express from 'express';
import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getRoom,
  updateRoom,
} from '../controllers/roomController.js';
import { verifyToken } from '../jwt/verifyToken.js';

const router = express.Router();

// create room
router.post('/', verifyToken, createRoom);

// // update room
router.put('/:id', verifyToken, updateRoom);

// // delete room
router.delete('/:id', verifyToken, deleteRoom);

// // get a room
router.get('/find/:id', getRoom);

// // get all rooms
router.get('/findall', getAllRooms);

export default router;
