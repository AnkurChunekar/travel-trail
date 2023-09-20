const mongoose = require("mongoose");

const schema = mongoose.Schema({
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
    minLength: [8, "password must be atleast of 8 characters"]
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your email"]
  }
});

const User = new mongoose.model("User", schema);

module.exports = User;
