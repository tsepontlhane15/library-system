import { useState, useEffect } from 'react';
import {
  getUsers,
  saveUsers,
  generateId,
  getSession
} from '../utils/storage';

function Users() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    membershipId: '',
    role: 'member',
    password: ''
  });

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const resetForm = () => {
    setForm({ name: '', membershipId: '', role: 'member', password: '' });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      const existing = users.find(
        (u) => u.membershipId === form.membershipId.trim() && u.id !== editingId
      );
      if (existing) {
        showToast('Membership ID already exists', 'error');
        return;
      }

      const updated = users.map((u) => {
        if (u.id === editingId) {
          const updatedUser = {
            ...u,
            name: form.name.trim(),
            membershipId: form.membershipId.trim(),
            role: form.role
          };
          if (form.password.trim()) {
            updatedUser.password = form.password.trim();
          }
          return updatedUser;
        }
        return u;
      });

      saveUsers(updated);
      setUsers(updated);
      showToast('User updated', 'success');
    } else {
      if (users.some((u) => u.membershipId === form.membershipId.trim())) {
        showToast('Membership ID already exists', 'error');
        return;
      }

      const newUser = {
        id: generateId('u'),
        name: form.name.trim(),
        membershipId: form.membershipId.trim(),
        role: form.role,
        password: form.password || 'password123'
      };

      const updated = [...users, newUser];
      saveUsers(updated);
      setUsers(updated);
      showToast('User added successfully', 'success');
    }

    resetForm();
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      membershipId: user.membershipId,
      role: user.role,
      password: ''
    });
  };

  const handleDelete = (user) => {
    const session = getSession();
    if (session && session.id === user.id) {
      showToast('You cannot delete your own account', 'error');
      return;
    }

    if (window.confirm(`Delete user "${user.name}"?`)) {
      const updated = users.filter((u) => u.id !== user.id);
      saveUsers(updated);
      setUsers(updated);
      showToast('User deleted', 'success');
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
      <h2 className="page-title">User Management</h2>

      <div className="card">
        <div className="card-header">
          <h2>{editingId ? 'Edit User' : 'Add New User'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Membership ID</label>
              <input type="text" name="membershipId" required value={form.membershipId} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" required value={form.role} onChange={handleChange}>
                <option value="admin">Admin</option>
                <option value="librarian">Librarian</option>
                <option value="member">Member</option>
              </select>
            </div>
            <div className="form-group">
              <label>{editingId ? 'New Password (leave blank to keep)' : 'Password'}</label>
              <input
                type="password"
                name="password"
                required={!editingId}
                placeholder={editingId ? '••••••••' : 'Set a password'}
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update User' : 'Add User'}
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
          <h2>All Users</h2>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Membership ID</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.membershipId}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.role === 'admin'
                          ? 'badge-danger'
                          : user.role === 'librarian'
                          ? 'badge-info'
                          : 'badge-success'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-warning btn-sm" onClick={() => handleEdit(user)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default Users;