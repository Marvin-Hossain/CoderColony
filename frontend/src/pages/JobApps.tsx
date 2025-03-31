import React, { useState, useEffect, useMemo } from "react";
import "./JobApps.css";
import Button from "../components/Button";
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../services/config';
import PageHeader from "../components/PageHeader";
import { formatDate } from '../services/dateUtils';

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

const JobApps: React.FC = () => {
    const [jobs, setJobs] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editingJobId, setEditingJobId] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
    const navigate = useNavigate();

    // Fetch jobs
    const fetchJobs = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error(`Error: ${response.status}`);
            }
            
            const data: JobApplication[] = await response.json();
            setJobs(data);
        } catch (error) {
            setError('Failed to fetch jobs. Please try again.');
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add job
    const addJob = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error(`Error: ${response.status}`);
            }
            
            await fetchJobs();
            setFormData(INITIAL_FORM_STATE);
        } catch (error) {
            setError('Failed to add job. Please try again.');
            console.error('Error adding job:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update job
    const updateJob = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${editingJobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error(`Error: ${response.status}`);
            }
            
            await fetchJobs();
            setFormData(INITIAL_FORM_STATE);
            setEditingJobId(null);
        } catch (error) {
            setError('Failed to update job. Please try again.');
            console.error('Error updating job:', error);
        } finally {
            setLoading(false);
        }
    };

    // Delete job
    const deleteJob = async (id: number): Promise<void> => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/');
                    return;
                }
                throw new Error(`Error: ${response.status}`);
            }
            
            await fetchJobs();
        } catch (error) {
            setError('Failed to delete job. Please try again.');
            console.error('Error deleting job:', error);
        } finally {
            setLoading(false);
        }
    };

    // Form change handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Start editing job
    const startEdit = (job: JobApplication): void => {
        setFormData({
            title: job.title,
            company: job.company,
            location: job.location,
            status: job.status
        });
        setEditingJobId(job.id);
    };

    // Cancel editing
    const cancelEdit = (): void => {
        setFormData(INITIAL_FORM_STATE);
        setEditingJobId(null);
    };

    // Load jobs on component mount
    useEffect(() => {
        fetchJobs();
    }, []);

    // Add sorting with useMemo
    const sortedJobs = useMemo(() => {
        return [...jobs].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime(); // Most recent first
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
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={editingJobId ? "update-job-button" : "add-job-button"}
                        >
                            {loading ? "Processing..." : editingJobId ? "Update Job" : "Add Job"}
                        </button>
                        {editingJobId && (
                            <button 
                                type="button" 
                                onClick={cancelEdit}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                <div className="job-list">
                    <h2>Job Applications ({jobs.length})</h2>
                    {loading && !jobs.length && <div>Loading...</div>}
                    {!loading && !jobs.length && <p>No jobs logged yet. Start adding applications!</p>}
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
                                    <button 
                                        onClick={() => startEdit(job)}
                                        className="edit-job-button"
                                        disabled={loading}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => deleteJob(job.id)}
                                        className="delete-job-button"
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
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
