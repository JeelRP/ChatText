const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next()
  }
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.matchPassword = async function (enteredPassword)  {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema);
module.exports = User;