import { createError } from '../error/createError.js';
import GameHistory from '../models/GameHistory.js';

export const createGameHistoryService = async (req, res, next) => {
  try {
    const gameHistory = new GameHistory({ userId: req.user.id });
    await gameHistory.save();
    res.status(200).json({ message: 'GameHistory has been created', gameHistory });
  } catch (err) {
    next(createError(404, err.message));
  }
};

export const updateGameHistoryService = async (req, res, next) => {
  try {
    const history = await GameHistory.findById(req.params.id);
    if (history) {
      const updatedHistory = await GameHistory.findByIdAndUpdate(
        history._id,
        {
          $addToSet: {
            gamesId: req.body.gameId,
          },
        },
        {
          new: true,
        },
      );
      res
        .status(200)
        .json({ message: 'GameHistory has been updated', gameHistory: updatedHistory._doc });
    } else {
      next(createError(404, "GameHistory wasn't found"));
    }
  } catch (err) {
    next(createError(404, err.message));
  }
};

export const deleteGameHistoryService = async (req, res, next) => {
  try {
    const deletedGameHistory = await GameHistory.findByIdAndDelete(req.params.id);
    if (deletedGameHistory) {
      res
        .status(200)
        .json({ message: 'GameHistory has been deleted', gameHistory: deletedGameHistory._doc });
    } else {
      next(createError(404, "GameHistory wasn't found"));
    }
  } catch (err) {
    next(createError(400, err.message));
  }
};

export const getGameHistoryService = async (req, res, next) => {
  try {
    const gameHistory = await GameHistory.findById(req.params.id);
    if (gameHistory) {
      res.status(200).json({ gameHistory: gameHistory._doc });
    } else {
      next(createError(404, "GameHistory wasn't found"));
    }
  } catch (err) {
    next(createError(400, err.message));
  }
};
