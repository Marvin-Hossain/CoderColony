import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './BehavioralQuestions.css';

const API_BASE_URL = "http://localhost:8080/api/behavioral";

const BehavioralQuestions = () => {
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
                
                // Check if the question is the special "no more questions" message
                if (data.question === "No more questions for today! Please reset or come back tomorrow!") {
                    setShowResetButton(true); // Show the reset button
                } else {
                    setShowResetButton(false); // Hide the reset button for valid questions
                }
            } else {
                throw new Error('Failed to fetch question');
            }
        } catch (error) {
            setError('Failed to load question. Please try again.');
            setShowResetButton(true); // Show reset button on error
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
        setFeedback(null);  // Clear previous feedback
        setResponse('');    // Clear previous response

        // Call the reset date endpoint
        try {
            const result = await fetch(`${API_BASE_URL}/reset-date`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ question }) // Send the current question to reset its date
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
                credentials: 'include',
            });
            
            if (!result.ok) {
                if (result.status === 401 || result.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to reset questions');
            }

            // Fetch a new question after resetting
            fetchNewQuestion(); // Call the function to get a new question
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
        <div className="behavioral-questions">
            <header className="behavioral-header">
                <Button 
                    text="Back" 
                    onClick={() => navigate('/dashboard')} 
                    className="back-button"
                />
                <h1>Behavioral Interview Practice</h1>
                <p>Practice your responses and get AI feedback</p>
                {showResetButton && (
                    <Button 
                        text="Reset" 
                        onClick={resetQuestions} 
                        className="reset-button"
                        disabled={loading}
                    />
                )}
            </header>

            {error && <div className="error-message">{error}</div>}

            <main className="behavioral-main">
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

export default BehavioralQuestions; 