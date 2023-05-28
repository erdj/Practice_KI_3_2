import { mongoose } from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    isOnline: { type: Boolean, default: false },
    gameHistoryId: { type: String, default: '' },
    fromGoogle: { type: Boolean, default: false },
    password: { type: String, default: '' },
    img: { type: String, default: '' },
    roomId: { type: String, default: '' },
    gameId: { type: String, default: '' },
    role: { type: String, default: 'user' },
    wins: { type: Number, default: 0 },
    looses: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('User', UserSchema);
