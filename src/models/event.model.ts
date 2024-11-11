import mongoose, { Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  participants: string[];
  date: Date;
  time: string;
  duration: number;
  sessionNotes?: string;
  googleCalendarId?: string;
  userId: mongoose.Schema.Types.ObjectId;
}

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  participants: [{ type: String }],
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  sessionNotes: { type: String },
  googleCalendarId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Event = mongoose.model<IEvent>('Event', eventSchema);
export default Event;
