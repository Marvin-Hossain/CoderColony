import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './Settings.css';
import { API_CONFIG } from '../services/config';
import PageHeader from '../components/PageHeader';
import CategoryTabs from '../components/CategoryTabs';

const API_BASE_URLS = {
    behavioral: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BEHAVIORAL,
    technical: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.TECHNICAL
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
            const response = await fetch(`${API_BASE_URLS[activeTab]}/all`, {
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to fetch questions');
            }
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
        setSuccess(null);
        setConfirmation(null);
        if (!question.trim()) {
            setError('Please enter a question.');
            return;
        }

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
                credentials: 'include',
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/');
                    return;
                }
                const errorText = await response.text();
                throw new Error(errorText);
            }

            setSuccess('Question added successfully!');
            setQuestion('');
            fetchQuestions();
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
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to delete question');
            }
            
            fetchQuestions();
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
            <PageHeader 
                title="Settings"
                onBack={() => navigate('/dashboard')}
            />
            
            <CategoryTabs 
                categories={[
                    { id: 'behavioral', label: 'Behavioral Questions' },
                    { id: 'technical', label: 'Technical Questions' }
                ]}
                selectedCategory={activeTab}
                onCategoryChange={handleTabChange}
            />
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