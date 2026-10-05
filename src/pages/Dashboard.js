import { useState, useEffect } from 'react';
import { getBooks, getTransactions } from '../utils/storage';

function Dashboard() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    setBooks(getBooks());
    setTransactions(getTransactions());
  }, []);

  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, b) => sum + b.quantity, 0);
  const lowStock = books.filter((b) => b.quantity < 2).length;
  const recentTx = transactions.slice(0, 5);

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <main className="main">
      <h2 className="page-title">Dashboard</h2>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{totalBooks}</div>
          <div className="label">Unique Titles</div>
        </div>
        <div className="stat-card">
          <div className="value">{totalCopies}</div>
          <div className="label">Total Copies</div>
        </div>
        <div className="stat-card">
          <div className="value">{lowStock}</div>
          <div className="label">Low Stock Items</div>
        </div>
        <div className="stat-card">
          <div className="value">{transactions.length}</div>
          <div className="label">Transactions</div>
        </div>
      </div>

      {/* Book Availability */}
      <div className="card">
        <div className="card-header">
          <h2>Book Availability</h2>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <p>No books in the library yet. Add some from the Books page.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>ISBN</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const isLow = book.quantity < 2;
                  return (
                    <tr key={book.id} className={isLow ? 'low-stock' : ''}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.genre}</td>
                      <td>{book.isbn}</td>
                      <td>{book.quantity}</td>
                      <td>
                        {book.quantity === 0 ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">Available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Transactions</h2>
        </div>

        {recentTx.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet.</p>
          </div>
        ) : (
          recentTx.map((tx) => (
            <div key={tx.id} className="transaction-item">
              <div>
                <strong>{tx.bookTitle}</strong>
                {` — ${tx.type === 'add' ? 'Added' : 'Borrowed'} ${tx.quantity} copy(ies)`}
                {tx.note && (
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {' '}({tx.note})
                  </span>
                )}
              </div>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                {formatDate(tx.date)}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default Dashboard;