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
  photo: String,
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

const User = new mongoose.model("User", userSchema);

module.exports = User;
