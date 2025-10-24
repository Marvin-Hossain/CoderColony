import React, { useState } from 'react';

type JobStatus = 'APPLIED' | 'INTERVIEWED' | 'REJECTED';

export interface EditJobFormJob {
  id: number;
  title: string;
  company: string;
  location: string;
  status: JobStatus;
}

interface EditJobFormProps {
  job: EditJobFormJob;
  onSave: (job: EditJobFormJob) => void;
  onCancel: () => void;
}

const EditJobForm: React.FC<EditJobFormProps> = ({ job, onSave, onCancel }) => {
  const [title, setTitle] = useState<string>(job.title);
  const [company, setCompany] = useState<string>(job.company);
  const [location, setLocation] = useState<string>(job.location);
  const [status, setStatus] = useState<JobStatus>(job.status);

  const handleSubmit = (): void => {
    onSave({ ...job, title, company, location, status });
  };

  return (
    <div className="edit-card">
      <div className="edit-header">
        <span className="edit-label">Edit Mode</span>
      </div>
      <div className="edit-fields">
        <div className="field">
          <label htmlFor={`edit-title-${job.id}`}>Job Title</label>
          <input id={`edit-title-${job.id}`} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`edit-company-${job.id}`}>Company</label>
          <input id={`edit-company-${job.id}`} value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`edit-location-${job.id}`}>Location</label>
          <input
            id={`edit-location-${job.id}`}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor={`edit-status-${job.id}`}>Status</label>
          <select id={`edit-status-${job.id}`} value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWED">Interviewed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>
      <div className="edit-actions">
        <button className="save-btn" onClick={handleSubmit}>✓ Save Changes</button>
        <button className="cancel-btn" onClick={onCancel}>✕</button>
      </div>
    </div>
  );
};

export default EditJobForm;


