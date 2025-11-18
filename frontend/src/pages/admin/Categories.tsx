import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPages.css';

interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  sites: Array<{ id: string; name: string }>;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', order: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      alert('Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory.id}`, formData);
      } else {
        await axios.post('/api/admin/categories', formData);
      }
      fetchCategories();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      order: category.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию? Все сайты в ней будут также удалены.')) return;

    try {
      await axios.delete(`/api/admin/categories/${id}`);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', order: 0 });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Управление категориями</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Отмена' : '+ Добавить категорию'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <h3>{editingCategory ? 'Редактировать' : 'Создать'} категорию</h3>
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
            <label>Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Порядок сортировки</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingCategory ? 'Сохранить' : 'Создать'}
            </button>
            {editingCategory && (
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
              <th>Описание</th>
              <th>Сайтов</th>
              <th>Порядок</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>{category.sites.length}</td>
                <td>{category.order}</td>
                <td>
                  <button onClick={() => handleEdit(category)} className="btn-edit">
                    Редактировать
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="btn-delete">
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

export default Categories;

