import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import './InterviewQuestions.css';
import { API_CONFIG } from '../services/config';
import PageHeader from './PageHeader';

const InterviewQuestions = ({ type, title }) => {
    const API_BASE_URL = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS[type.toUpperCase()];
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showResetButton, setShowResetButton] = useState(false);
    const navigate = useNavigate();

    const fetchNewQuestion = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/question`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setQuestion(data.question);
                setResponse('');
                setFeedback(null);
                
                if (data.question === "No more questions for today! Please reset or come back tomorrow!") {
                    setShowResetButton(true);
                } else {
                    setShowResetButton(false);
                }
            } else {
                if (response.status === 401 || response.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to fetch question');
            }
        } catch (error) {
            setError('Failed to load question. Please try again.');
            setShowResetButton(true);
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
                credentials: 'include',
                body: JSON.stringify({ 
                    question, 
                    response
                })
            });
            
            if (!result.ok) {
                if (result.status === 401 || result.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to evaluate response');
            }

            const data = await result.json();
            setFeedback({
                rating: data.rating,
                feedback: data.feedback
            });
        } catch (error) {
            setError('Failed to evaluate response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        setLoading(true);
        try {
            await fetchNewQuestion();
        } catch (error) {
            setError('Failed to load next question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async () => {
        setFeedback(null);
        setResponse('');

        try {
            const result = await fetch(`${API_BASE_URL}/reset-date`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ question })
            });

            if (!result.ok) {
                if (result.status === 401 || result.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to reset question date');
            }
        } catch (error) {
            console.error('Error resetting question date:', error);
            setError('Failed to reset question date. Please try again.');
        }
    };

    const resetQuestions = async () => {
        setLoading(true);
        try {
            const result = await fetch(`${API_BASE_URL}/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            
            if (!result.ok) {
                if (result.status === 401 || result.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to reset questions');
            }

            fetchNewQuestion();
        } catch (error) {
            console.error('Error resetting questions:', error);
            setError('Failed to reset questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewQuestion();
    }, []);

    return (
        <div className={`${type}-questions`}>
            <PageHeader 
                title={title}
                subtitle="Practice your responses and get AI feedback"
                onBack={() => navigate('/dashboard')}
                rightButton={showResetButton && (
                    <Button 
                        text="Reset" 
                        onClick={resetQuestions} 
                        className="reset-button"
                        disabled={loading}
                    />
                )}
            />

            {error && <div className="error-message">{error}</div>}

            <main className={`${type}-main`}>
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
                                    disabled={loading || question === "No more questions for today! Please reset or come back tomorrow!"}
                                />
                                <button 
                                    onClick={submitResponse}
                                    disabled={loading || !response.trim() || question === "No more questions for today! Please reset or come back tomorrow!"}
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
                                        disabled={loading}
                                    >
                                        Try Again
                                    </button>
                                    <button 
                                        onClick={handleNext}
                                        className="next-button"
                                        disabled={loading}
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

export default InterviewQuestions; 