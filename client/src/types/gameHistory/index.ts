export type GameHistoryType = {
  gamesId: string[];
  userId: string;
};

export type GH = {
  result: {
    creator: string;
    guest: string;
    winner: string;
  };
  _id: string;
  creatorId: string;
  guestId: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
  __v: 0;
}[];
