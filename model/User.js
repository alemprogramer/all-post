const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "please enter a valid email"],
      trim: true,
      unique: true,
    },
    password: String,
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
