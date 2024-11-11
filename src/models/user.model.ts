import mongoose, { Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  name: string;
  googleId?: string;
  accessToken?: string;
  refreshToken?: string;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  googleId: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
