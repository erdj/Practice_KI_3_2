import { mongoose } from 'mongoose';

const GameSchema = new mongoose.Schema(
  {
    creatorId: { type: String, required: true },
    guestId: { type: String, required: true },
    roomId: { type: String, required: true },
    result: {
      creator: { type: String, default: '' },
      guest: { type: String, default: '' },
      winner: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

export default mongoose.model('Game', GameSchema);
