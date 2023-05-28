import {
  deleteUserService,
  getOnlineUsersService,
  getUserService,
  getUsersService,
  updateUserService,
} from '../service/userService.js';

export const updateUser = async (req, res, next) => {
  updateUserService(req, res, next);
};

export const deleteUser = async (req, res, next) => {
  deleteUserService(req, res, next);
};

export const getUser = async (req, res, next) => {
  getUserService(req, res, next);
};

export const getUsers = async (req, res, next) => {
  getUsersService(req, res, next);
};

export const getOnlineUsers = async (req, res, next) => {
  getOnlineUsersService(req, res, next);
};
