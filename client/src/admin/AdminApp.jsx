import { Navigate, Route, Routes } from 'react-router-dom';
import Seo from '../components/ui/Seo';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Account from './pages/Account';
import Dashboard from './pages/Dashboard';
import ExperiencePage from './pages/ExperiencePage';
import Login from './pages/Login';
import Messages from './pages/Messages';
import Posts from './pages/Posts';
import ProfilePage from './pages/ProfilePage';
import Projects from './pages/Projects';
import Skills from './pages/Skills';

/** Everything under /admin. Loaded lazily so visitors never download it. */
export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Seo title="Admin" noindex path="/admin" />
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="skills" element={<Skills />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="posts" element={<Posts />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="account" element={<Account />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
