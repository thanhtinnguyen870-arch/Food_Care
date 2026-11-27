import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ['Thành viên', 'Vàng', 'Kim Cương'],
      default: 'Thành viên',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    healthProfile: {
      age: Number,
      gender: String,
      height: Number,
      weight: Number,
      conditions: [String],
      allergies: [String],
      goal: String,
      dietType: String,
      activityLevel: String,
    },
    favoriteFoods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;

