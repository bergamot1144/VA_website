import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './LessonDetail.css';

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  site: {
    id: string;
    name: string;
  };
}

const LessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { logout } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await axios.get(`/api/lessons/${lessonId}`);
      setLesson(response.data);
    } catch (error) {
      console.error('Ошибка загрузки урока:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="lesson-detail-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-detail-container">
        <div className="error">Урок не найден</div>
      </div>
    );
  }

  return (
    <div className="lesson-detail-container">
      <header className="lesson-detail-header">
        <div className="header-content">
          <div>
            <Link
              to={`/sites/${lesson.site.id}`}
              className="back-link"
            >
              ← Назад к {lesson.site.name}
            </Link>
            <h1>{lesson.title}</h1>
          </div>
          <button onClick={logout} className="logout-button">
            Выйти
          </button>
        </div>
      </header>

      <main className="lesson-detail-content">
        {lesson.videoUrl && (
          <div className="video-section">
            <h2>Видео</h2>
            <div className="video-wrapper">
              {lesson.videoUrl.includes('/uploads/videos/') || lesson.videoUrl.includes('localhost:3001/uploads') || lesson.videoUrl.endsWith('.mp4') || lesson.videoUrl.endsWith('.avi') || lesson.videoUrl.endsWith('.mov') || lesson.videoUrl.endsWith('.webm') || lesson.videoUrl.endsWith('.mkv') || lesson.videoUrl.endsWith('.m4v') ? (
                <video 
                  controls 
                  width="100%" 
                  style={{ width: '100%', height: 'auto', minHeight: '400px' }}
                  preload="metadata"
                >
                  <source src={lesson.videoUrl} type="video/mp4" />
                  <source src={lesson.videoUrl} type="video/webm" />
                  <source src={lesson.videoUrl} type="video/ogg" />
                  Ваш браузер не поддерживает видео.
                </video>
              ) : (
                <iframe
                  src={lesson.videoUrl}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        )}

        <div className="content-section">
          <h2>Текст обучения</h2>
          <div
            className="lesson-content"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </div>
      </main>
    </div>
  );
};

export default LessonDetail;

