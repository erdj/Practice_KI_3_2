import { createError } from '../error/createError.js';
import User from '../models/User.js';
import GameHistory from '../models/GameHistory.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signUpService = async (req, res, next) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10);
    const newUser = new User({ ...req.body, password: hash });
    const newGameHistory = new GameHistory({ userId: newUser._id, gamesId: [] });
    newUser.gameHistoryId = newGameHistory._id;
    await newUser.save();
    await newGameHistory.save();

    const { password, ...others } = newUser._doc;
    const token = jwt.sign(
      { id: newUser._id, role: newUser._doc.role },
      process.env.JWT_SECRET_KEY,
    );
    console.log('token', token);
    console.log(jwt.decode(token, process.env.JWT_SECRET_KEY));
    res
      .cookie('access_token', token, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: 'User has been created', user: { ...others } });
  } catch (err) {
    next(createError(404, err.message));
  }
};

export const signInService = async (req, res, next) => {
  const { name: reqName, password: reqPassword } = req.body;

  const user = await User.findOne({ name: reqName });
  if (!user) return next(createError(400, 'User not found!'));

  const isCorrectPassword = bcrypt.compareSync(reqPassword, user.password);
  if (!isCorrectPassword) return next(createError(400, 'Wrong Credentials!'));

  const token = jwt.sign({ id: user._id, role: user._doc.role }, process.env.JWT_SECRET_KEY);
  console.log(jwt.decode(token, process.env.JWT_SECRET_KEY));
  const { password, ...others } = user._doc;

  res
    .cookie('access_token', token, {
      httpOnly: true,
    })
    .status(200)
    .json({ message: 'User has logged in', user: { ...others } });
};

export const googleAuthService = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id, role: user._doc.role }, process.env.JWT_SECRET_KEY);

      res
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .status(200)
        .json({ message: 'User has authorized with google', user: user._doc });
    } else {
      const newUser = new User({
        ...req.body,
        fromGoogle: true,
      });

      const newGameHistory = new GameHistory({ userId: newUser._id, gamesId: [] });
      newUser.gameHistoryId = newGameHistory._id;
      const savedUser = await newUser.save();
      await newGameHistory.save();
      const token = jwt.sign(
        { id: savedUser._id, role: savedUser._doc.role },
        process.env.JWT_SECRET_KEY,
      );

      res
        .cookie('access_token', token, {
          httpOnly: true,
        })
        .status(200)
        .json({ message: 'User has authorized with google', user: savedUser._doc });
    }
  } catch (err) {
    next(err);
  }
};
