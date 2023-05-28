import { googleAuthService, signInService, signUpService } from '../service/authService.js';

export const signUp = async (req, res, next) => {
  signUpService(req, res, next);
};

export const signIn = async (req, res, next) => {
  signInService(req, res, next);
};

export const googleAuth = async (req, res, next) => {
  googleAuthService(req, res, next);
};
