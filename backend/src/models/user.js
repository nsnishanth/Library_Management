const { model, Schema } = require("mongoose")

const bookRequestSchema = new Schema({
  bookName: { type: String, required: true },
  bookISBN: { type: String, required: true },
});

const UserModel = model(
  "users",
  new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    verified: { type: Boolean, default: false },
    bookRequests: [bookRequestSchema],
  })
)

module.exports = { UserModel }