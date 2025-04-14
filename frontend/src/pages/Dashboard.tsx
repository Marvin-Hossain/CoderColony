import {useState, useEffect} from "react";
import "./Dashboard.css";
import Button from "../components/Button";
import LogoutButton from "../components/LogoutButton";
import {useNavigate} from 'react-router-dom';
import {API_CONFIG} from '@/services/config';


interface UserData {
    authenticated: boolean;
    username: string;
    id?: string;
    email?: string;
    avatarUrl?: string;
}

interface JobStats {
    todayCount: number;
}

const Dashboard = () => {
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
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchDashboardData = async (): Promise<void> => {
            setLoading(true);
            try {
                const [userResponse, jobStatsRes, technicalCountRes, behavioralCountRes] = await Promise.all([
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER, {
                        credentials: 'include', signal
                    }),
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

                if (userResponse.ok) {
                    const userData: UserData = await userResponse.json();
                    setUser(userData);
                } else {
                    console.error('Failed to fetch user data for dashboard');
                }

                if (jobStatsRes.ok && technicalCountRes.ok && behavioralCountRes.ok) {
                    const jobData: JobStats = await jobStatsRes.json();
                    const technicalData = await technicalCountRes.json();
                    const behavioralData = await behavioralCountRes.json();

                    if (signal.aborted) return;

                    setJobCount(jobData.todayCount);
                    setTechnicalCount(technicalData.count);
                    setBehavioralCount(behavioralData.count);
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
        return <div>Loading Dashboard Data...</div>;
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
                    <p>{user?.avatarUrl && (
                        <>
                            <img
                                src={user.avatarUrl}
                                alt={`${user.username}'s avatar`}
                                className="avatar"
                            />
                            &nbsp;
                        </>
                    )}
                        Welcome, {user?.username || 'User'}&nbsp;|&nbsp;
                        <LogoutButton/>
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
                        <Button text="Go!" onClick={() => navigate('/job-apps')} className="go-button"/>
                    </div>
                    <div className="goal">
                        <p>Practice Behavioral Qs</p>
                        <progress value={behavioralCount} max={behavioralGoal}></progress>
                        <span>{behavioralCount}/{behavioralGoal}</span>
                        <Button text="Go!" onClick={() => navigate('/behavioral-questions')} className="go-button"/>
                    </div>
                    <div className="goal">
                        <p>Practice Technical Qs</p>
                        <progress value={technicalCount} max={technicalGoal}></progress>
                        <span>{technicalCount}/{technicalGoal}</span>
                        <Button text="Go!" onClick={() => navigate('/technical-questions')} className="go-button"/>
                    </div>
                    <div className="goal">
                        <p>Practice LeetCode Qs<br></br>(Coming Soon!)</p>
                        <progress value={0} max="0"></progress>
                        <span>0/0</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/leetcode")} className="go-button"
                                disabled/>
                    </div>
                </section>

                {/* Weekly Goals Section */}
                <section className="weekly-goals">
                    <h2>Weekly Goals</h2>
                    <div className="goal">
                        <p>Contact Connections<br></br>(Coming soon!)</p>
                        <progress value={0} max="0"></progress>
                        <span>0/0</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/connections")} className="go-button"
                                disabled/>
                    </div>
                    <div className="goal">
                        <p>Learn New Concepts<br></br>(Coming soon!)</p>
                        <progress value={0} max="0"></progress>
                        <span>0/0</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/new-concepts")}
                                className="go-button" disabled/>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
