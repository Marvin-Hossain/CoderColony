import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
import {formatChartDate} from '@/services/dateUtils';
import Card from '../components/Card';
import CardItem from '../components/CardItem';

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
    useCallback((categoryId: string): void => {
        setSelectedCategory(categoryId);
    }, []);
    /** Memoized calculation for chart data structure required by react-chartjs-2. */
    const chartData = useMemo(() => {
        // Create canvas for gradient
        const ctx = document.createElement('canvas').getContext('2d');
        let gradient = null;
        if (ctx) {
            gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(77, 107, 254, 0.6)');
            gradient.addColorStop(1, 'rgba(77, 107, 254, 0.05)');
        }
        
        return {
            labels: weeklyData?.chartData?.map(item => formatChartDate(item.date)) || [],
            datasets: [
                {
                    label: CATEGORIES.find(c => c.id === selectedCategory)?.label || '',
                    data: weeklyData?.chartData?.map(item => item.count) || [],
                    fill: true,
                    backgroundColor: gradient || 'rgba(77, 107, 254, 0.2)',
                    borderColor: '#4d6bfe',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4d6bfe',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#4d6bfe',
                    pointHoverBorderColor: '#ffffff',
                    cubicInterpolationMode: 'monotone' as const
                }
            ]
        };
    }, [weeklyData, selectedCategory]);

    /** Memoized calculation for chart configuration options. */
    const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    boxWidth: 15,
                    usePointStyle: false,
                    font: {
                        size: 14,
                        weight: 'bold' as const
                    }
                }
            },
            title: {
                display: true,
                text: `Weekly ${selectedCategoryData?.label || ''} Progress`,
                color: '#2a3a84',
                font: {
                    size: 18,
                    weight: 'bold' as const
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#2a3a84',
                bodyColor: '#4a5491',
                borderColor: '#4d6bfe',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                boxPadding: 8,
                usePointStyle: true,
                titleFont: {
                    size: 14,
                    weight: 'bold' as const
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context: any) {
                        return ` ${context.parsed.y} Applications`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    color: '#4a5491',
                    font: {
                        size: 12
                    },
                    padding: 8
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: '#4a5491',
                    font: {
                        size: 12
                    },
                    padding: 8
                },
                suggestedMax: (selectedCategoryData?.goal || 0) + 2,
                grid: {
                    color: 'rgba(77, 107, 254, 0.06)',
                    drawBorder: false
                },
                border: {
                    dash: [4, 4]
                }
            }
        },
        interaction: {
            mode: 'index' as const,
            intersect: false
        },
        elements: {
            line: {
                borderJoinStyle: 'round' as const
            }
        },
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        },
        animation: {
            duration: 1500,
            easing: 'easeOutQuart' as const
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
                {/*
                    We don't need the category tabs for now, so we're commenting it out.
                    <CategoryTabs
                    categories={CATEGORIES}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                /> */}

                {renderStats()}

                <Card className="chart-container" accent="top" size="lg">
                    {isLoading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">Loading chart data...</div>
                        </div>
                    ) : (
                        <Line data={chartData} options={chartOptions}/>
                    )}
                </Card>
            </div>
        </div>
    );
};

/** Memoized component to display general all-time statistics. */
const StatsSection = React.memo(({title, stats}: StatsSectionProps) => (
    <Card title={title} accent="left">
        <CardItem 
            label="Total Completed"
            value={stats.total}
            badge
        />
        <CardItem 
            label="Daily Average"
            value={typeof stats.average === 'number' ? stats.average.toFixed(1) : 'N/A'}
            badge
        />
        <CardItem 
            label="Best Day"
            value={stats.bestDay || 'N/A'}
            badge
        />
    </Card>
));

/** Memoized component to display job status breakdown statistics. */
const StatusBreakdown = React.memo(({stats}: StatusBreakdownProps) => (
    <Card title="Application Status" accent="left">
        <CardItem 
            label="Applied"
            value={stats.applied || 0}
            badge
        />
        <CardItem 
            label="Interviewed"
            value={stats.interviewed || 0}
            badge
        />
        <CardItem 
            label="Rejected"
            value={stats.rejected || 0}
            badge
        />
    </Card>
));

export default Progress;
