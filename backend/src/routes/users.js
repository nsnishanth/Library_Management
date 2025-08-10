const router = require("express")()
const { BookModel } = require("../models/book")
const { UserModel } = require("../models/user")

const omitPassword = (user) => {
  const { password, ...rest } = user
  return rest
}

router.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find({})
    return res.status(200).json({ users: users.map((user) => omitPassword(user.toJSON())) })
  } catch (err) {
    next(err)
  }
})

router.post("/borrow", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    if (book.borrowedBy.length === book.quantity) {
      return res.status(400).json({ error: "Book is not available" })
    }
    const user = await UserModel.findById(req.body.userId)
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    if (book.borrowedBy.includes(user.id)) {
      return res.status(400).json({ error: "You've already borrowed this book" })
    }
    await book.update({ borrowedBy: [...book.borrowedBy, user.id] })
    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.post("/return", async (req, res, next) => {
  try {
    const book = await BookModel.findOne({ isbn: req.body.isbn })
    if (book == null) {
      return res.status(404).json({ error: "Book not found" })
    }
    const user = await UserModel.findById(req.body.userId)
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    if (!book.borrowedBy.includes(user.id)) {
      return res.status(400).json({ error: "You need to borrow this book first!" })
    }
    console.log("user.id", user.id)
    console.log("book.borrowedBy", book.borrowedBy)
    console.log(
      "filtered",
      book.borrowedBy.filter((borrowedBy) => !borrowedBy.equals(user.id))
    )
    await book.update({
      borrowedBy: book.borrowedBy.filter((borrowedBy) => !borrowedBy.equals(user.id)),
    })
    const updatedBook = await BookModel.findById(book.id)
    return res.status(200).json({
      book: {
        ...updatedBook.toJSON(),
        availableQuantity: updatedBook.quantity - updatedBook.borrowedBy.length,
      },
    })
  } catch (err) {
    next(err)
  }
})
// In your backend
router.post("/request", async (req, res, next) => {
  try {
    const { isbn, userId, requestedDate } = req.body
    const book = await BookModel.findOne({ isbn })

    if (!book) {
      return res.status(404).json({ error: "Book not found" })
    }

    if (book.requestedBy.includes(userId)) {
      return res.status(400).json({ error: "You have already requested this book" })
    }

    await book.update({ $push: { requestedBy: userId, requestDate: requestedDate } })
    return res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
})

// For canceling a request
router.post("/cancel-request", async (req, res, next) => {
  try {
    const { isbn, userId } = req.body
    const book = await BookModel.findOne({ isbn })

    if (!book) {
      return res.status(404).json({ error: "Book not found" })
    }

    if (!book.requestedBy.includes(userId)) {
      return res.status(400).json({ error: "You haven't requested this book" })
    }

    await book.update({ $pull: { requestedBy: userId } })
    return res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
})

router.get("/borrowed-books", async (req, res, next) => {
  // try {
  //   const result = await BookModel.find()
  //   console.log(result)
  //   return res.status(200).json({ books: result })
  // } catch (err) {
  //   next(err)
  // }
  try {
    // Fetch all books
    const books = await BookModel.find().lean() // `lean()` returns plain JavaScript objects

    // Extract all unique `borrowedBy` user IDs
    const userIds = [...new Set(books.flatMap((book) => book.borrowedBy))]

    // Fetch the corresponding users
    const users = await UserModel.find(
      { _id: { $in: userIds } }, // Query for matching user IDs
      { _id: 1, username: 1 } // Select only `_id` and `username`
    ).lean()

    // Create a mapping of user IDs to usernames
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user.username // Convert `_id` to string
      return acc
    }, {})

    // Replace `borrowedBy` IDs with usernames in each book
    const updatedBooks = books.map((book) => ({
      ...book,
      borrowedBy: book.borrowedBy.map((id) => userMap[id] || id), // Replace ID with username
    }))

    // Respond with the updated books
    return res.status(200).json({ books: updatedBooks })
  } catch (err) {
    next(err)
  }
})

router.get("/borrowed-books/user-id", async (req, res, next) => {
  try {
    // Fetch only the `borrowedBy._id` field
    const result = await BookModel.find({}, { "borrowedBy._id": 1 })

    // Extract user IDs and flatten the array
    const userIds = result.flatMap((book) => book.borrowedBy.map((borrower) => borrower._id))

    return res.status(200).json({ userIds })
  } catch (err) {
    next(err)
  }
})

router.get("/profile", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.session.userId)
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    return res.status(200).json({ user: omitPassword(user.toJSON()) })
  } catch (err) {
    next(err)
  }
})

router.post("/login", async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ username: req.body.username })
    if (user == null) {
      return res.status(404).json({ error: "User not found" })
    }
    if (user.password !== req.body.password) {
      return res.status(400).json({ error: "Invalid password" })
    }
    console.log("user.id", user.id)
    req.session.userId = user.id
    return res.status(200).json({ user: omitPassword(user.toJSON()) })
  } catch (err) {
    next(err)
  }
})

router.get("/logout", (req, res) => {
  req.session.destroy()
  return res.status(200).json({ success: true })
})

module.exports = { router }
