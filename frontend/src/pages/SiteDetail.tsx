import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './SiteDetail.css';

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}

interface Site {
  id: string;
  name: string;
  url: string;
  description?: string;
  category: {
    id: string;
    name: string;
  };
  lessons: Lesson[];
}

const SiteDetail: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const { logout } = useAuth();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siteId) {
      fetchSite();
    }
  }, [siteId]);

  const fetchSite = async () => {
    try {
      const response = await axios.get(`/api/sites/${siteId}`);
      setSite(response.data);
    } catch (error) {
      console.error('Ошибка загрузки сайта:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="site-detail-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="site-detail-container">
        <div className="error">Сайт не найден</div>
      </div>
    );
  }

  return (
    <div className="site-detail-container">
      <header className="site-detail-header">
        <div className="header-content">
          <div>
            <Link to="/" className="back-link">← Назад к категориям</Link>
            <h1>{site.name}</h1>
            {site.url && (
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="site-url"
              >
                {site.url}
              </a>
            )}
          </div>
          <button onClick={logout} className="logout-button">
            Выйти
          </button>
        </div>
      </header>

      <main className="site-detail-content">
        {site.description && (
          <div className="site-description-section">
            <p>{site.description}</p>
          </div>
        )}

        <h2>Обучение</h2>

        {site.lessons.length === 0 ? (
          <div className="empty-state">
            <p>Уроки пока не добавлены</p>
          </div>
        ) : (
          <div className="lessons-list">
            {site.lessons.map((lesson) => (
              <Link
                key={lesson.id}
                to={`/lessons/${lesson.id}`}
                className="lesson-card"
              >
                <div className="lesson-header">
                  <h3>{lesson.title}</h3>
                  {lesson.videoUrl && (
                    <span className="video-badge">📹 Видео</span>
                  )}
                </div>
                <div className="lesson-arrow">→</div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SiteDetail;

