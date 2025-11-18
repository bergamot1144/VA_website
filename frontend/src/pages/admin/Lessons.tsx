import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPages.css';

interface Site {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  site: Site;
}

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', videoUrl: '', siteId: '', order: 0 });

  useEffect(() => {
    fetchSites();
    fetchLessons();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await axios.get('/api/admin/sites');
      setSites(response.data);
    } catch (error) {
      console.error('Ошибка загрузки сайтов:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await axios.get('/api/admin/lessons');
      setLessons(response.data);
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error);
      alert('Ошибка загрузки уроков');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await axios.put(`/api/admin/lessons/${editingLesson.id}`, formData);
      } else {
        await axios.post('/api/admin/lessons', formData);
      }
      fetchLessons();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl || '',
      siteId: lesson.site.id,
      order: lesson.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот урок?')) return;

    try {
      await axios.delete(`/api/admin/lessons/${id}`);
      fetchLessons();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', videoUrl: '', siteId: '', order: 0 });
    setEditingLesson(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Управление уроками</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Отмена' : '+ Добавить урок'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <h3>{editingLesson ? 'Редактировать' : 'Создать'} урок</h3>
          <div className="form-group">
            <label>Название *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Сайт *</label>
            <select
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              required
            >
              <option value="">Выберите сайт</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.category.name} - {site.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Контент (HTML) *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              required
              placeholder="Можно использовать HTML теги для форматирования"
            />
          </div>
          <div className="form-group">
            <label>URL видео (YouTube embed URL)</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
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
              {editingLesson ? 'Сохранить' : 'Создать'}
            </button>
            {editingLesson && (
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
              <th>Сайт</th>
              <th>Видео</th>
              <th>Порядок</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id}>
                <td>{lesson.title}</td>
                <td>
                  {lesson.site.category.name} - {lesson.site.name}
                </td>
                <td>{lesson.videoUrl ? '✅' : '❌'}</td>
                <td>{lesson.order}</td>
                <td>
                  <button onClick={() => handleEdit(lesson)} className="btn-edit">
                    Редактировать
                  </button>
                  <button onClick={() => handleDelete(lesson.id)} className="btn-delete">
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

export default Lessons;

