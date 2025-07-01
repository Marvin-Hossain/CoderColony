import React from 'react';
import './AboutUs.css';
import PageHeader from '../components/PageHeader';

const AboutUs: React.FC = () => {
  return (
    <div className="about-us">
      <PageHeader
        title="About CoderColony"
        subtitle="Your complete job search management platform"
      />
      
      <div className="about-content">
        <p>
          We've built CoderColony to simplify the job search process by providing a centralized platform
          where you can manage all aspects of your job hunt. Our goal is to give you the tools you need 
          to stay organized, well-prepared, and confident throughout your career journey.
        </p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">1</div>
            <h3>Application Tracking</h3>
            <p>Organize all your job applications in one place with status tracking.</p>
          </div>
          
          <div className="feature-card">
            <div className="icon">2</div>
            <h3>Interview Practice</h3>
            <p>Prepare with behavioral and technical interview questions.</p>
          </div>
          
          <div className="feature-card">
            <div className="icon">3</div>
            <h3>Progress Monitoring</h3>
            <p>Track daily and weekly goals with visual analytics.</p>
          </div>
          
          <div className="feature-card">
            <div className="icon">4</div>
            <h3>AI Feedback</h3>
            <p>Get personalized feedback on your interview responses.</p>
          </div>
        </div>
        
        <div className="mission-section">
          <h3>Our Mission</h3>
          <p>
            "To empower job seekers with tools and resources that make the job hunting process 
            more manageable, less stressful, and ultimately more successful."
          </p>
        </div>
        
        <div className="team-section">
          <h3>The Team</h3>
          <p>
            CoderColony was created by a team of developers who experienced firsthand the challenges
            of job hunting in the tech industry. We combined our expertise in software development 
            with our knowledge of the hiring process to create a tool we wish we had during our own 
            job searches.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 