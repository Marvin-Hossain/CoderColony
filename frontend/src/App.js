import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Intro from './pages/Intro';
import Dashboard from './pages/Dashboard';
import JobApps from './pages/JobApps';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import UserList from './pages/UserList';
import Bot from './pages/Bot';
import BehavioralQuestions from './pages/BehavioralQuestions';
import TechnicalQuestions from './pages/TechnicalQuestions';
import "bootstrap/dist/css/bootstrap.min.css";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Intro />} /> 
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/job-apps" element={<JobApps />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/bot" element={<Bot />} />
                <Route path="/behavioral-questions" element={<BehavioralQuestions />} />
                <Route path="/technical-questions" element={<TechnicalQuestions />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Router>
    );
}

export default App;
