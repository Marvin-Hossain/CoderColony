import React, { useState, useEffect, useMemo } from "react";
import "./JobApps.css";
import Button from "../components/Button";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8080/api/jobs";

const INITIAL_FORM_STATE = {
    title: "",
    company: "",
    location: "",
    status: "APPLIED"
};

const JobApps = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingJobId, setEditingJobId] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const navigate = useNavigate();

    // Reusable error handler
    const handleApiError = (error, action) => {
        setError(`Failed to ${action}. Please try again.`);
        console.error(`Error ${action}:`, error);
        setLoading(false);
    };

    // Fetch jobs
    const fetchJobs = async () => {
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
            
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            handleApiError(error, "fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    // Add job
    const addJob = async (e) => {
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
            handleApiError(error, "add job");
        }
    };

    // Update job
    const updateJob = async (e) => {
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
            handleApiError(error, "update job");
        }
    };

    // Delete job
    const deleteJob = async (id) => {
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
            handleApiError(error, "delete job");
        }
    };

    // Update job status
    const updateJobStatus = async (id, status) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
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
            handleApiError(error, "update status");
        }
    };

    // Form change handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Start editing job
    const startEdit = (job) => {
        setFormData({
            title: job.title,
            company: job.company,
            location: job.location,
            status: job.status
        });
        setEditingJobId(job.id);
    };

    // Cancel editing
    const cancelEdit = () => {
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
            return dateB - dateA; // Most recent first
        });
    }, [jobs]);

    const renderForm = () => (
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
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
    );

    const renderJobs = () => (
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
                                    {new Date(job.createdAt).toLocaleDateString()}
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
    );

    return (
        <div className="job-apps">
            <header className="job-apps-header">
                <Button 
                    text="Back" 
                    onClick={() => navigate('/dashboard')} 
                    className="back-button"
                />
                <h1>Job Applications</h1>
                <p>Track your job applications</p>
            </header>

            {error && <div className="error-message">{error}</div>}

            <main className="job-apps-main">
                {renderForm()}
                {renderJobs()}
            </main>
        </div>
    );
};

export default JobApps;
