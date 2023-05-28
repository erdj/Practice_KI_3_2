export type GameT = {
  _id: string;
  creatorId: string;
  guestId: string;
  roomId: string;
  result: { creator: Turn; guest: Turn; winner: string | 'draw' };

  createdAt: string;
  updatedAt: string;
};

export type GameRes = {
  game: {
    result: { creator: string; guest: string; winner: string };
    _id: string;
    creatorId: string;
    guestId: string;
    roomId: string;
    createdAt: string;
    updatedAt: string;
    __v: 0;
  };
};

export type Turn = 'rock' | 'scissors' | 'paper' | '';
