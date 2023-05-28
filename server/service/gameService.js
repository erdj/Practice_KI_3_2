import { createError } from '../error/createError.js';
import Game from '../models/Game.js';

export const createGameService = async (req, res, next) => {
  try {
    const game = new Game({ ...req.body });
    await game.save();
    res.status(200).json({ message: 'The game has been created', game: { ...game._doc } });
  } catch (err) {
    next(createError(400, err.message));
  }
};

export const updateGameService = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    if (game) {
      const updatedGame = await Game.findByIdAndUpdate(
        game._id,
        {
          $set: {
            ...req.body,
          },
        },
        { new: true },
      );
      res.status(200).json({ message: 'Game has been updated', game: updatedGame._doc });
    } else {
      next(createError(404, "Game wasn't found"));
    }
  } catch (err) {
    console.log(err);
    next(createError(400, err.message));
  }
};

export const deleteGameService = async (req, res, next) => {
  try {
    const deletedGame = await Game.findByIdAndDelete(req.params.id);
    if (deletedGame) {
      res.status(200).json({ message: 'Game has been deleted', game: deletedGame._doc });
    } else {
      next(createError(404, "Game wasn't found"));
    }
  } catch (err) {
    next(createError(400, err.message));
  }
};

export const getGameService = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    if (game) {
      res.status(200).json({ game: game._doc });
    } else {
      next(createError(404, "Game wasn't found"));
    }
  } catch (err) {
    next(createError(400, err.message));
  }
};

export const getAllGamesService = async (req, res, next) => {
  try {
    const games = await Game.find();
    res.status(200).json({ games });
  } catch (err) {
    next(createError(400, err.message));
  }
};

export const getGamesHistoryService = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const userGames = await Game.find({ $or: [{ creatorId: userId }, { guestId: userId }] });
    res.status(200).json({ message: 'user history was found', gameHistory: userGames });
  } catch (err) {
    next(createError(400, err.message));
  }
};
