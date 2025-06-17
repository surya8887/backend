import { Document, Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config({ path: ".env" });

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  photo: string;
  dob: Date;
  gender: "male" | "female";
  role: "admin" | "user";
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  age?: number;

  validatePassword(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      required: [true, "Please enter your ID"],
    },
    photo: {
      type: String,
      required: [true, "Please enter your photo"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: [true, "Please enter your role"],
    },
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please specify gender"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter your date of birth"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: validator.isEmail,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property
userSchema.virtual("age").get(function (this: IUser) {
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Hash password
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method: Validate password
userSchema.methods.validatePassword = async function (inputPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(inputPassword, this.password);
  } catch (err) {
    console.error('Password validation error:', err);
    return false;
  }
};

// Method: Generate Access Token
userSchema.methods.generateAccessToken = function (this: IUser): string {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "1h",
    }
  );
};

// Method: Generate Refresh Token
userSchema.methods.generateRefreshToken = function (this: IUser): string {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "1d",
    }
  );
};

const User = model<IUser>("User", userSchema);
export default User;
