import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { NAME_MAX_LENGTH } from "@/features/auth/constants";

// Each extra round doubles the hashing time; 12 keeps brute force expensive and logins fast enough
const BCRYPT_SALT_ROUNDS = 12;

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  favorites: string[];
  watchlist: string[];
  preferences: {
    genres: string[];
    language: string;
  };
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  subscriptionId?: string;
  subscriptionPriceId?: string;
  subscriptionInterval?: "month" | "year";
  currentPeriodEnd?: Date;
  cancelAt?: Date | null;
  trialEnd?: Date | null;
  hasUsedTrial: boolean;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      // Basic shape check only; the API validates emails with zod before they reach the model.
      // The previous regex rejected valid addresses with longer TLDs such as .info or .studio.
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      // Only the bcrypt hash is stored (always 60 characters), so length rules live in the zod schema
      required: [true, "Password is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [NAME_MAX_LENGTH, `Name cannot exceed ${NAME_MAX_LENGTH} characters`],
    },
    favorites: [
      {
        type: String,
        trim: true,
      },
    ],
    // Movies to watch later (Premium and Pro), kept after a downgrade
    watchlist: [{ type: String, trim: true }],
    preferences: {
      genres: [
        {
          type: String,
          trim: true,
        },
      ],
      language: {
        type: String,
        default: "en",
        trim: true,
      },
    },
    avatar: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    subscriptionStatus: {
      type: String,
      enum: [
        "free",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "paused",
        "trialing",
        "unpaid",
      ],
      default: "free",
    },
    subscriptionPlan: {
      type: String,
      enum: ["basic", "premium", "pro"],
      default: "basic",
    },
    // Copied from Stripe on every sync (see toSubscriptionFields); Stripe stays the source of truth
    subscriptionId: { type: String },
    subscriptionPriceId: { type: String },
    subscriptionInterval: { type: String, enum: ["month", "year"] },
    currentPeriodEnd: { type: Date },
    cancelAt: { type: Date, default: null },
    trialEnd: { type: Date, default: null },
    // One free trial per account, even after canceling
    hasUsedTrial: { type: Boolean, default: false },
    // Only a hash of the emailed token; never loaded unless a query asks for it
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const { _id, password, __v, ...object } = ret;
        const newObject = { id: _id, ...object };
        return newObject;
      },
    },
  },
);

UserSchema.index({ createdAt: -1 });

// A rejected promise (e.g. bcrypt fails) aborts the save
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User =
  (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", UserSchema);

export default User;
