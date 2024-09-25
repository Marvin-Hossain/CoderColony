import React, {useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import Button from './Button';
import './InterviewQuestions.css';
import {API_CONFIG} from '@/services/config';
import PageHeader from './PageHeader';

/**
 * Global type declaration for browser SpeechRecognition APIs,
 * including the vendor-prefixed version for compatibility.
 */
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

interface InterviewQuestionsProps {
    type: 'behavioral' | 'technical';
    title: string;
    subtitle?: string;
}

/**
 * Component for practicing interview questions. It fetches questions,
 * allows text or speech input, sends responses for AI evaluation,
 * and displays feedback.
 */
const InterviewQuestions = ({type, title, subtitle}: InterviewQuestionsProps) => {
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

    /** Fetches a new question from the backend API. */
    const fetchNewQuestion = async (): Promise<void> => {
        setLoading(true);
        setError(null);
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

                // Check if the backend signaled that all questions for the day are done
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
            console.error("Error fetching question:", error instanceof Error ? error.message : error);
            setError('Failed to load question. Please try again.');
            setShowResetButton(true);
        } finally {
            setLoading(false);
        }
    };

    /** Submits the user's response for AI evaluation. */
    const submitResponse = async (): Promise<void> => {
        if (!response.trim()) {
            setError('Please provide a response');
            return;
        }
        stopRecognition();

        setLoading(true);
        setError(null);
        try {
            const result = await fetch(`${API_BASE_URL}/evaluate`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({question, response})
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
            console.error("Error submitting response:", error instanceof Error ? error.message : error);
            setError('Failed to evaluate response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /** Handles the 'Next Question' action after successful evaluation. */
    const handleNext = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await fetchNewQuestion();
        } catch (error) {
            setError('Failed to load next question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /** Reset backend state for the current question to allow re-evaluation. */
    const handleRetry = async (): Promise<void> => {
        setFeedback(null);
        setResponse('');
        setLoading(true);
        setError(null);
        try {
            const result = await fetch(`${API_BASE_URL}/reset-date`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({question})
            });

            if (!result.ok) {
                if (result.status === 401 || result.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to reset question date');
            }
        } catch (error) {
            console.error('Error resetting question date:', error instanceof Error ? error.message : error);
            setError('Failed to reset question date. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /** Handles the 'Skip' action to fetch a different question. */
    const handleSkip = async (): Promise<void> => {
        stopRecognition();
        setLoading(true);
        setError(null);
        try {
            await fetchNewQuestion();
        } catch (error) {
            setError('Failed to load new question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /** Reset all question tracking for the day on the backend. */
    const resetQuestions = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetch(`${API_BASE_URL}/reset`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            });

            if (!result.ok) {
                if (result.status === 401 || result.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to reset questions');
            }
            await fetchNewQuestion();
        } catch (error) {
            console.error('Error resetting questions:', error instanceof Error ? error.message : error);
            setError('Failed to reset questions. Please try again.');
            setLoading(false);
        }
    };

    /** Safely stops the speech recognition instance and updates state. */
    const stopRecognition = () => {
        if (recognitionRef.current) {
            // Detach handlers before stopping to prevent errors on close
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    };

    /** Toggles the speech recognition microphone on or off. */
    const toggleListening = () => {
        if (isListening) {
            stopRecognition();
        } else {
            if (!SpeechRecognition) {
                setError("Speech Recognition is not supported by your browser.");
                return;
            }
            try {
                stopRecognition(); // Ensure cleanup before starting

                recognitionRef.current = new SpeechRecognition();
                const recognition = recognitionRef.current;

                // Keep listening after speech pauses; get results live
                recognition.continuous = true;
                recognition.interimResults = true;

                /** Combine results into transcript and update state. */
                recognition.onresult = (event: any) => {
                    const transcript = Array.from(event.results)
                        .map((result: any) => result[0])
                        .map((result) => result.transcript)
                        .join('');
                    setResponse(transcript);
                };

                /** Handle speech recognition errors. */
                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setError(`Speech recognition error: ${event.error}`);
                    stopRecognition();
                };

                /** Handle unexpected ends or manual stops. */
                recognition.onend = () => {
                    if (recognitionRef.current === recognition) {
                        stopRecognition();
                    }
                };

                recognition.start();
                setIsListening(true);
                setError(null);
            } catch (error) {
                console.error('Failed to start speech recognition:', error instanceof Error ? error.message : error);
                setError('Failed to start speech recognition.');
                stopRecognition();
            }
        }
    };

    /** Initial effect to fetch the first question when the component mounts. */
    useEffect(() => {
        void fetchNewQuestion();
    }, []);

    /** Effect to clean up speech recognition on unmount. */
    useEffect(() => {
        return () => {
            stopRecognition();
        };
    }, []);

    /** Helper flag to disable inputs/buttons during loading or when finished for the day. */
    const noInteraction = loading || question === "No more questions for today! Please reset or come back tomorrow!";
    /** Helper flag to enable/disable the submit button based on state and response content. */
    const canSubmit = !loading && !!response.trim() && question !== "No more questions for today! Please reset or come back tomorrow!";
    /** Helper flag to disable the microphone button if API is unsupported or during loading/finished state. */
    const micDisabled = !SpeechRecognition || noInteraction;

    return (
        <div className={`${type}-questions`}>
            <PageHeader
                title={title}
                subtitle={subtitle || "Practice your responses and get AI feedback"}
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
                        onClick={handleSkip}
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
                            <p>{question || "No question loaded."}</p>
                        </div>

                        {!feedback ? (
                            <div className="response-section">
                                <textarea
                                    value={response}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponse(e.target.value)}
                                    placeholder={type === 'behavioral' ? "Use the STAR method: Describe the Situation, Task, Action, and Result..." : "Enter your response here..."}
                                    disabled={noInteraction}
                                />
                                <div className="response-buttons">
                                    <Button
                                        text="Get Feedback"
                                        onClick={submitResponse}
                                        disabled={!canSubmit}
                                        className="submit-button"
                                    />
                                    <Button
                                        text="🎤"
                                        onClick={toggleListening}
                                        disabled={micDisabled}
                                        className={`mic-button ${isListening ? 'active' : ''} ${!SpeechRecognition ? 'disabled-feature' : ''}`}
                                    />
                                </div>
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
                                <div className="feedback-text"
                                     style={{whiteSpace: 'pre-wrap'}}>{feedback.feedback}</div>
                                <div className="button-group">
                                    <Button
                                        text="Try Again"
                                        onClick={handleRetry}
                                        className="retry-button"
                                        disabled={loading}
                                    />
                                    <Button
                                        text="Next Question"
                                        onClick={handleNext}
                                        className="next-button"
                                        disabled={loading || feedback.rating < 6}
                                    />
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