import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './Settings.css';

const API_BASE_URLS = {
    behavioral: "http://localhost:8080/api/behavioral",
    technical: "http://localhost:8080/api/technical"
};

const QuestionPanel = ({ type, error, success, confirmation, question, setQuestion, handleSubmit, questions, handleDelete, confirmDelete, cancelDelete }) => (
    <div className={`${type}-tab`}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {confirmation && (
            <div className="confirmation-message">
                <p>{confirmation.message}</p>
                <div className="confirmation-buttons">
                    <button onClick={cancelDelete} className="cancel-button">Cancel</button>
                    <button onClick={() => confirmDelete(confirmation.id)} className="confirm-button">Confirm</button>
                </div>
            </div>
        )}
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
    const [success, setSuccess] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
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

    // Function to handle tab switching
    const handleTabChange = (tab) => {
        // Reset all messages when switching tabs
        setError(null);
        setSuccess(null);
        setConfirmation(null);
        setQuestion('');
        setActiveTab(tab);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(null); // Clear any previous success message
        setConfirmation(null); // Clear any confirmation dialog
        if (!question.trim()) {
            setError('Please enter a question.');
            return;
        }

        // Check if question already exists in the current list
        const questionExists = questions.some(q => 
            q.question.toLowerCase().trim() === question.toLowerCase().trim()
        );
        
        if (questionExists) {
            setError('This question already exists. Please enter a different question.');
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

            setSuccess('Question added successfully!');
            setQuestion('');
            fetchQuestions(); // Refresh the question list
            setError(null);
        } catch (error) {
            setError('Failed to add question. Please try again.');
            setSuccess(null);
        }
    };

    const handleDelete = async (id) => {
        // Show confirmation message
        setConfirmation({
            message: "Are you sure you want to delete this question?",
            id: id
        });
        setError(null);
        setSuccess(null);
    };

    const confirmDelete = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URLS[activeTab]}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete question');
            fetchQuestions(); // Refresh the question list
            setSuccess('Question deleted successfully!');
            setConfirmation(null);
        } catch (error) {
            setError('Failed to delete question. Please try again.');
            setConfirmation(null);
        }
    };

    const cancelDelete = () => {
        setConfirmation(null);
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
                <button onClick={() => handleTabChange('behavioral')} className={activeTab === 'behavioral' ? 'active' : ''}>
                    Behavioral Questions
                </button>
                <button onClick={() => handleTabChange('technical')} className={activeTab === 'technical' ? 'active' : ''}>
                    Technical Questions
                </button>
            </div>
            <QuestionPanel 
                type={activeTab}
                error={error}
                success={success}
                confirmation={confirmation}
                question={question}
                setQuestion={setQuestion}
                handleSubmit={handleSubmit}
                questions={questions}
                handleDelete={handleDelete}
                confirmDelete={confirmDelete}
                cancelDelete={cancelDelete}
            />
        </div>
    );
};

export default Settings;