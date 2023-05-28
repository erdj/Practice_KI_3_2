import express from 'express';
import {
  getUser,
  deleteUser,
  updateUser,
  getUsers,
  getOnlineUsers,
} from '../controllers/userController.js';
import { verifyToken } from '../jwt/verifyToken.js';
import { getStat, loose, win } from '../service/userService.js';

const router = express.Router();

// update user
router.put('/:id', verifyToken, updateUser);

// delete user
router.delete('/:id', verifyToken, deleteUser);

// get a user
router.get('/find/:id', getUser);

// get all users
router.get('/findall', getUsers);

// get all online users
router.get('/findallOnline', getOnlineUsers);

router.get('/win/:id', win);
router.get('/loose/:id', loose);
router.get('/stats/:id', getStat);

export default router;
