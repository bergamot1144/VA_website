import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPages.css';

interface Category {
  id: string;
  name: string;
}

interface Site {
  id: string;
  name: string;
  url: string;
  description?: string;
  category: Category;
  lessons: Array<{ id: string; title: string }>;
}

const Sites: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '', description: '', categoryId: '' });

  useEffect(() => {
    fetchCategories();
    fetchSites();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axios.get('/api/admin/sites');
      setSites(response.data);
    } catch (error) {
      console.error('Ошибка загрузки сайтов:', error);
      alert('Ошибка загрузки сайтов');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSite) {
        await axios.put(`/api/admin/sites/${editingSite.id}`, formData);
      } else {
        await axios.post('/api/admin/sites', formData);
      }
      fetchSites();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      url: site.url,
      description: site.description || '',
      categoryId: site.category.id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот сайт? Все уроки будут также удалены.')) return;

    try {
      await axios.delete(`/api/admin/sites/${id}`);
      fetchSites();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', url: '', description: '', categoryId: '' });
    setEditingSite(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Управление сайтами</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Отмена' : '+ Добавить сайт'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <h3>{editingSite ? 'Редактировать' : 'Создать'} сайт</h3>
          <div className="form-group">
            <label>Название *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Категория *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingSite ? 'Сохранить' : 'Создать'}
            </button>
            {editingSite && (
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
              <th>Название</th>
              <th>URL</th>
              <th>Категория</th>
              <th>Уроков</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id}>
                <td>{site.name}</td>
                <td>
                  {site.url ? (
                    <a href={site.url} target="_blank" rel="noopener noreferrer">
                      {site.url}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>{site.category.name}</td>
                <td>{site.lessons.length}</td>
                <td>
                  <button onClick={() => handleEdit(site)} className="btn-edit">
                    Редактировать
                  </button>
                  <button onClick={() => handleDelete(site.id)} className="btn-delete">
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

export default Sites;

