import { useState } from 'react';
import { getUsers, setSession } from '../utils/storage';

function Login({ onLogin }) {
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(
      (u) => u.membershipId === membershipId.trim() && u.password === password
    );

    if (user) {
      const sessionUser = {
        id: user.id,
        name: user.name,
        membershipId: user.membershipId,
        role: user.role
      };
      setSession(sessionUser);
      onLogin(sessionUser);
    } else {
      setError('Invalid Membership ID or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📚 Ha-Teko Community Library</h1>
        <p className="subtitle">Library Management System</p>

        {error && (
          <div className="login-error" style={{ display: 'block' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Membership ID</label>
            <input
              type="text"
              name="membershipId"
              required
              placeholder="Membership ID"
              autoComplete="username"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;