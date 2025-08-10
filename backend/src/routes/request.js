const express = require('express');
const router = express.Router();
const { UserModel } = require('./models/user');
const { BookModel } = require('./models/book');

router.get('/requested-books', async (req, res) => {
  const requests = await UserModel.find({ role: 'guest' })
    .populate('bookRequests')
    .exec();

  const requestedBooks = requests.map((request) => {
    return {
      username: request.username,
      bookName: request.bookRequests.bookName,
      bookISBN: request.bookRequests.bookISBN,
    };
  });

  res.json(requestedBooks);
});

module.exports = request;