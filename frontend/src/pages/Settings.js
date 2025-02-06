import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './Settings.css';

const API_BASE_URL = "http://localhost:8080/api/behavioral";

const Settings = () => {
    const [question, setQuestion] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
            setError(null);
        } catch (error) {
            setError('Failed to add question. Please try again.');
        }
    };

    return (
        <div className="settings">
            <header className="settings-header">
                <Button text="Back" onClick={() => navigate('/dashboard')} className="back-button" />
                <h1>Add Behavioral Question</h1>
            </header>
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
        </div>
    );
};

export default Settings;
