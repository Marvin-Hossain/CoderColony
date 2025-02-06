import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './TechnicalQuestions.css';

const API_BASE_URL = "http://localhost:8080/api/technical";

const TechnicalQuestions = () => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchNewQuestion = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/question`);
            if (!response.ok) throw new Error('Failed to fetch question');
            const data = await response.json();
            setQuestion(data.question);
            setResponse('');
            setFeedback(null);
        } catch (error) {
            setError('Failed to load question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitResponse = async () => {
        if (!response.trim()) {
            setError('Please provide a response');
            return;
        }

        setLoading(true);
        try {
            const result = await fetch(`${API_BASE_URL}/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    question, 
                    response,
                    isNewQuestion: false
                })
            });
            
            if (!result.ok) {
                const errorText = await result.text();
                console.error('Server error:', errorText);
                throw new Error('Failed to evaluate response');
            }

            const data = await result.json();
            setFeedback({
                rating: data.rating,
                feedback: data.feedback
            });
        } catch (error) {
            console.error('Error details:', error);
            setError('Failed to evaluate response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            const result = await fetch(`${API_BASE_URL}/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    question, 
                    response,
                    isNewQuestion: true
                })
            });
            await fetchNewQuestion();
        } catch (error) {
            setError('Failed to load next question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setFeedback(null);  // Clear previous feedback
        setResponse('');    // Clear previous response
    };

    useEffect(() => {
        fetchNewQuestion();
    }, []);

    return (
        <div className="technical-questions">
            <header className="technical-header">
                <Button 
                    text="Back" 
                    onClick={() => navigate('/dashboard')} 
                    className="back-button"
                />
                <h1>Technical Interview Practice</h1>
                <p>Practice your responses and get AI feedback</p>
            </header>

            {error && <div className="error-message">{error}</div>}

            <main className="technical-main">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        <div className="question-section">
                            <h2>Question:</h2>
                            <p>{question}</p>
                        </div>

                        {!feedback ? (
                            <div className="response-section">
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="Use the STAR method: Describe the Situation, Task, Action, and Result..."
                                    disabled={loading}
                                />
                                <button 
                                    onClick={submitResponse}
                                    disabled={loading || !response.trim()}
                                    className="submit-button"
                                >
                                    Get Feedback
                                </button>
                            </div>
                        ) : (
                            <div className="feedback-section">
                                <h3>Feedback:</h3>
                                <div className="rating">Score: {feedback.rating}/10</div>
                                <div className="feedback-text">{feedback.feedback}</div>
                                <div className="button-group">
                                    <button 
                                        onClick={handleRetry}
                                        className="retry-button"
                                    >
                                        Try Again
                                    </button>
                                    <button 
                                        onClick={handleNext}
                                        className="next-button"
                                    >
                                        Next Question
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default TechnicalQuestions; 