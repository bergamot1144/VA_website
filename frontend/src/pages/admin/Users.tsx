import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPages.css';

interface User {
  id: string;
  username: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'USER' as 'USER' | 'ADMIN' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      alert('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/api/admin/users/${editingUser.id}`, formData);
      } else {
        await axios.post('/api/admin/users', formData);
      }
      fetchUsers();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      await axios.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'USER' });
    setEditingUser(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Управление пользователями</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Отмена' : '+ Добавить пользователя'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <h3>{editingUser ? 'Редактировать' : 'Создать'} пользователя</h3>
          <div className="form-group">
            <label>Логин</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Пароль {editingUser && '(оставьте пустым, чтобы не менять)'}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
            />
          </div>
          <div className="form-group">
            <label>Роль *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
              required
            >
              <option value="USER">Пользователь</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingUser ? 'Сохранить' : 'Создать'}
            </button>
            {editingUser && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Отмена
              </button>
            )}
          </div>
        </form>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Логин</th>
              <th>Роль</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: user.role === 'ADMIN' 
                      ? 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' 
                      : '#2a2a2a',
                    color: user.role === 'ADMIN' ? '#fff' : '#e0e0e0',
                  }}>
                    {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                <td>
                  <button onClick={() => handleEdit(user)} className="btn-edit">
                    Редактировать
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="btn-delete">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;

