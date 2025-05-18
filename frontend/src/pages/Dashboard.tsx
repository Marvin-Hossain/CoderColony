import {useState, useEffect} from "react";
import "./Dashboard.css";
import Button from "../components/Button";
import {useNavigate} from 'react-router-dom';
import {API_CONFIG} from '@/services/config';

interface JobStats {
    todayCount: number;
}

/**
 * The main dashboard component displayed after successful login.
 * Shows daily goals and provides navigation to other sections.
 */
const Dashboard = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [jobCount, setJobCount] = useState<number>(0);
    const [behavioralCount, setBehavioralCount] = useState<number>(0);
    const [technicalCount, setTechnicalCount] = useState<number>(0);
    const jobGoal = 10;
    const behavioralGoal = 10;
    const technicalGoal = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchDashboardData = async (): Promise<void> => {
            setLoading(true);
            try {
                const [jobStatsRes, technicalCountRes, behavioralCountRes] = await Promise.all([
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.JOBS_STATS, {
                        credentials: 'include', signal
                    }),
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.TECHNICAL + '/count', {
                        credentials: 'include', signal
                    }),
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BEHAVIORAL + '/count', {
                        credentials: 'include', signal
                    })
                ]);

                if (signal.aborted) return;

                if (jobStatsRes.ok && technicalCountRes.ok && behavioralCountRes.ok) {
                    const jobData: JobStats = await jobStatsRes.json();
                    const technicalData = await technicalCountRes.json();
                    const behavioralData = await behavioralCountRes.json();

                    if (!signal.aborted) {
                        setJobCount(jobData.todayCount);
                        setTechnicalCount(technicalData.count);
                        setBehavioralCount(behavioralData.count);
                    }
                } else {
                    console.error('Failed to fetch one or more stats');
                }
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name !== 'AbortError' && !signal.aborted) {
                        console.error('Error fetching dashboard data:', error);
                    }
                } else {
                    if (!signal.aborted) {
                        console.error('An unexpected error occurred fetching dashboard data:', error);
                    }
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void fetchDashboardData();

        return () => {
            abortController.abort();
        };
    }, []);

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Welcome to Your Dashboard</h1>
                <p>Track your daily progress and stay on top of your job search journey</p>
            </header>

            <main className="dashboard-main">
                {/* Daily Goals Section */}
                <section className="dashboard-section">
                    <h2>Daily Goals</h2>
                    <div className="goals-container">
                        <div className="goal">
                            <p>Apply to {jobGoal} Jobs</p>
                            <div className="goal-progress">
                                <progress value={jobCount} max={jobGoal}></progress>
                                <div className="goal-info">
                                    <span className="goal-count">{jobCount}/{jobGoal} completed</span>
                                </div>
                            </div>
                            <Button text="Go!" onClick={() => navigate('/job-apps')} className="go-button"/>
                        </div>
                        
                        <div className="goal">
                            <p>Practice Behavioral Questions</p>
                            <div className="goal-progress">
                                <progress value={behavioralCount} max={behavioralGoal}></progress>
                                <div className="goal-info">
                                    <span className="goal-count">{behavioralCount}/{behavioralGoal} completed</span>
                                </div>
                            </div>
                            <Button text="Go!" onClick={() => navigate('/practice')} className="go-button"/>
                        </div>
                        
                        <div className="goal">
                            <p>Practice Technical Questions</p>
                            <div className="goal-progress">
                                <progress value={technicalCount} max={technicalGoal}></progress>
                                <div className="goal-info">
                                    <span className="goal-count">{technicalCount}/{technicalGoal} completed</span>
                                </div>
                            </div>
                            <Button text="Go!" onClick={() => navigate('/practice')} className="go-button"/>
                        </div>
                        
                        <div className="goal coming-soon">
                            <p>Practice LeetCode Questions</p>
                            <div className="goal-progress">
                                <div className="coming-soon-label">Coming&nbsp;Soon</div>
                                <progress value={0} max={10}></progress>
                                <div className="goal-info">
                                    <span className="goal-count">0/10 completed</span>
                                </div>
                            </div>
                            <Button text="Go!" className="go-button" disabled/>
                        </div>
                    </div>
                </section>

                {/* Weekly Goals Section */}
                <section className="dashboard-section">
                    <h2>Weekly Goals</h2>
                    <div className="goals-container">
                        <div className="goal coming-soon">
                            <p>Network with Professionals</p>
                            <div className="goal-progress">
                                <div className="coming-soon-label">Coming&nbsp;Soon</div>
                                <progress value={0} max={10}></progress>
                                <div className="goal-info">
                                    <span className="goal-count">0/10 completed</span>
                                </div>
                            </div>
                            <Button text="Go!" className="go-button" disabled/>
                        </div>
                        
                        <div className="goal coming-soon">
                            <p>Learn New Tech Concepts</p>
                            <div className="goal-progress">
                                <div className="coming-soon-label">Coming&nbsp;Soon</div>
                                <progress value={0} max={10}></progress>
                                <div className="goal-info">
                                    <span className="goal-count">0/10 completed</span>
                                </div>
                            </div>
                            <Button text="Go!" className="go-button" disabled/>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
