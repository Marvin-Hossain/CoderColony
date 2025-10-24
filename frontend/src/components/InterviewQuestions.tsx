import React, {useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import Button from './Button';
import { Settings as SettingsIcon } from 'lucide-react';
import {API_CONFIG} from '@/services/config';
import MicIcon from './icons/MicIcon';
import '@/styles/dashboard.css';
import '@/styles/practice.css';

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
 * allows text input, sends responses for AI evaluation,
 * and displays feedback.
 */
const InterviewQuestions = ({type, title, subtitle}: InterviewQuestionsProps) => {
    const endpointPath = type === 'behavioral'
        ? API_CONFIG.ENDPOINTS.BEHAVIORAL
        : API_CONFIG.ENDPOINTS.TECHNICAL;
    const API_BASE_URL = `${API_CONFIG.BASE_URL}${endpointPath}`;
    const [question, setQuestion] = useState<string>('');
    const [response, setResponse] = useState<string>('');
    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showResetButton, setShowResetButton] = useState<boolean>(false);
    
    // Speech recognition states and refs
    const [isListening, setIsListening] = useState<boolean>(false);
    const recognitionRef = useRef<any>(null);
    
    // Check if speech recognition is available in the browser
    const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
    const navigate = useNavigate();

    /** Fetches a new question from the backend API. */
    const fetchNewQuestion = async (): Promise<void> => {
        setLoading(true);
        setError(null);
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
                setError('Failed to start speech recognition.');
                stopRecognition();
            }
        }
    };

    /** Initial effect to fetch the first question when the component mounts. */
    useEffect(() => {
        void fetchNewQuestion();
    }, []);
    
    /** Cleanup effect to ensure speech recognition is stopped when component unmounts */
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

    const navigateToSettings = () => {
        navigate(`/settings?type=${type}`);
    };

    const headerButtons = (
        <div className="flex flex-wrap items-center gap-2">
            {showResetButton ? (
                <Button
                    text="Reset"
                    onClick={resetQuestions}
                    variant="outline"
                    className="tw-rounded-xl tw-border tw-border-white/50 !tw-text-white !tw-font-semibold hover:tw-bg-white/10"
                    disabled={loading}
                />
            ) : (
                <button
                    type="button"
                    onClick={handleSkip}
                    disabled={loading}
                    className={`inline-flex h-12 items-center justify-center tw-rounded-xl tw-border tw-border-white/50 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent tw-bg-transparent hover:tw-bg-transparent focus:tw-bg-transparent active:tw-bg-transparent !tw-text-white !tw-font-semibold cursor-pointer px-4 py-2 ${loading ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: 'transparent' }}
                >
                    Reset
                </button>
            )}
            <button
                type="button"
                onClick={navigateToSettings}
                aria-label="Open settings"
                className={`inline-flex h-12 w-12 items-center justify-center tw-rounded-xl tw-border tw-border-white/50 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent tw-bg-transparent hover:tw-bg-transparent focus:tw-bg-transparent active:tw-bg-transparent !tw-text-white !tw-font-semibold cursor-pointer`}
                style={{ backgroundColor: 'transparent' }}
            >
                <SettingsIcon size={22} />
            </button>
        </div>
    );

    return (
        <main className="dash-container">
            <div className="dash-inner">
                <section className="practice-hero max-w-4xl mx-auto">
                    <div className="decor-top-right" />
                    <div className="decor-bottom-left" />
                    <div className="practice-hero-content">
                        <div className="flex items-center justify-between gap-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div>
                                <h1>{title}</h1>
                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.92)' }}>
                                    {subtitle || 'Practice your responses and get AI feedback'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">{headerButtons}</div>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl border border-danger bg-danger/10 px-4 py-3 text-danger" role="alert">
                        {error}
                    </div>
                )}

                <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 py-12">
                    {loading ? (
                        <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-2xl p-8 text-muted-foreground shadow-md" style={{ background: '#FFFFFF' }}>
                            <span
                                className="inline-block h-12 w-12 animate-spin rounded-full"
                                style={{
                                    borderWidth: '4px',
                                    borderStyle: 'solid',
                                    borderColor: 'rgba(77, 107, 254, 0.2)',
                                    borderTopColor: '#2563EB'
                                }}
                            />
                            <p className="text-sm">Loading...</p>
                        </div>
                    ) : (
                        <section className="feature-card feature-card--blue-cc rounded-2xl p-8 shadow-lg w-full">
                            <div className="decor-top-right" />
                            <div className="decor-bottom-left" />
                            <div className="feature-card-content space-y-6">
                                <header className="space-y-2">
                                    <h2 className="text-sm font-semibold text-white">Question</h2>
                                    <p className="text-lg font-semibold leading-relaxed text-white/90">
                                        {question || 'No question loaded.'}
                                    </p>
                                </header>

                                {feedback ? (
                                    <>
                                        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-white" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
                                            Score: {feedback.rating}/10
                                            {feedback.rating < 6 && (
                                                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.92)' }}>
                                                    Need at least 6/10 to advance
                                                </span>
                                            )}
                                        </div>
                                        <div className="white-field p-4 text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                                            {feedback.feedback}
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                text="Try Again"
                                                onClick={handleRetry}
                                                variant="outline"
                                                className="w-full sm:w-auto tw-rounded-xl tw-border tw-border-white/50 !tw-text-white !tw-font-semibold hover:tw-bg-white/10"
                                                disabled={loading}
                                            />
                                            <Button
                                                text="Next Question"
                                                onClick={handleNext}
                                                className="w-full sm:w-auto bg-white text-[#2563EB] rounded-xl shadow-md hover:brightness-105"
                                                disabled={loading || feedback.rating < 6}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <textarea
                                            value={response}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponse(e.target.value)}
                                            placeholder={type === 'behavioral'
                                                ? 'Use the STAR method: describe the Situation, Task, Action, and Result...'
                                                : 'Enter your response here...'}
                                            disabled={noInteraction}
                                            className="white-field w-full p-4 placeholder:text-gray-500"
                                            style={{minHeight: 180, resize: 'vertical'}}
                                        />
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Button
                                                text="Get Feedback"
                                                onClick={submitResponse}
                                                disabled={!canSubmit}
                                                variant="outline"
                                                className="w-full sm:w-auto tw-rounded-xl tw-border tw-border-white/50 !tw-text-white !tw-font-semibold hover:tw-bg-white/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleListening}
                                                disabled={micDisabled}
                                                aria-pressed={isListening}
                                            className={`inline-flex h-12 w-12 items-center justify-center rounded-full tw-border tw-border-white/50 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent tw-bg-transparent hover:tw-bg-transparent focus:tw-bg-transparent active:tw-bg-transparent tw-text-white cursor-pointer transition-transform ${micDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                style={{transition: 'all 0.2s ease', backgroundColor: 'transparent'}}
                                            >
                                                <MicIcon isActive={isListening}/>
                                            </button>
                                        </div>
                                        {SpeechRecognition == null && (
                                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.92)' }}>
                                                Speech recognition is not supported by this browser.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </main>
    );
};

export default InterviewQuestions; 
