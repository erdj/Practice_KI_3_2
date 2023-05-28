export type UserResponse = {
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    img: string;
    fromGoogle: boolean;
    isOnline: boolean;
    gameHistoryId: string;
    roomId: string;
    gameId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};

export type User = {
  wins: number;
  looses: number;
  img: string;
  roomId: string;
  gameId: string;
  _id: string;
  name: string;
  email: string;
  isOnline: boolean;
  fromGoogle: boolean;
  gameHistoryId: string;
  createdAt: string;
  updatedAt: string;
};

type Auth = {
  password: string;
  name: string;
  email: string;
};

export type SigninInfo = Omit<Auth, 'email'>;

export type GoogleInfo = {
  name: string | null;
  email: string | null;
};

export type SignupInfo = {} & Auth;

export type UserRes = {
  user: {
    wins: number;
    looses: number;
    img: string;
    roomId: string;
    gameId: string;
    _id: string;
    name: string;
    email: string;
    isOnline: boolean;
    fromGoogle: boolean;
    gameHistoryId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};
