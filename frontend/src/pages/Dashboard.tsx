import {useState, useEffect, useMemo} from "react";
import "@/styles/dashboard.css";
import {useNavigate} from 'react-router-dom';
import {API_CONFIG} from '@/services/config';
import CircularGoal from '@/components/ui/CircularGoal';
import DiagonalGoalCard from '@/components/ui/DiagonalGoalCard';
import WeekStreak from '@/components/ui/WeekStreak';

interface JobStats {
    todayCount: number;
}

interface WeeklyPoint { date: string; count: number }
interface WeeklyData { chartData: WeeklyPoint[] }

/**
 * The main dashboard component displayed after successful login.
 * Shows daily goals and provides navigation to other sections.
 */
const Dashboard = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [jobCount, setJobCount] = useState<number>(0);
    const [behavioralCount, setBehavioralCount] = useState<number>(0);
    const [technicalCount, setTechnicalCount] = useState<number>(0);
    const [weeklyJobs, setWeeklyJobs] = useState<WeeklyData | null>(null);
    const jobGoal = 10;
    const behavioralGoal = 10;
    const technicalGoal = 10;
    const navigate = useNavigate();

    // Hooks must not be conditional
    const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }), []);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchDashboardData = async (): Promise<void> => {
            setLoading(true);
            try {
                const [jobStatsRes, technicalCountRes, behavioralCountRes, weeklyJobsRes] = await Promise.all([
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.JOBS_STATS, {
                        credentials: 'include', signal
                    }),
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.TECHNICAL + '/count', {
                        credentials: 'include', signal
                    }),
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BEHAVIORAL + '/count', {
                        credentials: 'include', signal
                    }),
                    fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROGRESS + '/jobs', {
                        credentials: 'include', signal
                    })
                ]);

                if (signal.aborted) return;

                if (jobStatsRes.ok && technicalCountRes.ok && behavioralCountRes.ok && weeklyJobsRes.ok) {
                    const jobData: JobStats = await jobStatsRes.json();
                    const technicalData = await technicalCountRes.json();
                    const behavioralData = await behavioralCountRes.json();
                    const weeklyJobsData: WeeklyData = await weeklyJobsRes.json();

                    if (!signal.aborted) {
                        setJobCount(jobData.todayCount);
                        setTechnicalCount(technicalData.count);
                        setBehavioralCount(behavioralData.count);
                        setWeeklyJobs(weeklyJobsData);
                    }
                } else {
                    console.error('Failed to fetch one or more stats');
                }
            } catch (error) {
                if (!signal.aborted) {
                    console.error('Error fetching dashboard data:', error);
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

    const todayLabel = dateFormatter.format(new Date());

    const dailyGoals = [
        { title: 'Job Apps', current: jobCount, total: jobGoal, color: '#60a5fa', onClick: () => navigate('/job-apps') },
        { title: 'Behavioral', current: behavioralCount, total: behavioralGoal, color: '#93c5fd', onClick: () => navigate('/practice') },
        { title: 'Technical', current: technicalCount, total: technicalGoal, color: '#dbeafe', onClick: () => navigate('/practice') },
        { title: 'LeetCode', current: 0, total: 10, color: '#e0f2fe', disabled: true },
    ] as const;

    const weeklyProgress = Math.round(
        (dailyGoals.reduce((acc, g) => acc + g.current, 0) / dailyGoals.reduce((acc, g) => acc + g.total, 0)) * 100
    );

    const weeklyApplications = (weeklyJobs?.chartData || []).reduce((sum, p) => sum + (p.count || 0), 0);

    const computeApplicationsDays = (): boolean[] => {
        const flags = new Array(7).fill(false) as boolean[]; // Mon=0..Sun=6
        const points = weeklyJobs?.chartData || [];
        for (const p of points) {
            const [y, m, d] = p.date.split('-').map(Number);
            const localDate = new Date(y, (m - 1), d);
            const idx = (localDate.getDay() + 6) % 7; // Mon=0..Sun=6
            if ((p.count || 0) > 0) flags[idx] = true;
        }
        // Defensive: if backend weekly series lags but todayCount says we applied, force-highlight today
        if (jobCount > 0) {
            const todayIdx = (new Date().getDay() + 6) % 7;
            flags[todayIdx] = true;
        }
        return flags;
    };

    const applicationsDays = computeApplicationsDays();

    const computeStreak = (flags: boolean[]): number => {
        const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0..Sun=6
        let count = 0;
        for (let i = 0; i < 7; i++) {
            const idx = (todayIdx - i + 7) % 7;
            if (flags[idx]) count += 1; else break;
        }
        return count;
    };

    const applicationsStreak = computeStreak(applicationsDays);

    return (
        <main className="dash-container">
            <div className="dash-inner">
                {/* SECTION 1 - Hero */}
                <section className="grid-12 mb-8">
                    <div className="col-span-12 md-col-span-7">
                        <span className="date-badge">{todayLabel}</span>
                        <h1 className="md:text-4xl lg:text-5xl mt-4" style={{ color: '#0f172a' }}>You're crushing it</h1>
                        <p className="text-muted-foreground text-lg">7 tasks completed this week</p>
                    </div>
                    <div className="col-span-12 md-col-span-5" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <div className="text-right">
                            <div className="text-6xl text-primary">{weeklyProgress}%</div>
                            <div className="text-muted-foreground">weekly progress</div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2 - Main Content */}
                <section className="grid-12 mb-8">
                    {/* Feature Card */}
                    <div className="col-span-12 lg-col-span-8 feature-card">
                        <div className="decor-top-right"></div>
                        <div className="decor-bottom-left"></div>
                        <div className="feature-card-content">
                            <h2 className="text-2xl mb-6">Today's Focus</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {dailyGoals.map((goal) => (
                                    <CircularGoal key={goal.title} title={goal.title} current={goal.current} total={goal.total} color={goal.color} disabled={(goal as any).disabled} onClick={(goal as any).onClick} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 lg-col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <DiagonalGoalCard title="Applications" subtitle="This week" value={weeklyApplications} target={50} bgColor="bg-orange-500" />
                        <DiagonalGoalCard title="Updates" subtitle="This week" value={0} target={10} bgColor="bg-purple-600" />
                    </div>
                </section>

                {/* SECTION 3 - Weekly Streaks */}
                <section className="grid-12">
                    <div className="col-span-12 lg-col-span-4">
                        <h2 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Weekly Streaks</h2>
                        <p className="text-muted-foreground mb-6">Keep the momentum going</p>
                    </div>
                    <div className="col-span-12 lg-col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <WeekStreak title="Applications" days={applicationsDays} streak={applicationsStreak} />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Dashboard;
