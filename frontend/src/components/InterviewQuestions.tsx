import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import './InterviewQuestions.css';
import { API_CONFIG } from '../services/config';
import PageHeader from './PageHeader';

// Add these type declarations after imports
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface FeedbackData {
    rating: number;
    feedback: string;
}

interface QuestionResponse {
    question: string;
}

interface QuestionCounts {
    date: string;
    behavioral: number;
    technical: number;
    [key: string]: string | number;
}

interface InterviewQuestionsProps {
    type: 'behavioral' | 'technical';
    title: string;
}

const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({ type, title }) => {
    const API_BASE_URL = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS[type.toUpperCase() as keyof typeof API_CONFIG.ENDPOINTS];
    const [question, setQuestion] = useState<string>('');
    const [response, setResponse] = useState<string>('');
    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showResetButton, setShowResetButton] = useState<boolean>(false);
    const [isListening, setIsListening] = useState<boolean>(false);
    const recognitionRef = useRef<any>(null);
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const navigate = useNavigate();

    const fetchNewQuestion = async (): Promise<void> => {
        setLoading(true);
        console.log('Fetching from:', `${API_BASE_URL}/question`);
        try {
            const response = await fetch(`${API_BASE_URL}/question`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data: QuestionResponse = await response.json();
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

    const submitResponse = async (): Promise<void> => {
        if (!response.trim()) {
            setError('Please provide a response');
            return;
        }

        // Stop voice recognition if it's active
        stopRecognition();
        
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

            const data: FeedbackData = await result.json();
            setFeedback(data);
        } catch (error) {
            setError('Failed to evaluate response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async (): Promise<void> => {
        setLoading(true);
        try {
            // Then fetch new question
            await fetchNewQuestion();
        } catch (error) {
            setError('Failed to load next question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (): Promise<void> => {
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

    const handleSkip = async (): Promise<void> => {
        // Stop voice recognition if it's active
        stopRecognition();
        setLoading(true);
        try {
            await fetchNewQuestion(); // Fetch a new question
        } catch (error) {
            setError('Failed to load new question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetQuestions = async (): Promise<void> => {
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

    const stopRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    };

    const toggleListening = () => {
        if (isListening) {
            stopRecognition();
        } else {
            try {
                recognitionRef.current = new SpeechRecognition();
                const recognition = recognitionRef.current;
                
                recognition.continuous = true;
                recognition.interimResults = true;
                
                recognition.onresult = (event: any) => {
                    const transcript = Array.from(event.results)
                        .map((result: any) => result[0])
                        .map((result) => result.transcript)
                        .join('');
                    setResponse(transcript);
                };

                recognition.onend = () => {
                    stopRecognition();
                };

                recognition.start();
                setIsListening(true);
            } catch (error) {
                console.error('Speech recognition error:', error);
                stopRecognition();
            }
        }
    };

    useEffect(() => {
        fetchNewQuestion();
    }, []);

    useEffect(() => {
        return () => {
            stopRecognition();
        };
    }, []);

    return (
        <div className={`${type}-questions`}>
            <PageHeader 
                title={title}
                subtitle="Practice your responses and get AI feedback"
                onBack={() => navigate('/dashboard')}
                rightButton={showResetButton ? (
                    <Button 
                        text="Reset" 
                        onClick={resetQuestions} 
                        className="reset-button"
                        disabled={loading}
                    />
                ) : (
                    <Button 
                        text="Skip" 
                        onClick={handleSkip} // Use the handleSkip function here
                        className="skip-button"
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
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponse(e.target.value)}
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
                                    <button 
                                        onClick={toggleListening}
                                        disabled={!SpeechRecognition || loading || question === "No more questions for today! Please reset or come back tomorrow!"}
                                        className={`mic-button ${isListening ? 'active' : ''}`}
                                    >
                                        🎤
                                    </button>
                                </div>
                        ) : (
                            <div className="feedback-section">
                                <h3>Feedback:</h3>
                                <div className={`rating ${feedback.rating < 6 ? 'low-score' : ''}`}>
                                    Score: {feedback.rating}/10
                                    {feedback.rating < 6 && (
                                        <span className="score-warning">
                                            (Need at least 6/10 to advance)
                                        </span>
                                    )}
                                </div>
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
                                        disabled={loading || feedback.rating < 6}
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