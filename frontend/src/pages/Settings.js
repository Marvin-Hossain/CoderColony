import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './Settings.css';

const API_BASE_URLS = {
    behavioral: "http://localhost:8080/api/behavioral",
    technical: "http://localhost:8080/api/technical"
};

const QuestionPanel = ({ type, error, question, setQuestion, handleSubmit, questions, handleDelete }) => (
    <div className={`${type}-tab`}>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Enter your ${type} question here...`}
                required
            />
            <button type="submit" className="submit-button">Add Question</button>
        </form>
        <div className="question-list">
            <h2>Existing {type.charAt(0).toUpperCase() + type.slice(1)} Questions</h2>
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
);

const Settings = () => {
    const [activeTab, setActiveTab] = useState('behavioral');
    const [question, setQuestion] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`${API_BASE_URLS[activeTab]}/all`);
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
            const response = await fetch(`${API_BASE_URLS[activeTab]}/add`, {
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
                const response = await fetch(`${API_BASE_URLS[activeTab]}/${id}`, {
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
    }, [activeTab]);

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
            <QuestionPanel 
            type={activeTab}
            error={error}
            question={question}
            setQuestion={setQuestion}
            handleSubmit={handleSubmit}
            questions={questions}
            handleDelete={handleDelete}
        />
        </div>
    );
};

export default Settings;