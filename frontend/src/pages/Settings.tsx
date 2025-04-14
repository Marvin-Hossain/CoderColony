import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './Settings.css';
import { API_CONFIG } from '@/services/config';
import PageHeader from '../components/PageHeader';
import CategoryTabs from '../components/CategoryTabs';

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

const SETTINGS_CATEGORIES = [
    { id: 'behavioral', label: 'Behavioral Questions' },
    { id: 'technical', label: 'Technical Questions' }
];

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
    <div className={`${type}-tab`}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {confirmation && !success && !error && (
            <div className="confirmation-message">
                <p>{confirmation.message}</p>
                <div className="confirmation-buttons">
                    <Button onClick={cancelDelete} text="Cancel" className="cancel-button" disabled={isLoading} />
                    <Button onClick={() => confirmDelete(confirmation.id)} text="Confirm" className="confirm-button" disabled={isLoading} />
                </div>
            </div>
        )}
        {!confirmation && (
            <>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={question}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
                        placeholder={`Enter your ${type} question here...`}
                        required
                        disabled={isLoading}
                    />
                    <Button type="submit" className="submit-button" text="Add Question" disabled={isLoading || !question.trim()} />
                </form>

                <div className="question-list">
                    <h2>Existing {type.charAt(0).toUpperCase() + type.slice(1)} Questions ({questions.length})</h2>
                    {isLoading && questions.length === 0 && <p>Loading questions...</p>}
                    {!isLoading && questions.length === 0 && <p>No questions added yet.</p>}
                    <ul>
                        {questions.map((q: Question) => (
                            <li key={q.id} className="question-item">
                                <span className="question-text">{q.question}</span>
                                <Button onClick={() => handleDelete(q.id)} text="Delete" className="delete-button" disabled={isLoading} />
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        )}
    </div>
);

const Settings = () => {
    const [activeTab, setActiveTab] = useState<'behavioral' | 'technical'>('behavioral');
    const [question, setQuestion] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchQuestions = async (signal?: AbortSignal): Promise<void> => {
        setIsLoading(true);
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
            } else {
                if (!signal?.aborted) {
                    setError('An unknown error occurred fetching questions.');
                    console.error('Unknown error fetching questions:', err);
                }
            }
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false);
            }
        }
    };

    const handleTabChange = useCallback((categoryId: string): void => {
        setError(null);
        setSuccess(null);
        setConfirmation(null);
        setQuestion('');
        setQuestions([]);
        setActiveTab(categoryId as 'behavioral' | 'technical');
    }, []);

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
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ question })
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
        }
    };

    const handleDelete = (id: number): void => {
        setError(null);
        setSuccess(null);
        setConfirmation({
            id,
            message: 'Are you sure you want to delete this question?'
        });
    };

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
        }
    };

    const cancelDelete = (): void => {
        setConfirmation(null);
    };

    useEffect(() => {
        const abortController = new AbortController();
        fetchQuestions(abortController.signal);

        return () => {
            abortController.abort();
        };
    }, [activeTab]);

    return (
        <div className="settings">
            <PageHeader 
                title="Settings"
                onBack={() => navigate('/dashboard')}
            />
            
            <CategoryTabs 
                categories={SETTINGS_CATEGORIES}
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
                isLoading={isLoading}
            />
        </div>
    );
};

export default Settings;