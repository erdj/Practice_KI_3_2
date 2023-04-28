export type RoomT = {
  _id: string;
  name: string;
  creatorId: string;
  guestId: string;
  gameId: string;
  createdAt: string;
  updatedAt: string;

  password?: string;
};
