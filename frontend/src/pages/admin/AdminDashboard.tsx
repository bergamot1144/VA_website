import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <div>
            <h1>Панель администратора</h1>
            <p className="admin-user">Пользователь: {user?.username}</p>
          </div>
          <div className="header-actions">
            <Link to="/" className="view-site-button">
              Просмотр сайта
            </Link>
            <button onClick={logout} className="logout-button">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <Link
              to="/admin/users"
              className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
            >
              👥 Пользователи
            </Link>
            <Link
              to="/admin/categories"
              className={`nav-link ${location.pathname === '/admin/categories' ? 'active' : ''}`}
            >
              📁 Категории
            </Link>
            <Link
              to="/admin/sites"
              className={`nav-link ${location.pathname === '/admin/sites' ? 'active' : ''}`}
            >
              🌐 Сайты
            </Link>
            <Link
              to="/admin/lessons"
              className={`nav-link ${location.pathname === '/admin/lessons' ? 'active' : ''}`}
            >
              📚 Уроки
            </Link>
          </nav>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
