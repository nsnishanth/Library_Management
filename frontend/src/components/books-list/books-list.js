// frontend/src/components/books-list/books-list.js
import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"

import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Card,
  CardContent,
  CardActions,
  TablePagination,
  Tabs,
  Tab,
  TextField,
} from "@mui/material"
import { NotificationManager } from "react-notifications"
import { useUser } from "../../context/user-context"
import { BackendApi } from "../../client/backend-api"
import classes from "./styles.module.css"

console.log(classes.pageHeader)

export const BooksList = () => {
  const [books, setBooks] = useState([])
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [activeBookIsbn, setActiveBookIsbn] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredBooks, setFilteredBooks] = useState([])
  const { isAdmin, user } = useUser()

  useEffect(() => {
    console.log("User object:", user) // Debug user object
    fetchBooks().catch(console.error)
    fetchBorrowedBooks().catch(console.error)
  }, [user])

  const fetchBooks = async () => {
    const { books } = await BackendApi.book.getAllBooks()
    setBooks(books)
    setFilteredBooks(books)
  }

  const fetchBorrowedBooks = async () => {
    const { books } = await BackendApi.user.getBorrowBook()
    console.log(books)
    setBorrowedBooks(books)
  }

  const deleteBook = async (bookIsbn) => {
    if (bookIsbn && books.length) {
      await BackendApi.book.deleteBook(bookIsbn)
      fetchBooks().catch(console.error)
      setOpenModal(false)
      setActiveBookIsbn("")
    }
  }

  // const handleRequestBook = (book) => {
  //   const requestedBookData = {
  //     bookIsbn: book.isbn,
  //     userId: user._id,
  //     username: user.username,
  //     usn: user.usn,
  //   };

  //   fetch("/api/requested-books", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(requestedBookData),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => console.log(data))
  //     .catch((error) => console.error(error));
  // };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)
    const filtered = books.filter(
      (book) =>
        book.name.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
    )
    setFilteredBooks(filtered)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  return (
    <>
      <div className={`${classes.pageHeader} ${classes.mb2}`}>
        <h1>Book List</h1>
        {isAdmin && (
          <Button variant="contained" color="primary" component={RouterLink} to="/admin/books/add">
            Add Book
          </Button>
        )}
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/books/:bookIsbn/request"
          >
            Borrowed Books
          </Button>
        )}
      </div>

      {/* Upper Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <TextField
          label="Search books..."
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
        />
        {filteredBooks.length === 0 && searchQuery !== ""
          ? NotificationManager.error("No books found.")
          : null}
      </div>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Book List" />
        <Tab label="Requested Books" />
      </Tabs>

      {tabValue === 0 ? (
        <div className={classes.tableContainer}>
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">ISBN</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Available</TableCell>
                  <TableCell align="right">Fine</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? filteredBooks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : filteredBooks
                ).map((book) => (
                  <TableRow key={book.isbn}>
                    <TableCell component="th" scope="row">
                      {book.name}
                    </TableCell>
                    <TableCell align="right">{book.isbn}</TableCell>
                    <TableCell>{book.category}</TableCell>
                    <TableCell align="right">{book.quantity}</TableCell>
                    <TableCell align="right">{book.availableQuantity}</TableCell>
                    <TableCell align="right">{`$${book.price}`}</TableCell>
                    <TableCell>
                      <div className={classes.actionsContainer}>
                        <Button
                          variant="contained"
                          component={RouterLink}
                          size="small"
                          to={`/books/${book.isbn}`}
                        >
                          View
                        </Button>
                        {isAdmin && (
                          <div className={classes.actionsContainer}>
                            <Button
                              variant="contained"
                              color="primary"
                              component={RouterLink}
                              size="small"
                              to={`/admin/books/${book.isbn}/edit`}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              onClick={(e) => {
                                setActiveBookIsbn(book.isbn)
                                setOpenModal(true)
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            component="div"
            count={books.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
          />
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Card className={classes.conf_modal}>
              <CardContent>
                <h2>Are you sure?</h2>
                <p>You are about to delete the book with ISBN: {activeBookIsbn}</p>
              </CardContent>
              <CardActions className={classes.conf_modal_actions}>
                <Button variant="contained" onClick={() => setOpenModal(false)}>
                  Cancel
                </Button>
                {isAdmin && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => deleteBook(activeBookIsbn)}
                  >
                    Delete
                  </Button>
                )}
              </CardActions>
            </Card>
          </Modal>
        </div>
      ) : (
        // <div className={classes.tableContainer}>
        //   <TableContainer component={Paper}>
        //     <Table stickyHeader>
        //       <TableHead>
        //         <TableRow>
        //           <TableCell>Name</TableCell>
        //           <TableCell align="center">ISBN</TableCell>
        //           <TableCell>Category</TableCell>
        //           <TableCell align="center">USN</TableCell>
        //           <TableCell align="center">Borrower Name</TableCell>
        //           <TableCell align="center">Borrowed Date</TableCell>
        //           <TableCell align="center">Return Date</TableCell>
        //           <TableCell align="center"></TableCell>
        //         </TableRow>
        //       </TableHead>
        //       <TableBody>
        //         {(isAdmin
        //           ? borrowedBooks
        //           : borrowedBooks.filter((book) => book.borrowedBy.includes(user._id))
        //         ).map((book) => (
        //           <TableRow key={book.isbn}>
        //             <TableCell component="th" scope="row">
        //               {book.name}
        //             </TableCell>
        //             <TableCell align="right">{book.isbn}</TableCell>
        //             <TableCell>{book.category}</TableCell>
        //             <TableCell style={{ textAlign: "right" }}>
        //               {book.borrowedBy.find((borrower) => borrower._id === user._id)?.Usn ||
        //                 user.Usn}
        //             </TableCell>
        //             <TableCell style={{ textAlign: "right" }}>
        //               {book.borrowedBy.find((borrower) => borrower._id === user._id)?.username ||
        //                 user.username}
        //             </TableCell>
        //             <TableCell>
        //               <div className={classes.actionsContainer}>
        //                 <Button
        //                   variant="contained"
        //                   component={RouterLink}
        //                   size="small"
        //                   to={`/books/${book.isbn}`}
        //                 >
        //                   View
        //                 </Button>
        //                 {isAdmin && (
        //                   <div className={classes.actionsContainer}>
        //                     <Button
        //                       variant="contained"
        //                       color="primary"
        //                       component={RouterLink}
        //                       size="small"
        //                       to={`/admin/books/${book.isbn}/edit`}
        //                     >
        //                       Edit
        //                     </Button>
        //                   </div>
        //                 )}
        //               </div>
        //             </TableCell>
        //           </TableRow>
        //         ))}
        //       </TableBody>
        //     </Table>
        //   </TableContainer>
        // </div>

        // <div className={classes.tableContainer}>
        //   <TableContainer component={Paper}>
        //     <Table stickyHeader>
        //       <TableHead>
        //         <TableRow>
        //           <TableCell>Name</TableCell>
        //           <TableCell align="center">ISBN</TableCell>
        //           <TableCell>Category</TableCell>
        //           <TableCell align="center">Borrowed By</TableCell>
        //           <TableCell align="center">Borrowed Date</TableCell>

        //           <TableCell align="center"></TableCell>
        //         </TableRow>
        //       </TableHead>
        //       <TableBody>
        //         {
        //           // Check if the user is admin or not and filter accordingly
        //           (isAdmin
        //             ? borrowedBooks.flatMap((book) =>
        //                 book.borrowedBy.map((borrowerId) => ({
        //                   ...book,
        //                   borrowerId, // Separate each borrower into individual rows
        //                 }))
        //               )
        //             : borrowedBooks.filter((book) => book.borrowedBy.includes(user.username))
        //           ) // Filter by logged-in user's username
        //             .map(
        //               (book, index) =>
        //                 (book.borrowedBy.includes(user.username) || isAdmin) && ( // Ensure the logged-in user is either in the borrowedBy list or an admin
        //                   <TableRow key={`${book.isbn}-${index}`}>
        //                     <TableCell component="th" scope="row">
        //                       {book.name || "N/A"}
        //                     </TableCell>
        //                     <TableCell align="center">{book.isbn || "N/A"}</TableCell>
        //                     <TableCell>{book.category || "N/A"}</TableCell>
        //                     <TableCell align="center">
        //                       {book.borrowedBy.join(", ") || "N/A"}
        //                       {/* {user.username || "N/A"} */}
        //                     </TableCell>

        //                     <TableCell align="center">
        //                       {book.priceHistory?.length > 0
        //                         ? new Date(book.priceHistory[0].modifiedAt).toLocaleDateString()
        //                         : "N/A"}
        //                     </TableCell>

        //                     <TableCell align="center">
        //                       <Button
        //                         variant="contained"
        //                         component={RouterLink}
        //                         size="small"
        //                         to={`/books/${book.isbn}`}
        //                       >
        //                         View
        //                       </Button>
        //                       {isAdmin && (
        //                         <Button
        //                           variant="contained"
        //                           color="primary"
        //                           component={RouterLink}
        //                           size="small"
        //                           to={`/admin/books/${book.isbn}/edit`}
        //                         >
        //                           Edit
        //                         </Button>
        //                       )}
        //                     </TableCell>
        //                   </TableRow>
        //                 )
        //             )
        //         }
        //       </TableBody>
        //     </Table>
        //   </TableContainer>
        // </div>

        <div className={classes.tableContainer}>
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">ISBN</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Borrowed By</TableCell>
                  <TableCell align="center">Borrowed Date</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(isAdmin
                  ? borrowedBooks // For admin, show all borrowed books
                  : borrowedBooks.filter((book) => book.borrowedBy.includes(user.username))
                ) // For regular users, filter based on username
                  .map((book, index) => (
                    <TableRow key={`${book.isbn}-${index}`}>
                      <TableCell component="th" scope="row">
                        {book.name || "N/A"}
                      </TableCell>
                      <TableCell align="center">{book.isbn || "N/A"}</TableCell>
                      <TableCell>{book.category || "N/A"}</TableCell>
                      <TableCell align="center">
                        {isAdmin
                          ? book.borrowedBy.join(", ") // For admin, display all borrowers
                          : book.borrowedBy.includes(user.username) // For regular users, display only their username if they borrowed the book
                          ? user.username
                          : "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        {book.priceHistory?.length > 0
                          ? new Date(book.priceHistory[0].modifiedAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          component={RouterLink}
                          size="small"
                          to={`/books/${book.isbn}`}
                        >
                          View
                        </Button>
                        {isAdmin && (
                         <Button
                         variant="contained"
                         color="primary"
                         component={RouterLink}
                         size="small"
                         to={`/books/${book.isbn}/request`}
                       >
                         Accept
                       </Button>
                       
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </>
  )
}
