import { useNavigate } from 'react-router-dom';
import './Practice.css';
import PageHeader from '../components/PageHeader';

const Practice = () => {
  const navigate = useNavigate();

  return (
    <div className="practice-page">
      <PageHeader
        title="Interview Practice"
        subtitle="Prepare for your interviews with AI-powered feedback"
      />

      <div className="practice-cards-container">
        <div className="practice-card" onClick={() => navigate('/behavioral-questions')}>
          <div className="practice-card-icon">
            <i className="fas fa-comments"></i>
          </div>
          <div className="practice-card-content">
            <h3>Behavioral Questions</h3>
            <p>Practice answering questions about your past experiences using the STAR method.</p>
            <div className="practice-card-footer">
              <span className="practice-card-tag">STAR Method</span>
              <span className="practice-card-tag">Leadership</span>
              <span className="practice-card-tag">Communication</span>
            </div>
          </div>
        </div>

        <div className="practice-card" onClick={() => navigate('/technical-questions')}>
          <div className="practice-card-icon">
            <i className="fas fa-code"></i>
          </div>
          <div className="practice-card-content">
            <h3>Technical Questions</h3>
            <p>Practice software engineering concepts, algorithms, and coding challenges.</p>
            <div className="practice-card-footer">
              <span className="practice-card-tag">Algorithms</span>
              <span className="practice-card-tag">Data Structures</span>
              <span className="practice-card-tag">System Design</span>
            </div>
          </div>
        </div>

        <div className="practice-card" onClick={() => navigate('/practice/flashcards')}>
          <div className="practice-card-icon">
            <i className="fas fa-layer-group"></i>
          </div>
          <div className="practice-card-content">
            <h3>Flashcards</h3>
            <p>Study with spaced repetition flashcards to memorize key concepts and definitions.</p>
            <div className="practice-card-footer">
              <span className="practice-card-tag">Memory</span>
              <span className="practice-card-tag">Spaced Repetition</span>
              <span className="practice-card-tag">Study</span>
            </div>
          </div>
        </div>

        <div className="practice-card coming-soon">
          <div className="practice-card-icon">
            <i className="fas fa-laptop-code"></i>
          </div>
          <div className="practice-card-content">
            <h3>LeetCode Practice</h3>
            <p>Solve coding challenges and get instant feedback on your solutions.</p>
            <div className="practice-card-coming-soon-badge">
              Coming Soon
            </div>
            <div className="practice-card-footer">
              <span className="practice-card-tag">Algorithms</span>
              <span className="practice-card-tag">Problem Solving</span>
              <span className="practice-card-tag">Time Complexity</span>
            </div>
          </div>
        </div>

        <div className="practice-card coming-soon">
          <div className="practice-card-icon">
            <i className="fas fa-video"></i>
          </div>
          <div className="practice-card-content">
            <h3>Mock Interviews</h3>
            <p>Practice real-time interviews with our AI interviewer with video feedback.</p>
            <div className="practice-card-coming-soon-badge">
              Coming Soon
            </div>
            <div className="practice-card-footer">
              <span className="practice-card-tag">Video</span>
              <span className="practice-card-tag">Real-time</span>
              <span className="practice-card-tag">Body Language</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice; 