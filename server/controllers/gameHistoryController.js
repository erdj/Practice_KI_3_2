import {
  createGameHistoryService,
  deleteGameHistoryService,
  getGameHistoryService,
  updateGameHistoryService,
} from '../service/gameHistoryService.js';

export const createGameHistory = async (req, res, next) => {
  createGameHistoryService(req, res, next);
};

export const updateGameHistory = async (req, res, next) => {
  updateGameHistoryService(req, res, next);
};
export const deleteGameHistory = async (req, res, next) => {
  deleteGameHistoryService(req, res, next);
};
export const getGameHistory = async (req, res, next) => {
  getGameHistoryService(req, res, next);
};
