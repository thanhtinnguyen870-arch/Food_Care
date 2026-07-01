import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true, // e.g., 'REVIEW'
    },
    message: {
      type: String,
      required: true,
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
