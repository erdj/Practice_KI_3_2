import { createError } from '../error/createError.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Game from '../models/Game.js';
import bcrypt from 'bcrypt';

export const createRoomService = async (req, res, next) => {
  try {
    console.log(req.body);
    const hash = bcrypt.hashSync(req.body.password, 10);
    const room = new Room({
      ...req.body,
      password: hash,
      creatorId: req.body.creatorId ? req.body.creatorId : req.user.id,
    });
    await room.save();

    const { password: dontSendPassword, ...others } = room._doc;
    res.status(200).json({ message: 'The room has been created', room: { ...others } });
  } catch (err) {
    next(createError(400, err.message));
  }
};

export const updateRoomService = async (req, res, next) => {
  try {
    const roomToUpdate = await Room.findById(req.params.id);
    if (roomToUpdate) {
      const roomDoc = roomToUpdate._doc;
      if (req.user.id === roomDoc.creatorId || req.user.role === 'admin') {
        const reqPassword = req.body.password;
        const password = reqPassword ? bcrypt.hashSync(reqPassword, 10) : null;

        const dataToUpdate = password ? { ...req.body, password } : { ...req.body };
        const updatedRoom = await Room.findByIdAndUpdate(
          roomDoc._id,
          {
            $set: {
              ...dataToUpdate,
            },
          },
          {
            new: true,
          },
        );
        const { password: dontSendPassword, ...others } = updatedRoom._doc;
        res.status(200).json({ message: 'Room has been updated', room: { ...others } });
      } else {
        return next(createError(404, 'You can update only you room'));
      }
    } else {
      return next(createError(404, "The room was'nt found"));
    }
  } catch (err) {
    next(createError(400, err.message));
  }
};

export const deleteRoomService = async (req, res, next) => {
  try {
    const roomToDelete = await Room.findById(req.params.id);
    if (roomToDelete) {
      const roomDoc = roomToDelete._doc;
      if (roomDoc.creatorId === req.user.id || req.user.role === 'admin') {
        const deletedRoom = await Room.findByIdAndDelete(roomDoc._id);
        const { password: dontSendPassword, ...others } = deletedRoom._doc;
        res.status(200).json({
          message: 'The room has been deleted',
          room: {
            ...others,
          },
        });
      } else {
        next(createError(404, 'You can delete only your room'));
      }
    } else {
      next(createError(404, "The room was'nt found"));
    }
  } catch (err) {
    next(createError(400, err.message));
  }
};

export const getRoomService = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room) {
      const { password: dontSendPassword, ...others } = room._doc;
      res.status(200).json({ ...others });
    } else {
      res.status(200).json('Room not found');
    }
  } catch (err) {
    next(createError(404, err.message));
  }
};

export const getAllRoomsService = async (req, res, next) => {
  try {
    const reqRooms = await Room.find();
    const rooms = reqRooms.map((room) => {
      const { password: dontSendPassword, ...others } = room._doc;
      return { ...others };
    });
    res.status(200).json({ rooms });
  } catch (err) {
    next(createError(404, err.message));
  }
};
