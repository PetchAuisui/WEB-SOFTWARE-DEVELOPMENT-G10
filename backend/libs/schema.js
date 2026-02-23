const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: String,
  userName: String,
  fullName: String,
  email: String,
  userLevel: String,
  userState: String,
  password: String,
  dateCreate: Date,
  dateExpire: Date,
})

const deviceSchema = new Schema({
  _id: String,
  name: String,
  type: String,
  status: String,
  script: String,
})

module.exports = {
  mongoose: mongoose,
  userSchema: userSchema,
  deviceSchema: deviceSchema, 
}