import { createError } from '../error/createError.js';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const updateUserService = async (req, res, next) => {
  if (req.params.id === req.user.id || req.user.role === 'admin') {
    const { email, gameHistoryId, fromGoogle } = req.body;
    if (email || gameHistoryId || fromGoogle)
      return next(
        createError(404, 'You can not overwrite email or gameHistoryId or froomGoogle fields'),
      );
    try {
      const { password: reqPassword } = req.body;
      const password = reqPassword ? bcrypt.hashSync(reqPassword, 10) : null;

      const dataToUpdate = password ? { ...req.body, password } : { ...req.body };
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: dataToUpdate,
        },
        {
          new: true,
        },
      );
      const { password: dontSendPassword, ...others } = updatedUser._doc;
      res.status(200).json({ message: 'User has been updated', user: { ...others } });
    } catch (err) {
      next(createError(404, err.message));
    }
  } else {
    return next(createError(403, 'You can update only your account!'));
  }
};

export const deleteUserService = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      const user = await User.findByIdAndDelete(req.user.id);
      const { password: dontSendPassword, ...others } = user._doc;
      res.status(200).json({ message: 'User has been deleted', user: { ...others } });
    } catch (err) {
      next(createError(404, err.message));
    }
  } else {
    return next(createError(403, 'You can delete only your account!'));
  }
};

export const getUserService = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const { password, ...others } = user._doc;
      res.status(200).json({ user: { ...others } });
    } else {
      next(createError(404, 'User not found'));
    }
  } catch (err) {
    next(createError(404, err.message));
  }
};

export const getUsersService = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' });
    res.status(200).json({
      users: users.map((user) => {
        const { password, ...others } = user._doc;
        return { ...others };
      }),
    });
  } catch (err) {
    next(createError(404, err.message));
  }
};

export const getOnlineUsersService = async (req, res, next) => {
  try {
    const onlineUsers = await User.find({ isOnline: true, role: 'user' });
    res.status(200).json({
      users: onlineUsers.map((user) => {
        const { password, ...others } = user._doc;
        return { ...others };
      }),
    });
  } catch (err) {
    next(createError(404, err.message));
  }
};

export const win = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { wins: 1 },
      },
      {
        new: true,
      },
    );
    res.status(200).json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    console.log('winService');
    next(createError(404, err.message));
  }
};

export const loose = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { looses: 1 },
      },
      {
        new: true,
      },
    );
    res.status(200).json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    console.log('winService');
    next(createError(404, err.message));
  }
};

export const getStat = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const result = await User.aggregate([
      {
        $project: {
          _id: 0,
          name: 1,
          wins: 1,
          looses: 1,
          difference: { $subtract: ['$wins', '$looses'] },
        },
      },
      {
        $sort: { difference: -1 },
      },
    ]);

    res.status(200).json({
      message: 'User updated',
      bestPlayer: result[0],
      worstPlayer: result[result.length - 1],
      user,
    });
  } catch (err) {
    console.log(err.message);
    next(createError(404, err.message));
  }
};
