import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import SiteDetail from './pages/SiteDetail';
import LessonDetail from './pages/LessonDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminSites from './pages/admin/Sites';
import AdminLessons from './pages/admin/Lessons';
import './App.css';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            }
          />
          <Route
            path="/sites/:siteId"
            element={
              <PrivateRoute>
                <SiteDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/lessons/:lessonId"
            element={
              <PrivateRoute>
                <LessonDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          >
            <Route path="users" element={<Users />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="sites" element={<AdminSites />} />
            <Route path="lessons" element={<AdminLessons />} />
            <Route index element={<Navigate to="users" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

