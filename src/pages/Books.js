import { useState, useEffect } from 'react';
import {
  getBooks,
  saveBooks,
  generateId,
  getSession
} from '../utils/storage';

function Books() {
  const [books, setBooks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    quantity: '1'
  });

  useEffect(() => {
    setBooks(getBooks());
  }, []);

  const resetForm = () => {
    setForm({ title: '', author: '', genre: '', isbn: '', quantity: '1' });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      const updated = books.map((b) =>
        b.id === editingId
          ? {
              ...b,
              title: form.title.trim(),
              author: form.author.trim(),
              genre: form.genre.trim(),
              isbn: form.isbn.trim()
            }
          : b
      );
      saveBooks(updated);
      setBooks(updated);
      showToast('Book updated successfully', 'success');
    } else {
      const newBook = {
        id: generateId('b'),
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre.trim(),
        isbn: form.isbn.trim(),
        quantity: parseInt(form.quantity, 10) || 0
      };

      const updated = [...books, newBook];
      saveBooks(updated);
      setBooks(updated);

      if (newBook.quantity > 0) {
        const txs = JSON.parse(localStorage.getItem('library_transactions') || '[]');
        const session = getSession();
        txs.unshift({
          id: generateId('t'),
          bookId: newBook.id,
          bookTitle: newBook.title,
          type: 'add',
          quantity: newBook.quantity,
          note: 'Initial stock',
          performedBy: session ? session.name : 'System',
          date: new Date().toISOString()
        });
        localStorage.setItem('library_transactions', JSON.stringify(txs));
      }

      showToast('Book added successfully', 'success');
    }

    resetForm();
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      quantity: '1'
    });
  };

  const handleDelete = (book) => {
    if (window.confirm(`Delete "${book.title}"? This cannot be undone.`)) {
      const updated = books.filter((b) => b.id !== book.id);
      saveBooks(updated);
      setBooks(updated);
      showToast('Book deleted', 'success');
    }
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

  return (
    <main className="main">
      <h2 className="page-title">Book Management</h2>

      <div className="card">
        <div className="card-header">
          <h2>{editingId ? 'Edit Book' : 'Add New Book'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" required value={form.title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input type="text" name="author" required value={form.author} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <input type="text" name="genre" required value={form.genre} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>ISBN</label>
              <input type="text" name="isbn" required value={form.isbn} onChange={handleChange} />
            </div>
            {!editingId && (
              <div className="form-group">
                <label>Initial Quantity</label>
                <input type="number" name="quantity" required min="0" value={form.quantity} onChange={handleChange} />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Book' : 'Add Book'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>All Books</h2>
        </div>

        {books.length === 0 ? (
          <div className="empty-state">
            <p>No books yet. Use the form above to add one.</p>
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
                  <th>Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className={book.quantity < 2 ? 'low-stock' : ''}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.isbn}</td>
                    <td>{book.quantity}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-warning btn-sm" onClick={() => handleEdit(book)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book)}>
                          Delete
                        </button>
                      </div>
                    </td>
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

export default Books;