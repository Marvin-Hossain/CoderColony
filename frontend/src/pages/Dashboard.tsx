import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Button from "../components/Button"; // Reusable Button component
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../services/config';

interface UserData {
    authenticated: boolean;
    username: string;
    id?: string;
    email?: string;
    // add other user properties as needed
}

interface JobStats {
    todayCount: number;
}

interface QuestionCounts {
    date: string;
    behavioral: number;
    technical: number;
    [key: string]: string | number;
}

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [jobCount, setJobCount] = useState<number>(0);
    const [behavioralCount, setBehavioralCount] = useState<number>(0);
    const [technicalCount, setTechnicalCount] = useState<number>(0);
    const jobGoal = 10;
    const behavioralGoal = 10;
    const technicalGoal = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async (): Promise<void> => {
            try {
                const response = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER, 
                    { credentials: 'include' }
                );

                if (!response.ok) {
                    throw new Error('Not authenticated');
                }

                const userData: UserData = await response.json();
                
                if (!userData.authenticated) {
                    navigate('/');
                    return;
                }

                setUser(userData);
                fetchStats();
                
            } catch (error) {
                console.error('Authentication check failed:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        const fetchStats = async (): Promise<void> => {
            try {
                const [jobStats, technicalCount, behavioralCount] = await Promise.all([
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.JOBS_STATS, {
                        credentials: 'include'
                    }),
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.TECHNICAL + '/count', {
                        credentials: 'include'
                    }),
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BEHAVIORAL + '/count', {
                        credentials: 'include'
                    })
                ]);

                if (!jobStats.ok || !technicalCount.ok || !behavioralCount.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const jobData = await jobStats.json();
                const technicalData = await technicalCount.json();
                const behavioralData = await behavioralCount.json();

                setJobCount(jobData.todayCount);
                setTechnicalCount(technicalData.count);
                setBehavioralCount(behavioralData.count);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        checkAuth();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch(
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
                { method: 'POST', credentials: 'include' }
            );
            
            if (response.ok) {
                navigate('/');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            // Fallback to direct navigation if the API call fails
            navigate('/');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <Button 
                    text="Progress"
                    onClick={() => navigate('/progress')}
                    className="progress-button"
                />
                <h1>Welcome to Your Dashboard</h1>
                <Button 
                    text="Settings"
                    onClick={() => navigate('/settings')}
                    className="settings-button"
                />
                <div className="user-section">
                    <p>Welcome, {user?.username || 'User'}&nbsp;|&nbsp;
                        <span className="logout-link" onClick={handleLogout}>
                            Logout
                        </span>
                    </p>
                </div>
            </header>

            <main className="dashboard-main">
                {/* Daily Goals Section */}
                <section className="daily-goals">
                    <h2>Daily Goals</h2>
                    <div className="goal">
                        <p>Apply to {jobGoal} Jobs</p>
                        <progress value={jobCount} max={jobGoal}></progress>
                        <span>{jobCount}/{jobGoal}</span>
                        <Button text="Go!" onClick={() => navigate('/job-apps')} className="go-button" />
                    </div>
                    <div className="goal">
                        <p>Practice Behavioral Qs</p>
                        <progress value={behavioralCount} max={behavioralGoal}></progress>
                        <span>{behavioralCount}/{behavioralGoal}</span>
                        <Button text="Go!" onClick={() => navigate('/behavioral-questions')} className="go-button" />
                    </div>
                    <div className="goal">
                        <p>Practice Technical Qs</p>
                        <progress value={technicalCount} max={technicalGoal}></progress>
                        <span>{technicalCount}/{technicalGoal}</span>
                        <Button text="Go!" onClick={() => navigate('/technical-questions')} className="go-button" />
                    </div>
                    <div className="goal">
                        <p>Practice LeetCode Qs<br></br>(Coming Soon!)</p>
                        <progress value={0} max="0"></progress>
                        <span>0/0</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/leetcode")} className="go-button" disabled />
                    </div>
                </section>

                {/* Weekly Goals Section */}
                <section className="weekly-goals">
                    <h2>Weekly Goals</h2>
                    <div className="goal">
                        <p>Contact Connections<br></br>(Coming soon!)</p>
                        <progress value={0} max="0"></progress>
                        <span>0/0</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/connections")} className="go-button" disabled/>
                    </div>
                    <div className="goal">
                        <p>Learn New Concepts<br></br>(Coming soon!)</p>
                        <progress value={0} max="0"></progress>
                        <span>0/0</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/new-concepts")} className="go-button" disabled />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
