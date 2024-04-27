const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const validator=require("validator")
require("dotenv").config()

const userSchema = new mongoose.Schema({
  nam: {
    type: String,
    required: true,
    trim: true,
    minLength:3

  },
  Email: {
    type: String,

    required: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: function (value) {
          return validator.isEmail(value);
      },
      message: "Invalid Email"
  }

  },
  Number: {
    type: Number,
    minLength: 10,
    required: true,
    unique: true

  },
  DOB: {
    type: Date,
    required: true
  },
  password: {
    type: String,
    required: true,
    minLength: 5
  },
  tokens: [
    { token: { type: String, required: true } }
  ]
});
userSchema.methods.generatetoken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY, { expiresIn: '2h' });
    this.tokens = this.tokens.concat({ token });
    await this.save();
    
    return token;
  } catch (error1) {
    console.log("error in generating token", error1);

  }


}
userSchema.pre("save", async function (next) {
  try {


    if (!this.isModified("password")) {
      return next();
    }
    else {
      const hashpassword = await bcrypt.hash(this.password, 10);
      this.password = hashpassword;
      next();
    }

  } catch (error) {
    console.log('error in generating hash', error);
    res.status(400).send(error)

  }
})
const User = mongoose.model('User', userSchema);
module.exports = User;