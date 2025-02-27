import React, { useState, useEffect } from "react";
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
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            handleApiError(error, "fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    // Add new job
    const handleAddJob = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.company || !formData.location) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, status: "APPLIED" }),
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const addedJob = await response.json();
            setJobs(prev => [...prev, addedJob]);
            resetForm();
        } catch (error) {
            handleApiError(error, "add job");
        } finally {
            setLoading(false);
        }
    };

    // Update job
    const handleUpdateJob = async (e) => {
        e.preventDefault();
        if (!editingJobId) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/${editingJobId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const updatedJob = await response.json();
            setJobs(jobs.map(job => 
                job.id === editingJobId ? updatedJob : job
            ));
            resetForm();
        } catch (error) {
            handleApiError(error, "update job");
        } finally {
            setLoading(false);
        }
    };

    // Delete job
    const handleDeleteJob = async (jobId) => {
        if (window.confirm("Are you sure you want to delete this job application?")) {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/${jobId}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                setJobs(jobs.filter((job) => job.id !== jobId));
            } catch (error) {
                handleApiError(error, "delete job");
            } finally {
                setLoading(false);
            }
        }
    };

    // Handle edit mode
    const handleEditJob = (job) => {
        setEditingJobId(job.id);
        setFormData({
            title: job.title,
            company: job.company,
            location: job.location,
            status: job.status
        });
    };

    // Reset form
    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE);
        setEditingJobId(null);
        setError(null);
    };

    // Initial fetch
    useEffect(() => {
        fetchJobs();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const renderForm = () => (
        <form onSubmit={editingJobId ? handleUpdateJob : handleAddJob} className="job-input">
            <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Job Title"
                className="job-input-field"
                required
            />
            <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Company"
                className="job-input-field"
                required
            />
            <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
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
                        onClick={resetForm}
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
                {jobs.map((job) => (
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
                                onClick={() => handleEditJob(job)}
                                className="edit-job-button"
                                disabled={loading}
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDeleteJob(job.id)}
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
