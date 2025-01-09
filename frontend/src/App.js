import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Earth from './pages/Earth';
import Ship from './pages/Ship';
import UserList from './pages/UserList';
import "bootstrap/dist/css/bootstrap.min.css";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Earth />} />  {/* Earth as the home page */}
                <Route path="/ship" element={<Ship />} />  {/* Ship page */}
                <Route path="/users" element={<UserList />} />  {/* User List page */}
            </Routes>
        </Router>
    );
}

export default App;
