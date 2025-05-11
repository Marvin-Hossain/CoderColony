import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Intro from './pages/Intro';
import Dashboard from './pages/Dashboard';
import JobApps from './pages/JobApps';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import BehavioralQuestions from './pages/BehavioralQuestions';
import TechnicalQuestions from './pages/TechnicalQuestions';
import AuthSuccess from './pages/AuthSuccess';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./styles/CleanupStyles.css";
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <div className="full-screen-app">
            <Router>
                <Routes>
                    <Route path="/" element={<Intro/>}/>
                    <Route path="/auth-success" element={<AuthSuccess/>}/>
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/job-apps" element={<JobApps/>}/>
                        <Route path="/progress" element={<Progress/>}/>
                        <Route path="/settings" element={<Settings/>}/>
                        <Route path="/behavioral-questions" element={<BehavioralQuestions/>}/>
                        <Route path="/technical-questions" element={<TechnicalQuestions/>}/>
                    </Route>
                </Routes>
            </Router>
        </div>
    );
};

export default App;