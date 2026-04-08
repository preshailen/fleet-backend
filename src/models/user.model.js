import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  roles: {
    type: String,
    enum: ['SUPER_ADMIN','ADMIN','SUPPLIER','USER'],
    default: ['USER']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);