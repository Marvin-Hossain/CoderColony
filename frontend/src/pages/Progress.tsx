import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import "./Progress.css";
import {Line} from "react-chartjs-2";
import {API_CONFIG} from '@/services/config';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import CategoryTabs from '../components/CategoryTabs';
import {formatChartDate} from '@/services/dateUtils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface Category {
    id: string;
    label: string;
    goal: number;
}

interface WeeklyData {
    chartData: {
        date: string;
        count: number;
    }[];
}

interface AllTimeStats {
    total: number;
    average: number;
    bestDay: string;
    applied?: number;
    interviewed?: number;
    rejected?: number;
}

interface StatsSectionProps {
    title: string;
    stats: AllTimeStats;
}

interface StatusBreakdownProps {
    stats: AllTimeStats;
}

const CATEGORIES: Category[] = [
    {id: "jobs", label: "Job Applications", goal: 10},
    // { id: "behavioral", label: "Behavioral Questions", goal: 10 },
    // { id: "technical", label: "Technical Questions", goal: 10 },
    // { id: "leetcode", label: "LeetCode Questions", goal: 0 },
    // { id: "connections", label: "Connections", goal: 0 },
    // { id: "concepts", label: "New Concepts", goal: 0 },
];

/** Service object containing functions to fetch progress-related data from the backend. */
const progressService = {
    /** Fetches weekly progress data (counts per day) for a given category. */
    async fetchWeeklyData(category: string, signal?: AbortSignal): Promise<WeeklyData> {
        const response = await fetch(
            API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROGRESS + `/${category}`,
            {credentials: 'include', signal}
        );
        if (!response.ok) {
            throw new Error(`HTTP error fetching weekly data: ${response.status}`);
        }
        return response.json();
    },

    /** Fetches all-time statistics (total, average, etc.) for a given category. */
    async fetchAllTimeStats(category: string, signal?: AbortSignal): Promise<AllTimeStats> {
        const response = await fetch(
            API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROGRESS + `/${category}/all-time`,
            {credentials: 'include', signal}
        );
        if (!response.ok) {
            throw new Error(`HTTP error fetching all-time stats: ${response.status}`);
        }
        return response.json();
    }
};

/**
 * Page component to display progress statistics and charts for different categories.
 * Fetches weekly and all-time data based on the selected category tab.
 */
const Progress = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("jobs");
    const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
    const [allTimeStats, setAllTimeStats] = useState<AllTimeStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    /** Memoized callback to handle changing the selected category tab. */
    const handleCategoryChange = useCallback((categoryId: string): void => {
        setSelectedCategory(categoryId);
    }, []);

    /** Memoized calculation for chart data structure required by react-chartjs-2. */
    const chartData = useMemo(() => ({
        labels: weeklyData?.chartData?.map(item => formatChartDate(item.date)) || [],
        datasets: [
            {
                label: CATEGORIES.find(c => c.id === selectedCategory)?.label || '',
                data: weeklyData?.chartData?.map(item => item.count) || [],
                backgroundColor: 'rgba(120, 192, 168, 0.2)',
                borderColor: '#78c0a8',
                borderWidth: 2,
                tension: 0.3,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#78c0a8',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#78c0a8',
                pointHoverBorderColor: '#ffffff'
            }
        ]
    }), [weeklyData, selectedCategory]);

    /** Memoized calculation for chart configuration options. */
    const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const
            },
            title: {
                display: true,
                text: `Weekly ${selectedCategoryData?.label || ''} Progress`,
                color: '#2f4f4f'
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#2f4f4f',
                bodyColor: '#567d57',
                borderColor: '#78c0a8',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    color: '#567d57'
                },
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: '#567d57'
                },
                suggestedMax: (selectedCategoryData?.goal || 0) + 2,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        },
        interaction: {
            mode: 'index' as const,
            intersect: false
        }
    }), [selectedCategory, selectedCategoryData]);

    /** Effect to fetch data whenever the selected category changes. */
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        /** Fetches both weekly and all-time data concurrently for the selected category. */
        const fetchData = async (): Promise<void> => {
            setIsLoading(true);
            setError(null);
            try {
                const [fetchedWeeklyData, fetchedStatsData] = await Promise.all([
                    progressService.fetchWeeklyData(selectedCategory, signal),
                    progressService.fetchAllTimeStats(selectedCategory, signal)
                ]);

                if (!signal.aborted) {
                    setWeeklyData(fetchedWeeklyData);
                    setAllTimeStats(fetchedStatsData);
                }
            } catch (err) {
                if (err instanceof Error) {
                    if (err.name !== 'AbortError' && !signal.aborted) {
                        setError('Failed to load progress data. Please try again.');
                        console.error('Error fetching progress data:', err);
                    }
                } else {
                    if (!signal.aborted) {
                        setError('An unknown error occurred while fetching progress data.');
                        console.error('Unknown error fetching progress data:', err);
                    }
                }
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchData();

        return () => {
            abortController.abort();
        };
    }, [selectedCategory]);

    /** Helper function to render the statistics sections based on available data. */
    const renderStats = () => {
        if (!allTimeStats) return null;
        return (
            <div className="stats">
                <StatsSection title="All-Time Stats" stats={allTimeStats}/>
                {selectedCategory === 'jobs' && (
                    <StatusBreakdown stats={allTimeStats}/>
                )}
            </div>
        );
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="progress-page">
            <header className="progress-header">
                <h1>Progress Tracker</h1>
                <p>Track your daily and weekly progress to stay motivated</p>
            </header>

            <div className="progress-content">
                <CategoryTabs
                    categories={CATEGORIES}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />

                {renderStats()}

                <div className="chart-container">
                    {isLoading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">Loading chart data...</div>
                        </div>
                    ) : (
                        <Line data={chartData} options={chartOptions}/>
                    )}
                </div>
            </div>
        </div>
    );
};

/** Memoized component to display general all-time statistics. */
const StatsSection = React.memo(({title, stats}: StatsSectionProps) => (
    <div className="stats-section">
        <h3>{title}</h3>
        <div className="stat-item">
            <span>Total Completed:</span>
            <span>{stats.total}</span>
        </div>
        <div className="stat-item">
            <span>Daily Average:</span>
            <span>{typeof stats.average === 'number' ? stats.average.toFixed(1) : 'N/A'}</span>
        </div>
        <div className="stat-item">
            <span>Best Day:</span>
            <span>{stats.bestDay || 'N/A'}</span>
        </div>
    </div>
));

/** Memoized component to display job status breakdown statistics. */
const StatusBreakdown = React.memo(({stats}: StatusBreakdownProps) => (
    <div className="stats-section">
        <h3>Application Status</h3>
        <div className="stat-item">
            <span>Applied:</span>
            <span>{stats.applied || 0}</span>
        </div>
        <div className="stat-item">
            <span>Interviewed:</span>
            <span>{stats.interviewed || 0}</span>
        </div>
        <div className="stat-item">
            <span>Rejected:</span>
            <span>{stats.rejected || 0}</span>
        </div>
    </div>
));

export default Progress;
