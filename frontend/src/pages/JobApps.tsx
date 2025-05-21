import React, {useState, useEffect, useMemo} from "react";
import "./JobApps.css";
import Button from "../components/Button";
import {API_CONFIG} from '@/services/config';
import PageHeader from "../components/PageHeader";
import {formatDate} from '@/services/dateUtils';
import Card from "../components/Card";
import CardItem from "../components/CardItem";

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

/**
 * Page component for managing job applications (CRUD operations).
 * Displays a list of applications and a form to add or edit entries.
 */
const JobApps = () => {
    const [jobs, setJobs] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editingJobId, setEditingJobId] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
    const [expandedJobIds, setExpandedJobIds] = useState<Set<number>>(new Set());
    const [inlineEditData, setInlineEditData] = useState<FormData | null>(null);

    /** Toggles the expanded state of a job item */
    const toggleJobExpand = (jobId: number): void => {
        setExpandedJobIds(prevState => {
            const newState = new Set(prevState);
            if (newState.has(jobId)) {
                newState.delete(jobId);
                // Also close edit mode if open
                if (editingJobId === jobId) {
                    setEditingJobId(null);
                    setInlineEditData(null);
                }
            } else {
                newState.add(jobId);
            }
            return newState;
        });
    };

    /** Fetches all job applications from the backend. Accepts AbortSignal for cancellation. */
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

    /** Handles form submission for adding a new job application. */
    const addJob = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const abortController = new AbortController();
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
        } finally {
            setLoading(false);
        }
    };

    /** Handles form submission for updating an existing job application. */
    const updateJob = async (jobId: number, data: FormData): Promise<void> => {
        setLoading(true);
        setError(null);
        const abortController = new AbortController();
        try {
            const response = await fetch(`${API_BASE_URL}/${jobId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchJobs(abortController.signal);
            if (!abortController.signal.aborted) {
                setEditingJobId(null);
                setInlineEditData(null);
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
        } finally {
            setLoading(false);
        }
    };

    /** Handles deleting a job application after user confirmation. */
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

    /** Updates form data state when input fields change. */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    /** Updates inline edit data when input fields change */
    const handleInlineEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const {name, value} = e.target;
        if (inlineEditData) {
            setInlineEditData({
                ...inlineEditData,
                [name]: value
            });
        }
    };

    /** Starts inline editing for a job */
    const startInlineEdit = (job: JobApplication): void => {
        setInlineEditData({
            title: job.title,
            company: job.company,
            location: job.location,
            status: job.status
        });
        setEditingJobId(job.id);
        
        // Make sure the job card is expanded
        setExpandedJobIds(prev => {
            const newSet = new Set(prev);
            newSet.add(job.id);
            return newSet;
        });
    };

    /** Saves the inline edit changes */
    const saveInlineEdit = (jobId: number): void => {
        if (inlineEditData) {
            updateJob(jobId, inlineEditData);
        }
    };

    /** Cancels the inline edit */
    const cancelInlineEdit = (): void => {
        setEditingJobId(null);
        setInlineEditData(null);
    };

    /** Effect to fetch initial job applications when the component mounts. */
    useEffect(() => {
        const abortController = new AbortController();
        void fetchJobs(abortController.signal);

        return () => {
            abortController.abort();
        };
    }, []);

    /** Memoized calculation to sort jobs by creation date (newest first). */
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
            />

            {error && <div className="error-message">{error}</div>}

            <main className="job-apps-main">
                <Card 
                    className="job-input" 
                    accent="top" 
                    title="Add New Job"
                    size="lg"
                >
                    <form onSubmit={addJob}>
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
                        <div className="form-buttons">
                            <Button
                                type="submit"
                                disabled={loading}
                                text={loading ? "Processing..." : "Add Job"}
                                className="add-job-button"
                            />
                        </div>
                    </form>
                </Card>

                <Card 
                    className="job-list" 
                    accent="top" 
                    title={`Job Applications (${sortedJobs.length})`}
                >
                    {loading && jobs.length === 0 && <div>Loading...</div>}
                    {!loading && jobs.length === 0 && <p>No jobs logged yet. Start adding applications!</p>}
                    <ul>
                        {sortedJobs.map((job) => (
                            <li key={job.id} className="job-item">
                                <div className="job-item-header" onClick={() => toggleJobExpand(job.id)}>
                                    <div className="job-item-main">
                                        <strong>{job.title}</strong>
                                        <span className="job-company">{job.company}</span>
                                    </div>
                                    <button 
                                        className={`dropdown-toggle ${expandedJobIds.has(job.id) ? 'expanded' : ''}`}
                                        aria-label={expandedJobIds.has(job.id) ? "Collapse details" : "Expand details"}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </button>
                                </div>
                                
                                {expandedJobIds.has(job.id) && (
                                    <div className="job-item-details">
                                        {editingJobId === job.id && inlineEditData ? (
                                            // Inline edit mode
                                            <>
                                                <div className="job-info-expanded inline-edit-form">
                                                    <div className="edit-field-group">
                                                        <label htmlFor={`title-${job.id}`}>Job Title</label>
                                                        <input
                                                            id={`title-${job.id}`}
                                                            type="text"
                                                            name="title"
                                                            value={inlineEditData.title}
                                                            onChange={handleInlineEditChange}
                                                            className="inline-edit-field"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="edit-field-group">
                                                        <label htmlFor={`company-${job.id}`}>Company</label>
                                                        <input
                                                            id={`company-${job.id}`}
                                                            type="text"
                                                            name="company"
                                                            value={inlineEditData.company}
                                                            onChange={handleInlineEditChange}
                                                            className="inline-edit-field"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="edit-field-group">
                                                        <label htmlFor={`location-${job.id}`}>Location</label>
                                                        <input
                                                            id={`location-${job.id}`}
                                                            type="text"
                                                            name="location"
                                                            value={inlineEditData.location}
                                                            onChange={handleInlineEditChange}
                                                            className="inline-edit-field"
                                                            required
                                                            pattern="^(Remote|[A-Za-z\s]+,\s*[A-Z]{2})$"
                                                            title="Please enter location as 'City, ST' or 'Remote'"
                                                        />
                                                    </div>
                                                    <div className="edit-field-group">
                                                        <label htmlFor={`status-${job.id}`}>Status</label>
                                                        <select
                                                            id={`status-${job.id}`}
                                                            name="status"
                                                            value={inlineEditData.status}
                                                            onChange={handleInlineEditChange}
                                                            className="inline-edit-field"
                                                        >
                                                            <option value="APPLIED">Applied</option>
                                                            <option value="INTERVIEWED">Interviewed</option>
                                                            <option value="REJECTED">Rejected</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="job-actions">
                                                    <Button
                                                        onClick={() => saveInlineEdit(job.id)}
                                                        text="Save"
                                                        className="edit-job-button"
                                                        disabled={loading}
                                                    />
                                                    <Button
                                                        onClick={cancelInlineEdit}
                                                        text="Cancel"
                                                        className="cancel-button"
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            // View mode
                                            <>
                                                <div className="job-info-expanded">
                                                    <CardItem
                                                        label="Location"
                                                        value={job.location}
                                                    />
                                                    <CardItem
                                                        label="Status"
                                                        value={<span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span>}
                                                    />
                                                    <CardItem
                                                        label="Applied on"
                                                        value={formatDate(job.createdAt)}
                                                    />
                                                </div>
                                                <div className="job-actions">
                                                    <Button
                                                        onClick={() => startInlineEdit(job)}
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
                                            </>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </Card>
            </main>
        </div>
    );
};

export default JobApps;
