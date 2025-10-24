import React, {useState, useEffect, useCallback} from 'react';
import Button from '../components/Button';
import {API_CONFIG} from '@/services/config';
import ToggleSwitch from '../components/ToggleSwitch';
import {useLocation} from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import '@/styles/dashboard.css';
import '@/styles/practice.css';

interface Question {
    id: number;
    question: string;
    type: 'behavioral' | 'technical';
}

interface ConfirmationState {
    id: number;
    message: string;
}

interface QuestionPanelProps {
    type: 'behavioral' | 'technical';
    error: string | null;
    success: string | null;
    confirmation: ConfirmationState | null;
    question: string;
    setQuestion: (question: string) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    questions: Question[];
    handleDelete: (id: number) => void;
    confirmDelete: (id: number) => Promise<void>;
    cancelDelete: () => void;
    isLoading?: boolean;
}

const API_BASE_URLS: Record<string, string> = {
    behavioral: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BEHAVIORAL,
    technical: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.TECHNICAL
};

/**
 * Renders the UI panel for adding and listing questions for a specific category.
 * This includes the input form, question list, and message displays.
 */
const QuestionPanel = ({
                           type,
                           error,
                           success,
                           confirmation,
                           question,
                           setQuestion,
                           handleSubmit,
                           questions,
                           handleDelete,
                           confirmDelete,
                           cancelDelete,
                           isLoading
                       }: QuestionPanelProps) => (
    <div className="space-y-4">
        {error && (
            <div className="rounded-xl border border-danger bg-danger/10 px-4 py-3 text-danger" role="alert">
                {error}
            </div>
        )}
        {success && (
            <output className="rounded-xl border border-emerald-500 bg-emerald-500/10 px-4 py-3 text-emerald-600">
                {success}
            </output>
        )}
        {confirmation && !success && !error && (
            <div className="space-y-4">
                <p className="text-white/90">{confirmation.message}</p>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={cancelDelete}
                        text="Cancel"
                        variant="outline"
                        className="tw-rounded-xl tw-border tw-border-white/50 !tw-text-white !tw-font-semibold hover:tw-bg-white/10"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={() => confirmDelete(confirmation.id)}
                        text="Confirm"
                        className="bg-white text-[#2563EB] rounded-xl shadow-md hover:brightness-105"
                        disabled={isLoading}
                    />
                </div>
            </div>
        )}
        {!confirmation && (
            <>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                        value={question}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
                        placeholder={`Enter your ${type} question here...`}
                        required
                        disabled={isLoading}
                        className="white-field w-full p-4 placeholder:text-gray-500"
                        style={{minHeight: 140, resize: 'vertical'}}
                    />
                    <Button
                        type="submit"
                        text="Add Question"
                        variant="outline"
                        className="tw-rounded-xl tw-border tw-border-white/50 !tw-text-white !tw-font-semibold hover:tw-bg-white/10"
                        disabled={isLoading || !question.trim()}
                    />
                </form>

                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-white">Existing {type.charAt(0).toUpperCase() + type.slice(1)} Questions ({questions.length})</h2>
                    {isLoading && questions.length === 0 && <p className="text-white/80">Loading questions...</p>}
                    {!isLoading && questions.length === 0 && <p className="text-white/80">No questions added yet.</p>}
                    <div className="space-y-2">
                        {questions.map((q: Question) => (
                            <div
                                key={q.id}
                                className="rounded-xl border px-4 py-4 flex items-center justify-between gap-3 min-h-[60px]"
                                style={{ borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' }}
                            >
                                <span className="text-white/90 flex-1 text-left py-2">{q.question}</span>
                                <button
                                    onClick={() => handleDelete(q.id)}
                                    disabled={isLoading}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: '#dc2626',
                                        border: '2px solid #dc2626',
                                        color: '#ffffff',
                                        boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.backgroundColor = '#b91c1c';
                                            e.currentTarget.style.borderColor = '#b91c1c';
                                            e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(220, 38, 38, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.backgroundColor = '#dc2626';
                                            e.currentTarget.style.borderColor = '#dc2626';
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(220, 38, 38, 0.3)';
                                        }
                                    }}
                                    aria-label="Delete question"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>
);

/**
 * Settings page component allowing users to manage their custom
 * behavioral and technical interview questions via different tabs.
 */
const Settings = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = (queryParams.get('type') as 'behavioral' | 'technical') || 'behavioral';
    
    const [activeTab, setActiveTab] = useState<'behavioral' | 'technical'>(initialTab);
    const [question, setQuestion] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /** Fetches all questions for the currently active tab from the backend API. */
    const fetchQuestions = async (signal?: AbortSignal): Promise<void> => {
        setIsLoading(true);
        // Avoid clearing messages on read operations, only on actions
        try {
            const response = await fetch(`${API_BASE_URLS[activeTab]}/all`, {
                credentials: 'include',
                signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error fetching questions: ${response.status}`);
            }
            const data: Question[] = await response.json();
            if (!signal?.aborted) {
                setQuestions(data);
            }
        } catch (err) {
            if (err instanceof Error) {
                if (err.name !== 'AbortError' && !signal?.aborted) {
                    setError('Failed to load questions. Please try again.');
                    console.error('Error fetching questions:', err);
                }
            } else if (!signal?.aborted) {
                setError('An unknown error occurred fetching questions.');
                console.error('Unknown error fetching questions:', err);
            }
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false);
            }
        }
    };

    /** Handles switching between 'behavioral' and 'technical' tabs. */
    const handleTabChange = useCallback((categoryId: string): void => {
        setError(null);
        setSuccess(null);
        setConfirmation(null);
        setQuestion('');
        setQuestions([]);
        setActiveTab(categoryId as 'behavioral' | 'technical');
        // The useEffect hook watching activeTab will trigger fetchQuestions
    }, []); // Memoized as it doesn't depend on changing state/props

    /** Handles the form submission to add a new question via API POST request. */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setConfirmation(null);
        const abortController = new AbortController();

        try {
            const response = await fetch(`${API_BASE_URLS[activeTab]}/add`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({question})
            });

            if (!response.ok) {
                throw new Error(`HTTP error adding question: ${response.status}`);
            }

            setSuccess('Question added successfully!');
            setQuestion('');
            await fetchQuestions(abortController.signal);

        } catch (err) {
            if (err instanceof Error) {
                if (err.name !== 'AbortError') {
                    setError('Failed to add question. Please try again.');
                    console.error('Error adding question:', err);
                }
            } else {
                setError('An unknown error occurred adding question.');
                console.error('Unknown error adding question:', err);
            }
            // Loading state is handled by the fetchQuestions finally block
        }
    };

    /** Sets state to show the delete confirmation dialog for a specific question. */
    const handleDelete = (id: number): void => {
        setError(null);
        setSuccess(null);
        setConfirmation({
            id,
            message: 'Are you sure you want to delete this question?'
        });
    };

    /** Sends the API request to delete the confirmed question. */
    const confirmDelete = async (id: number): Promise<void> => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setConfirmation(null);
        const abortController = new AbortController();

        try {
            const response = await fetch(`${API_BASE_URLS[activeTab]}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error deleting question: ${response.status}`);
            }

            setSuccess('Question deleted successfully!');
            await fetchQuestions(abortController.signal);

        } catch (err) {
            if (err instanceof Error) {
                if (err.name !== 'AbortError') {
                    setError('Failed to delete question. Please try again.');
                    console.error('Error deleting question:', err);
                }
            } else {
                setError('An unknown error occurred deleting question.');
                console.error('Unknown error deleting question:', err);
            }
            // Loading state is handled by the fetchQuestions finally block
        }
    };

    /** Hides the delete confirmation dialog. */
    const cancelDelete = (): void => {
        setConfirmation(null);
    };

    /** Effect hook to fetch questions when the active tab changes. */
    useEffect(() => {
        const abortController = new AbortController();
        void fetchQuestions(abortController.signal);

        return () => {
            abortController.abort();
        };
    }, [activeTab]);

    return (
        <main className="dash-container">
            <div className="dash-inner">
                <section className="practice-hero max-w-4xl mx-auto">
                    <div className="decor-top-right" />
                    <div className="decor-bottom-left" />
                    <div className="practice-hero-content">
                        <div className="text-center">
                            <h1>Settings</h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.92)' }}>
                                Customize your interview questions
                            </p>
                        </div>
                    </div>
                </section>

                <div className="max-w-4xl mx-auto flex flex-col gap-4 py-6">
                    <ToggleSwitch
                        leftOption="Behavioral Questions"
                        rightOption="Technical Questions"
                        leftValue="behavioral"
                        rightValue="technical"
                        selectedValue={activeTab}
                        onChange={handleTabChange}
                        id="settings-question-toggle"
                    />

                    <section className="feature-card feature-card--blue-cc rounded-2xl p-6 shadow-lg w-full">
                        <div className="decor-top-right" />
                        <div className="decor-bottom-left" />
                        <div className="feature-card-content space-y-6">
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
                                isLoading={isLoading}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Settings;