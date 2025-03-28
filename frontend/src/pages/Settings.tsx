import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './Settings.css';
import { API_CONFIG } from '../services/config';
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
}

const API_BASE_URLS: Record<string, string> = {
    behavioral: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BEHAVIORAL,
    technical: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.TECHNICAL
};

const SETTINGS_CATEGORIES = [
    { id: 'behavioral', label: 'Behavioral Questions' },
    { id: 'technical', label: 'Technical Questions' }
];

const QuestionPanel: React.FC<QuestionPanelProps> = ({
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
    cancelDelete
}) => (
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
                placeholder={`Enter your ${type} question here...`}
                required
            />
            <button type="submit" className="submit-button">Add Question</button>
        </form>
        
        <div className="question-list">
            <h2>Existing {type.charAt(0).toUpperCase() + type.slice(1)} Questions</h2>
            <ul>
                {questions.map((q: Question) => (
                    <li key={q.id} className="question-item">
                        {q.question}
                        <button onClick={() => handleDelete(q.id)} className="delete-button">Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'behavioral' | 'technical'>('behavioral');
    const [question, setQuestion] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
    const navigate = useNavigate();

    const fetchQuestions = async (): Promise<void> => {
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
            const data: Question[] = await response.json();
            setQuestions(data);
        } catch (error) {
            setError('Failed to load questions. Please try again.');
        }
    };

    const handleTabChange = (categoryId: string): void => {
        setError(null);
        setSuccess(null);
        setConfirmation(null);
        setQuestion('');
        setActiveTab(categoryId as 'behavioral' | 'technical');
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URLS[activeTab]}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error('Failed to add question');
            }

            setSuccess('Question added successfully!');
            setQuestion('');
            fetchQuestions();
        } catch (error) {
            setError('Failed to add question. Please try again.');
        }
    };

    const handleDelete = (id: number): void => {
        setConfirmation({
            id,
            message: 'Are you sure you want to delete this question?'
        });
    };

    const confirmDelete = async (id: number): Promise<void> => {
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

            setSuccess('Question deleted successfully!');
            setConfirmation(null);
            fetchQuestions();
        } catch (error) {
            setError('Failed to delete question. Please try again.');
        }
    };

    const cancelDelete = (): void => {
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
            />
        </div>
    );
};

export default Settings;