import {
  createRoomService,
  deleteRoomService,
  getAllRoomsService,
  getRoomService,
  updateRoomService,
} from '../service/roomService.js';

export const createRoom = async (req, res, next) => {
  createRoomService(req, res, next);
};

export const updateRoom = async (req, res, next) => {
  updateRoomService(req, res, next);
};

export const deleteRoom = async (req, res, next) => {
  deleteRoomService(req, res, next);
};

export const getRoom = async (req, res, next) => {
  getRoomService(req, res, next);
};

export const getAllRooms = async (req, res, next) => {
  getAllRoomsService(req, res, next);
};
