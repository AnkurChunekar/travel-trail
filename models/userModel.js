const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { ROLES } = require("../constants");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      // eslint-disable-next-line object-shorthand
      validator: function validateEmail(email) {
        // Regular expression to match a valid email address
        const regex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        // Return true if the email string matches the regular expression
        // if false then we get walidation error.
        return regex.test(email);
      },
      message: "Please enter a valid email."
    }
  },
  name: { type: String, required: [true, "Please provide your name"] },
  photo: { type: String, default: "default.jpg" },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minLength: [8, "password must be atleast of 8 characters"],
    select: false
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER
  },
  passwordResetToken: String,
  passwordResetTokenExpiry: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre("save", async function userSchemaPre(next) {
  console.log("Inside user model pre save middleware");
  // only run if password was modified or first time
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
  }

  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isNew && this.isModified("password")) {
    this.passwordChangedAt = Date.now();
  }

  next();
});

userSchema.pre(/^find/, async function () {
  this.find({ active: { $ne: false } });
});

userSchema.methods.isPasswordCorrect = (password, hashedPassword) =>
  bcrypt.compare(password, hashedPassword);

userSchema.methods.passChangedAfterToken = function passChangedAfterToken(
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createResetPassToken = function resetPassToken() {
  // Generate a random 32-byte hex string
  const code = crypto.randomBytes(32).toString("hex");

  // Hash the random hex string using the SHA-256 algorithm
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  this.passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000;

  return code;
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
