import { Routes, Route } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import Dashboard from './pages/Dashboard';
import AuthSuccess from './pages/AuthSuccess';
import BehavioralQuestions from './pages/BehavioralQuestions';
import TechnicalQuestions from './pages/TechnicalQuestions';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/behavioral-questions" element={
        <ProtectedRoute>
          <BehavioralQuestions />
        </ProtectedRoute>
      } />
      <Route path="/technical-questions" element={
        <ProtectedRoute>
          <TechnicalQuestions />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      {/* Add other protected routes */}
    </Routes>
  );
};

export default AppRoutes; 