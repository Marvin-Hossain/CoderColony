import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Intro from './pages/Intro';
import Dashboard from './pages/Dashboard';
import JobApps from './pages/JobApps';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import UserList from './pages/UserList';
import Bot from './pages/Bot';
import BehavioralQuestions from './pages/BehavioralQuestions';
import TechnicalQuestions from './pages/TechnicalQuestions';
import AuthSuccess from './pages/AuthSuccess';
import AuthTest from './pages/AuthTest';
import "bootstrap/dist/css/bootstrap.min.css";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Intro />} /> 
                <Route path="/login" element={<Navigate to="/" />} /> {/* Redirect to intro page */}
                <Route path="/auth-success" element={<AuthSuccess />} />
                <Route path="/auth-test" element={<AuthTest />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/job-apps" element={<JobApps />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/users" element={<UserList />} />
                    <Route path="/behavioral-questions" element={<BehavioralQuestions />} />
                    <Route path="/technical-questions" element={<TechnicalQuestions />} />
                    <Route path="/bot" element={<Bot />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
