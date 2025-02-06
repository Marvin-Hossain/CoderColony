import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './Settings.css';

const API_BASE_URL = "http://localhost:8080/api/behavioral";

const Settings = () => {
    const [activeTab, setActiveTab] = useState('behavioral');
    const [question, setQuestion] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/all`);
            if (!response.ok) throw new Error('Failed to fetch questions');
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            setError('Failed to load questions. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) {
            setError('Please enter a question.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert('Question added successfully!');
            setQuestion('');
            fetchQuestions(); // Refresh the question list
            setError(null);
        } catch (error) {
            setError('Failed to add question. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete question');
                fetchQuestions(); // Refresh the question list
            } catch (error) {
                setError('Failed to delete question. Please try again.');
            }
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    return (
        <div className="settings">
            <header className="settings-header">
                <Button text="Back" onClick={() => navigate('/dashboard')} className="back-button" />
                <h1>Settings</h1>
            </header>
            <div className="tabs">
                <button onClick={() => setActiveTab('behavioral')} className={activeTab === 'behavioral' ? 'active' : ''}>
                    Behavioral Questions
                </button>
                <button onClick={() => setActiveTab('technical')} className={activeTab === 'technical' ? 'active' : ''}>
                    Technical Questions
                </button>
            </div>

            {activeTab === 'behavioral' && (
                <div className="behavioral-tab">
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter your behavioral question here..."
                            required
                        />
                        <button type="submit" className="submit-button">Add Question</button>
                    </form>
                    <div className="question-list">
                        <h2>Existing Behavioral Questions</h2>
                        <ul>
                            {questions.map(q => (
                                <li key={q.id} className="question-item">
                                    {q.question}
                                    <button onClick={() => handleDelete(q.id)} className="delete-button">Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'technical' && (
                <div className="technical-tab">
                    <h2>Technical Questions (Coming Soon)</h2>
                    {/* Similar functionality for technical questions can be added here */}
                </div>
            )}
        </div>
    );
};

export default Settings;
