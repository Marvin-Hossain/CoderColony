import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Intro from './pages/Intro';
import Dashboard from './pages/Dashboard';
import JobApps from './pages/JobApps';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import BehavioralQuestions from './pages/BehavioralQuestions';
import TechnicalQuestions from './pages/TechnicalQuestions';
import AuthSuccess from './pages/AuthSuccess';
import AboutUs from './pages/AboutUs';
import Practice from './pages/Practice';
import Toolbar from './components/Toolbar';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./styles/CleanupStyles.css";
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load flashcard pages
const Flashcards = lazy(() => import('./pages/Flashcards'));
const FlashcardsExplore = lazy(() => import('./pages/FlashcardsExplore'));
const DeckPage = lazy(() => import('./pages/DeckPage'));
const StudyPage = lazy(() => import('./pages/StudyPage'));
const DeckEditor = lazy(() => import('./pages/DeckEditor'));

// Layout component that conditionally renders the toolbar
const AppLayout = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/';
    
    return (
        <>
            {!isLoginPage && <Toolbar />}
            <div className={isLoginPage ? "login-content" : "content"} style={
                isLoginPage ? {} : { marginTop: '60px', padding: '20px' }
            }>
                <Routes>
                    <Route path="/" element={<Intro/>}/>
                    <Route path="/auth-success" element={<AuthSuccess/>}/>
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/job-apps" element={<JobApps/>}/>
                        <Route path="/progress" element={<Progress/>}/>
                        <Route path="/settings" element={<Settings/>}/>
                        <Route path="/practice" element={<Practice/>}/>
                        <Route path="/behavioral-questions" element={<BehavioralQuestions/>}/>
                        <Route path="/technical-questions" element={<TechnicalQuestions/>}/>
                        <Route path="/about-us" element={<AboutUs/>}/>
                        <Route path="/practice/flashcards" element={<Suspense fallback={<>Loading...</>}><Flashcards/></Suspense>}/>
                        <Route path="/practice/flashcards/new" element={<Suspense fallback={<>Loading...</>}><DeckEditor/></Suspense>}/>
                        <Route path="/practice/flashcards/:deckId" element={<Suspense fallback={<>Loading...</>}><DeckPage/></Suspense>}/>
                        <Route path="/practice/flashcards/:deckId/edit" element={<Suspense fallback={<>Loading...</>}><DeckEditor/></Suspense>}/>
                        <Route path="/practice/flashcards/:deckId/study" element={<Suspense fallback={<>Loading...</>}><StudyPage/></Suspense>}/>
                        <Route path="/explore/flashcards" element={<Suspense fallback={<>Loading...</>}><FlashcardsExplore/></Suspense>}/>
                    </Route>
                </Routes>
            </div>
        </>
    );
};

const App = () => {
    return (
        <div className="full-screen-app">
            <Router>
                <AppLayout />
            </Router>
        </div>
    );
};

export default App;