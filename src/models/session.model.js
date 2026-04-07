import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    refreshToken: {
      type: String,
      required: true,
      unique: true
    },

    device: String,
    ipAddress: String,

    expiresAt: {
      type: Date,
      required: true
    },

    revoked: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);