import {
  createGameService,
  deleteGameService,
  getAllGamesService,
  getGameService,
  getGamesHistoryService,
  updateGameService,
} from '../service/gameService.js';

export const createGame = async (req, res, next) => {
  createGameService(req, res, next);
};
export const updateGame = async (req, res, next) => {
  updateGameService(req, res, next);
};
export const deleteGame = async (req, res, next) => {
  deleteGameService(req, res, next);
};
export const getGame = async (req, res, next) => {
  getGameService(req, res, next);
};
export const getAllGames = async (req, res, next) => {
  getAllGamesService(req, res, next);
};

export const getGamesHistory = async (req, res, next) => {
  getGamesHistoryService(req, res, next);
};
