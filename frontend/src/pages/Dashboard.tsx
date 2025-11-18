import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Dashboard.css';

interface Category {
  id: string;
  name: string;
  description?: string;
  sites: Site[];
}

interface Site {
  id: string;
  name: string;
  url: string;
  description?: string;
}

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Venom Agency</h1>
          <div className="header-actions">
            <span className="user-name">Привет, {user?.username}!</span>
            {isAdmin && (
              <Link to="/admin" className="admin-link">
                Панель администратора
              </Link>
            )}
            <button onClick={logout} className="logout-button">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <h2>Категории и сайты</h2>
        
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>Категории пока не добавлены</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <h3>{category.name}</h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                {category.sites.length > 0 ? (
                  <div className="sites-list">
                    {category.sites.map((site) => (
                      <Link
                        key={site.id}
                        to={`/sites/${site.id}`}
                        className="site-link"
                      >
                        <div className="site-item">
                          <h4>{site.name}</h4>
                          {site.description && (
                            <p className="site-description">{site.description}</p>
                          )}
                          <span className="site-arrow">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="no-sites">Сайты не добавлены</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

