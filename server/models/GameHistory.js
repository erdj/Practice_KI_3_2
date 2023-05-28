import { mongoose } from 'mongoose';

const GameHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    // game history
    gamesId: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model('GameHistory', GameHistorySchema);
