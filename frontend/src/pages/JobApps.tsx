import React, { useState, useEffect, useMemo } from "react";
import "./JobApps.css";
import Button from "../components/Button";
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '@/services/config';
import PageHeader from "../components/PageHeader";
import { formatDate } from '@/services/dateUtils';

const API_BASE_URL = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.JOBS;

interface JobApplication {
    id: number;
    title: string;
    company: string;
    location: string;
    status: 'APPLIED' | 'INTERVIEWED' | 'REJECTED';
    createdAt: string;
}

interface FormData {
    title: string;
    company: string;
    location: string;
    status: JobApplication['status'];
}

const INITIAL_FORM_STATE: FormData = {
    title: "",
    company: "",
    location: "",
    status: "APPLIED"
};

const JobApps = () => {
    const [jobs, setJobs] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editingJobId, setEditingJobId] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
    const navigate = useNavigate();

    const fetchJobs = async (signal: AbortSignal): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL, {
                credentials: 'include',
                signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data: JobApplication[] = await response.json();
            if (!signal.aborted) {
                setJobs(data);
            }
        } catch (err) {
            if (err instanceof Error) {
                if (err.name !== 'AbortError' && !signal.aborted) {
                    setError('Failed to fetch jobs. Please try again.');
                    console.error('Error fetching jobs:', err);
                }
            } else {
                if (!signal.aborted) {
                    setError('An unknown error occurred while fetching jobs.');
                    console.error('Unknown error fetching jobs:', err);
                }
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    };

    const addJob = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const abortController = new AbortController();
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchJobs(abortController.signal);
            if (!abortController.signal.aborted) {
                setFormData(INITIAL_FORM_STATE);
            }
        } catch (err) {
            if (err instanceof Error) {
                if (err.name !== 'AbortError') {
                    setError('Failed to add job. Please try again.');
                    console.error('Error adding job:', err);
                }
            } else {
                setError('An unknown error occurred while adding job.');
                console.error('Unknown error adding job:', err);
            }
        }
    };

    const updateJob = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!editingJobId) return;

        setLoading(true);
        setError(null);
        const abortController = new AbortController();
        try {
            const response = await fetch(`${API_BASE_URL}/${editingJobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchJobs(abortController.signal);
            if (!abortController.signal.aborted) {
                setFormData(INITIAL_FORM_STATE);
                setEditingJobId(null);
            }
        } catch (err) {
            if (err instanceof Error) {
                if (err.name !== 'AbortError') {
                    setError('Failed to update job. Please try again.');
                    console.error('Error updating job:', err);
                }
            } else {
                setError('An unknown error occurred while updating job.');
                console.error('Unknown error updating job:', err);
            }
        }
    };

    const deleteJob = async (id: number): Promise<void> => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        
        setLoading(true);
        setError(null);
        const abortController = new AbortController();
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchJobs(abortController.signal);
        } catch (err) {
            if (err instanceof Error) {
                if (err.name !== 'AbortError') {
                    setError('Failed to delete job. Please try again.');
                    console.error('Error deleting job:', err);
                }
            } else {
                setError('An unknown error occurred while deleting job.');
                console.error('Unknown error deleting job:', err);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const startEdit = (job: JobApplication): void => {
        setFormData({
            title: job.title,
            company: job.company,
            location: job.location,
            status: job.status
        });
        setEditingJobId(job.id);
    };

    const cancelEdit = (): void => {
        setFormData(INITIAL_FORM_STATE);
        setEditingJobId(null);
    };

    useEffect(() => {
        const abortController = new AbortController();
        fetchJobs(abortController.signal);

        return () => {
            abortController.abort();
        };
    }, []);

    const sortedJobs = useMemo(() => {
        return [...jobs].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
    }, [jobs]);

    return (
        <div className="job-apps">
            <PageHeader 
                title="Job Applications"
                subtitle="Track your job applications"
                onBack={() => navigate('/dashboard')}
            />

            {error && <div className="error-message">{error}</div>}

            <main className="job-apps-main">
                <form onSubmit={editingJobId ? updateJob : addJob} className="job-input">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Job Title"
                        className="job-input-field"
                        required
                    />
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company"
                        className="job-input-field"
                        required
                    />
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Location (City, ST or Remote)"
                        className="job-input-field"
                        required
                        pattern="^(Remote|[A-Za-z\s]+,\s*[A-Z]{2})$"
                        title="Please enter location as 'City, ST' or 'Remote'"
                    />
                    {editingJobId && (
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="job-input-field"
                        >
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEWED">Interviewed</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    )}
                    <div className="form-buttons">
                        <Button
                            type="submit"
                            disabled={loading}
                            text={loading ? "Processing..." : editingJobId ? "Update Job" : "Add Job"}
                            className={editingJobId ? "update-job-button" : "add-job-button"}
                        />
                        {editingJobId && (
                            <Button
                                type="button"
                                onClick={cancelEdit}
                                text="Cancel"
                                className="cancel-button"
                            />
                        )}
                    </div>
                </form>

                <div className="job-list">
                    <h2>Job Applications ({sortedJobs.length})</h2>
                    {loading && jobs.length === 0 && <div>Loading...</div>}
                    {!loading && jobs.length === 0 && <p>No jobs logged yet. Start adding applications!</p>}
                    <ul>
                        {sortedJobs.map((job) => (
                            <li key={job.id} className="job-item">
                                <div className="job-info">
                                    <strong>{job.title}</strong>
                                    <span>{job.company}</span>
                                    <span>{job.location}</span>
                                    <div className="job-meta">
                                        <span className={`status-badge ${job.status.toLowerCase()}`}>
                                            {job.status}
                                        </span>
                                        <span className="date">
                                            {formatDate(job.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="job-actions">
                                    <Button
                                        onClick={() => startEdit(job)}
                                        text="Edit"
                                        className="edit-job-button"
                                        disabled={loading || !!editingJobId}
                                    />
                                    <Button
                                        onClick={() => deleteJob(job.id)}
                                        text="Delete"
                                        className="delete-job-button"
                                        disabled={loading || !!editingJobId}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default JobApps;
