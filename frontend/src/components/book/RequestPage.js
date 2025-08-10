import React, { useState, useEffect } from 'react';
import './BorrowForm.css';
import { NotificationManager } from 'react-notifications';
import './BorrowForm.css';






const BorrowForm = () => {
  const [bookName, setBookName] = useState('');
  const [isbn, setIsbn] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [usn, setUsn] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [borrowedDate, setBorrowedDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [borrowedItems, setBorrowedItems] = useState(
    JSON.parse(localStorage.getItem('borrowedItems')) || []
  );
  const [activeTab, setActiveTab] = useState('input');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false); // Track if the form is submitted

  const handleSubmit = (e) => {
    e.preventDefault();

    const borrowData = {
      bookName,
      isbn,
      borrowerName,
      usn,
      phoneNumber,
      borrowedDate,
      returnDate,
      fine: 0,
    };

    const updatedItems = [...borrowedItems, borrowData];
    setBorrowedItems(updatedItems);
    localStorage.setItem('borrowedItems', JSON.stringify(updatedItems));

    setBookName('');
    setIsbn('');
    setBorrowerName('');
    setUsn('');
    setPhoneNumber('');
    setBorrowedDate('');
    setReturnDate('');

    setIsFormSubmitted(true); // Set form submitted to true
    NotificationManager.success("Book borrowed successfully!", 'Success', 5000); // Show success notification
  };

  const handleNotify = () => {
    NotificationManager.info('This is a test notification.', 'Notification', 5000); // Test notification
  };

  useEffect(() => {
    const updateFines = () => {
      const updatedItems = borrowedItems.map((item) => {
        const fine = calculateFine(item.returnDate);
        return { ...item, fine };
      });
      setBorrowedItems(updatedItems);
      localStorage.setItem('borrowedItems', JSON.stringify(updatedItems));
    };

    updateFines();
  }, [borrowedItems]);

  const calculateFine = (returnDate) => {
    const currentDate = new Date();
    const returnDateObj = new Date(returnDate);
    const timeDiff = currentDate - returnDateObj;
    const daysOverdue = timeDiff > 0 ? Math.floor(timeDiff / (1000 * 3600 * 24)) : 0;
    return daysOverdue * 5;
  };

  const handleRemoveItem = (isbnToRemove) => {
    const updatedItems = borrowedItems.filter((item) => item.isbn !== isbnToRemove);
    setBorrowedItems(updatedItems);
    localStorage.setItem('borrowedItems', JSON.stringify(updatedItems));
  };

  return (
    <div>
      <h1>Borrowed Book</h1>

      {/* Tabs for navigation */}
      <div className="tabs">
        <button
          className={activeTab === 'input' ? 'active' : ''}
          onClick={() => setActiveTab('input')}
        >
          Borrow Book
        </button>
        <button
          className={activeTab === 'table' ? 'active' : ''}
          onClick={() => setActiveTab('table')}
        >
          Borrowed Books
        </button>
      </div>

      {/* Content for Borrow Book tab */}
      {activeTab === 'input' && (
        <div className="form-container">
          <h3>Borrow a Book</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Book Name:</label>
              <input
                type="text"
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>ISBN:</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Borrower Name:</label>
              <input
                type="text"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>USN:</label>
              <input
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Phone Number:</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Borrowed Date:</label>
              <input
                type="date"
                value={borrowedDate}
                onChange={(e) => setBorrowedDate(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Return Date:</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>
            <button className="submit-btn" type="submit">
              Submit
            </button>
          </form>

          {/* Display Notify button after form is submitted */}
          {isFormSubmitted && (
            <div className="notify-btn-container">
               
            </div>
          )}
        </div>
      )}

      {/* Content for Borrowed Books table tab */}
      {activeTab === 'table' && (
        <div className="table-container">
          <h3>Borrowed Books</h3>
          <table border="1" className="borrowed-table">
            <thead>
              <tr>
                <th>Book Name</th>
                <th>ISBN</th>
                <th>Borrower Name</th>
                <th>USN</th>
                <th>Phone Number</th>
                <th>Borrowed Date</th>
                <th>Return Date</th>
                <th>Fine</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {borrowedItems.map((item) => (
                <tr key={item.isbn}>
                  <td>{item.bookName}</td>
                  <td>{item.isbn}</td>
                  <td>{item.borrowerName}</td>
                  <td>{item.usn}</td>
                  <td>{item.phoneNumber}</td>
                  <td>{item.borrowedDate}</td>
                  <td>{item.returnDate}</td>
                  <td>{item.fine > 0 ? item.fine : 'No Fine'}</td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.isbn)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BorrowForm;
