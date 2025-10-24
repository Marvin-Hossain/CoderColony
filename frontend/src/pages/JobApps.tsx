import React, {useEffect, useMemo, useState} from "react";
import Button from "../components/Button";
import { inputStyles } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import {API_CONFIG} from '@/services/config';
import {formatDate} from '@/services/dateUtils';
import '@/styles/dashboard.css';
import '@/styles/progress.css';
import StatusDonut from '@/components/ui/StatusDonut';
import { MagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import EditJobForm from '../components/EditJobForm';

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

const STATUS_LABELS: Record<JobApplication['status'], string> = {
    APPLIED: "Applied",
    INTERVIEWED: "Interviewed",
    REJECTED: "Rejected"
};

/**
 * Page component for managing job applications (CRUD operations).
 * Displays a list of applications and a form to add or edit entries.
 */
const JobApps = () => {
    const [jobs, setJobs] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filter, setFilter] = useState<'All' | 'Applied' | 'Interviewed' | 'Rejected'>("All");
    const [editingJobId, setEditingJobId] = useState<number | null>(null);

    /** Starts inline editing for a job */
    const startEditing = (job: JobApplication): void => {
        if (loading) return;
        setEditingJobId(job.id);
    };

    /** Cancels inline editing */
    const cancelEditing = (): void => {
        setEditingJobId(null);
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
            } else if (!signal.aborted) {
                setError('An unknown error occurred while fetching jobs.');
                console.error('Unknown error fetching jobs:', err);
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
        if (!globalThis.confirm("Are you sure you want to delete this job?")) return;

        setLoading(true);
        setError(null);
        const abortController = new AbortController();
        const isDeletingJobBeingEdited = editingJobId === id;
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchJobs(abortController.signal);
            if (isDeletingJobBeingEdited) {
                cancelEditing();
            }
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
        } finally {
            setLoading(false);
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

    // Inline editing handled by EditJobForm component

    /** Effect to fetch initial job applications when the component mounts. */
    useEffect(() => {
        const abortController = new AbortController();
        void fetchJobs(abortController.signal);

        return () => {
            abortController.abort();
        };
    }, []);

    // Inline editing ESC handling
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && editingJobId !== null) {
                e.stopPropagation();
                cancelEditing();
            }
        };
        globalThis.addEventListener('keydown', onKeyDown as any);
        return () => globalThis.removeEventListener('keydown', onKeyDown as any);
    }, [editingJobId]);

    /** Memoized calculation to sort jobs by creation date (newest first). */
    const sortedJobs = useMemo(() => {
        return [...jobs].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });
    }, [jobs]);

    // Derived counts and filtered list
    const appliedCount = useMemo(() => jobs.filter(j => j.status === 'APPLIED').length, [jobs]);
    const interviewedCount = useMemo(() => jobs.filter(j => j.status === 'INTERVIEWED').length, [jobs]);
    const rejectedCount = useMemo(() => jobs.filter(j => j.status === 'REJECTED').length, [jobs]);
    const totalCount = jobs.length;

    const filteredJobs = useMemo(() => {
        let list = [...sortedJobs];
        if (filter !== 'All') {
            const map: Record<'Applied' | 'Interviewed' | 'Rejected', JobApplication['status']> = {
                Applied: 'APPLIED',
                Interviewed: 'INTERVIEWED',
                Rejected: 'REJECTED'
            };
            list = list.filter(j => j.status === map[filter]);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            list = list.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
        }
        return list;
    }, [sortedJobs, filter, searchQuery]);

    // editing UI handled inline per item

    return (
        <main className="dash-container">
            <div className="dash-inner">
                {error && (
                    <div className="rounded-xl border border-danger bg-danger/10 px-4 py-3 text-danger">{error}</div>
                )}

                {/* HERO */}
                <section className="grid-12 mb-8">
                    <div className="col-span-12 lg-col-span-8 feature-card">
                        <div className="decor-top-right"></div>
                        <div className="decor-bottom-left"></div>
                        <div className="feature-card-content">
                            <span className="app-tracker-badge">Application Tracker</span>
                            <h2 className="text-2xl mb-2" style={{ color: '#fff' }}>Job Applications</h2>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>Track and manage your job search journey with precision and purpose</p>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                                <div className="rounded-lg" style={{ background: 'rgba(255,255,255,0.10)', padding: '0.875rem' }}>
                                    <div className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>Applied</div>
                                    <div className="text-2xl" style={{ fontWeight: 800 }}>{appliedCount}</div>
                                </div>
                                <div className="rounded-lg" style={{ background: 'rgba(255,255,255,0.10)', padding: '0.875rem' }}>
                                    <div className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>Interviews</div>
                                    <div className="text-2xl" style={{ fontWeight: 800 }}>{interviewedCount}</div>
                                </div>
                                <div className="rounded-lg" style={{ background: 'rgba(255,255,255,0.10)', padding: '0.875rem' }}>
                                    <div className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>Rejected</div>
                                    <div className="text-2xl" style={{ fontWeight: 800 }}>{rejectedCount}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg-col-span-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <section className="panel-card" style={{ width: '100%', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <StatusDonut label="Total" value={totalCount} total={Math.max(1, totalCount)} color="blue" />
                            </div>
                            <div className="text-muted-foreground" style={{ marginTop: '0.5rem' }}>Total Applications</div>
                            <div className="text-sm text-muted-foreground">Keep the momentum</div>
                        </section>
                    </div>
                </section>

                {/* FORM + TIPS */}
                <section className="grid-12 mb-8">
                    <div className="col-span-12 lg-col-span-8 feature-card feature-card--purple">
                        <div className="decor-top-right"></div>
                        <div className="decor-bottom-left"></div>
                        <div className="feature-card-content tw-max-w-3xl tw-mx-auto">
                            <h3 className="tw-text-2xl tw-mb-4">Log Your Latest Application</h3>
                        <form onSubmit={addJob} className="tw-space-y-4">
                            <div className="tw-grid tw-gap-y-6 md:tw-grid-cols-12 md:tw-gap-x-8">
                                <div className="tw-flex tw-flex-col tw-gap-2 md:tw-col-span-6">
                                        <label htmlFor="job-title" className="tw-text-sm tw-font-medium" style={{ color: 'rgba(255,255,255,0.92)' }}>Job Title</label>
                                            <input id="job-title" type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Frontend Engineer" className={cn(inputStyles(), 'form-field-purple')} required />
                                    </div>
                                    <div className="tw-flex tw-flex-col tw-gap-2 md:tw-col-span-6">
                                        <label htmlFor="job-company" className="tw-text-sm tw-font-medium" style={{ color: 'rgba(255,255,255,0.92)' }}>Company</label>
                                            <input id="job-company" type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Acme Corp" className={cn(inputStyles(), 'form-field-purple')} required />
                                    </div>
                                    <div className="tw-flex tw-flex-col tw-gap-2 md:tw-col-span-12">
                                    <label htmlFor="job-location" className="tw-text-sm tw-font-medium" style={{ color: 'rgba(255,255,255,0.92)' }}>Location</label>
                                    <input id="job-location" type="text" name="location" value={formData.location} onChange={handleChange} placeholder="San Francisco, CA or Remote" className={cn(inputStyles(), 'form-field-purple')} required pattern="^([A-Z][a-zA-Z]*(?:\s[A-Z][a-zA-Z]*)*),\s[A-Z]{2}$|^[Rr][Ee][Mm][Oo][Tt][Ee]$" title="Please enter location as 'City, ST' with the city in title case and the state as a two-letter abbreviation (e.g., 'San Francisco, CA') or 'Remote'." />
                                </div>
                                </div>
                            <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row sm:tw-justify-start">
                                    <Button type="submit" disabled={loading} className="w-full sm:w-auto button-purple tw-py-3 tw-px-5 tw-transition tw-inline-flex tw-items-center tw-justify-center tw-gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                            <rect x="3" y="5" width="18" height="16" rx="3" stroke="#ffffff" strokeWidth="2"/>
                                            <path d="M8 3v4M16 3v4M3 11h18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        {loading ? 'Processing…' : 'Add Application'}
                                    </Button>
                            </div>
                        </form>
                        </div>
                    </div>
                    <div className="col-span-12 lg-col-span-4 feature-card feature-card--orange">
                        <div className="decor-top-right"></div>
                        <div className="decor-bottom-left"></div>
                        <div className="feature-card-content">
                            <h3 className="text-2xl mb-4" style={{ color: '#fff' }}>Pro Tips</h3>
                            <ul className="text-sm" style={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.8 }}>
                                <li>Follow up 1 week after applying</li>
                                <li>Customize each application</li>
                                <li>Research company culture</li>
                                <li>Prepare for behavioral questions</li>
                            </ul>
                            <div className="text-sm" style={{ color: 'rgba(255,255,255,0.85)', marginTop: '1rem' }}>Keep going! Consistency is key</div>
                        </div>
                    </div>
                    </section>

                {/* SEARCH + FILTERS (Unified) */}
                <section className="grid-12 mb-8">
                    <div className="col-span-12">
                        <div className="search-filter-bar">
                            <MagnifyingGlassIcon className="search-icon" />
                            <input
                                type="text"
                                placeholder="Find your next opportunity…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="filter-group" role="tablist" aria-label="Filter by status">
                                {["All","Applied","Interviewed","Rejected"].map((label) => (
                                    <button
                                        key={label}
                                        className={filter === label ? "filter-pill active" : "filter-pill"}
                                        onClick={() => setFilter(label as any)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* LIST */}
                <section className="grid-12">
                    <div className="col-span-12">
                        {loading && jobs.length === 0 && (
                            <div className="panel-card text-muted-foreground">Loading applications...</div>
                        )}
                        {!loading && filteredJobs.length === 0 && (
                            <div className="panel-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#9ca3af' }}>⌁</div>
                                <div className="text-lg" style={{ fontWeight: 600 }}>No applications yet</div>
                                <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>Add your first job application above to start tracking your progress</p>
                            </div>
                        )}
                        {filteredJobs.length > 0 && (
                            <div className="space-y-4">
                                {filteredJobs.map((job) => {
                                    const isEditing = editingJobId === job.id;
                                    const statusText = STATUS_LABELS[job.status];
                                    return (
                                        <div key={job.id} className="space-y-4">
                                            <div className="app-card">
                                                <div className="icon-container">{job.title ? job.title.charAt(0) : "?"}</div>
                                                <div className="details">
                                                    <div className="job-title">{job.title}</div>
                                                    <div className="company">{job.company}</div>
                                                    <div className="meta-row">
                                                        <div className="meta-item">
                                                            <span className="meta-label">Location</span>
                                                            <span className="meta-value">{job.location}</span>
                                                        </div>
                                                        <div className="meta-item">
                                                            <span className="meta-label">Applied</span>
                                                            <span className="meta-value">{formatDate(job.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="status-container">
                                                    <div className="card-actions">
                                                        <button className="action-btn edit" aria-label="Edit" onClick={() => startEditing(job)}>
                                                            <PencilSquareIcon width={16} height={16} />
                                                        </button>
                                                        <button className="action-btn delete" aria-label="Delete" onClick={() => deleteJob(job.id)}>
                                                            <TrashIcon width={16} height={16} />
                                                        </button>
                                                    </div>
                                                    <div className={`status-pill ${job.status.toLowerCase()}`}>{statusText}</div>
                                                </div>
                                            </div>
                                            {isEditing && (
                                                <EditJobForm
                                                    job={job}
                                                    onSave={(updated) => updateJob(job.id, { title: updated.title, company: updated.company, location: updated.location, status: updated.status })}
                                                    onCancel={cancelEditing}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                                                </div>
                </main>
    );
};

export default JobApps;
