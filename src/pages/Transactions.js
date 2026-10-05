import { useState, useEffect } from 'react';
import {
  getBooks,
  saveBooks,
  getTransactions,
  saveTransactions,
  generateId,
  getSession
} from '../utils/storage';

function Transactions() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    bookId: '',
    type: 'add',
    quantity: '1',
    note: ''
  });

  useEffect(() => {
    setBooks(getBooks());
    setTransactions(getTransactions());
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const bookIdx = books.findIndex((b) => b.id === form.bookId);
    if (bookIdx === -1) {
      showToast('Book not found', 'error');
      return;
    }

    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      showToast('Quantity must be a positive number', 'error');
      return;
    }

    const updatedBooks = [...books];

    if (form.type === 'borrow') {
      if (updatedBooks[bookIdx].quantity < qty) {
        showToast('Not enough stock available', 'error');
        return;
      }
      updatedBooks[bookIdx].quantity -= qty;
    } else if (form.type === 'add') {
      updatedBooks[bookIdx].quantity += qty;
    } else {
      showToast('Invalid transaction type', 'error');
      return;
    }

    saveBooks(updatedBooks);
    setBooks(updatedBooks);

    const session = getSession();
    const newTx = {
      id: generateId('t'),
      bookId: form.bookId,
      bookTitle: updatedBooks[bookIdx].title,
      type: form.type,
      quantity: qty,
      note: form.note.trim(),
      performedBy: session ? session.name : 'System',
      date: new Date().toISOString()
    };

    const updatedTxs = [newTx, ...transactions];
    saveTransactions(updatedTxs);
    setTransactions(updatedTxs);

    showToast('Transaction recorded successfully', 'success');
    setForm({ bookId: '', type: 'add', quantity: '1', note: '' });
  };

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.background =
      type === 'error' ? '#dc2626' : type === 'success' ? '#16a34a' : '#2563eb';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <main className="main">
      <h2 className="page-title">Stock Transactions</h2>

      <div className="card">
        <div className="card-header">
          <h2>Record Transaction</h2>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <p>Add books first before recording transactions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Select Book</label>
                <select name="bookId" required value={form.bookId} onChange={handleChange}>
                  <option value="">-- Choose a book --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Current stock: {b.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Transaction Type</label>
                <select name="type" required value={form.type} onChange={handleChange}>
                  <option value="add">Add Stock (New arrivals)</option>
                  <option value="borrow">Deduct Stock (Borrowed)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="1"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Note (optional)</label>
                <input
                  type="text"
                  name="note"
                  placeholder="e.g. Received from supplier / Borrowed by John"
                  value={form.note}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Record Transaction
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Book</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Note</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.date)}</td>
                    <td>{tx.bookTitle}</td>
                    <td>
                      <span className={`badge ${tx.type === 'add' ? 'badge-success' : 'badge-info'}`}>
                        {tx.type === 'add' ? 'Add Stock' : 'Borrowed'}
                      </span>
                    </td>
                    <td>{tx.quantity}</td>
                    <td>{tx.note || '—'}</td>
                    <td>{tx.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default Transactions;