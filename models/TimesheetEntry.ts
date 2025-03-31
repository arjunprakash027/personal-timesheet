// models/TimesheetEntry.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface defining the structure of a Timesheet Entry document
export interface ITimesheetEntry extends Document {
  date: Date;
  taskActivity: string;
  categoryProject?: string; // Optional
  focus?: number; // Assuming 1-5 or similar scale
  energy?: number; // Assuming 1-5 or similar scale
  outcomeResult?: string;
  learningsReflections?: string;
  productivity?: number; // Assuming 1-5 or similar scale
  enjoyment?: number; // Assuming 1-5 or similar scale
  challenge?: number; // Assuming 1-5 or similar scale
  comments?: string;
  createdAt?: Date; // Automatically added by timestamps
  updatedAt?: Date; // Automatically added by timestamps
}

// Mongoose Schema definition matching the interface
const TimesheetEntrySchema: Schema<ITimesheetEntry> = new Schema({
  date: {
    type: Date,
    required: [true, 'Date is required.'],
    index: true // Index for faster date-based queries
  },
  taskActivity: {
    type: String,
    required: [true, 'Task/Activity is required.'],
    trim: true
  },
  categoryProject: {
    type: String,
    trim: true
  },
  focus: {
    type: Number,
    min: 1,
    max: 5
  },
  energy: {
    type: Number,
    min: 1,
    max: 5 
  },
  outcomeResult: {
    type: String,
    trim: true
  },
  learningsReflections: {
    type: String,
    trim: true
  },
  productivity: {
    type: Number,
    min: 1,
    max: 5 
  },
  enjoyment: {
    type: Number,
    min: 1,
    max: 5 
  },
  challenge: {
    type: Number,
    min: 1,
    max: 5 
  },
  comments: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create and export the Mongoose model
// Check if the model already exists before defining it to prevent overwrite errors during hot reloading
const TimesheetEntry: Model<ITimesheetEntry> = mongoose.models.TimesheetEntry || mongoose.model<ITimesheetEntry>('TimesheetEntry', TimesheetEntrySchema);

export default TimesheetEntry;