import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String, required: true },
  isRecurring: { type: Boolean, required: true },
  recurrenceRule: { type: String },
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema);
