'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (id, role) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    fetchUsers();
  };

  return (
    <div className="page-container">
      <h1>Admin Dashboard</h1>
      {error && <p className="error-msg">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => changeRole(user.id, e.target.value)}
                >
                  <option value="attendee">Attendee</option>
                  <option value="organiser">Organiser</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => deleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}