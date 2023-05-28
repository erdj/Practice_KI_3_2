import { mongoose } from 'mongoose';

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    creatorId: { type: String, required: true },
    password: { type: String, default: '' },
    guestId: { type: String, default: '' },
    gameId: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('Room', RoomSchema);
