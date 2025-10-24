import {useState, useEffect, useMemo} from 'react';
import {Line} from "react-chartjs-2";
import '@/styles/dashboard.css';
import '@/styles/progress.css';
import ProgressStatStrip, { type StripItem } from '@/components/ui/ProgressStatStrip';
import DiagonalGoalCard from '@/components/ui/DiagonalGoalCard';
import TrendUpIcon from '../components/icons/TrendUpIcon';
import StatusDonutGroup from '@/components/ui/StatusDonutGroup';
import GradientStatCard from '@/components/ui/GradientStatCard';
import WeeklyTimeline, { type TimelineDay } from '@/components/ui/WeeklyTimeline';
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

// (legacy interfaces removed; UI is composed via new components)

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
 * Modernized Progress page. Preserves data fetching, composes new UI components.
 */
const Progress = () => {
    const [selectedCategory] = useState<string>("jobs");
    const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
    const [allTimeStats, setAllTimeStats] = useState<AllTimeStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    /** Memoized calculation for chart data structure required by react-chartjs-2. */
    const chartData = useMemo(() => {
        // Create canvas for gradient
        const ctx = document.createElement('canvas').getContext('2d');
        let gradient = null;
        if (ctx) {
            gradient = ctx.createLinearGradient(0, 0, 0, 360);
            gradient.addColorStop(0, 'rgba(77, 107, 254, 0.35)');
            gradient.addColorStop(1, 'rgba(77, 107, 254, 0.02)');
        }
        
        return {
            labels: weeklyData?.chartData?.map(item => formatChartDate(item.date)) || [],
            datasets: [
                {
                    label: CATEGORIES.find(c => c.id === selectedCategory)?.label || '',
                    data: weeklyData?.chartData?.map(item => item.count) || [],
                    fill: true,
                    backgroundColor: gradient || 'rgba(77, 107, 254, 0.2)',
                    borderColor: '#5a74ff',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#5a74ff',
                    pointBorderWidth: 2,
                    pointRadius: 4.5,
                    pointHoverRadius: 7.5,
                    pointHoverBackgroundColor: '#5a74ff',
                    pointHoverBorderColor: '#ffffff',
                    cubicInterpolationMode: 'monotone' as const
                }
            ]
        };
    }, [weeklyData, selectedCategory]);

    /** Memoized calculation for chart configuration options. */
    const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

    /** Compute dynamic Y-axis max: base 5, then round up to next multiple of 5. */
    const yAxisMax = useMemo(() => {
        const counts = weeklyData?.chartData?.map(p => p.count) || [];
        const maxCount = counts.length ? Math.max(...counts) : 0;
        const base = 5;
        if (maxCount <= base) return base;
        const headroom = 0.5; // small headroom so the top point isn't flush
        const target = maxCount + headroom;
        return Math.ceil(target / 5) * 5;
    }, [weeklyData]);
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            // Hide inner chart title; we render the card header above the surface
            title: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1e3a8a',
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
                    maxRotation: 0,
                    minRotation: 0,
                    color: 'rgba(255,255,255,0.92)',
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
                    color: 'rgba(255,255,255,0.92)',
                    font: {
                        size: 12
                    },
                    padding: 8
                },
                max: yAxisMax,
                grid: {
                    color: 'rgba(255,255,255,0.20)',
                    drawBorder: false,
                    lineWidth: 1,
                    borderDash: [4, 4]
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
    }), [selectedCategory, selectedCategoryData, yAxisMax]);

    // Applications streak container removed per request; related helpers removed

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

                if (signal.aborted) {
                    // Skip state updates when aborted
                } else {
                    setWeeklyData(fetchedWeeklyData);
                    setAllTimeStats(fetchedStatsData);
                }
            } catch (err) {
                if (signal.aborted) {
                    // No-op on abort
                } else if (err instanceof Error && err.name !== 'AbortError') {
                    setError('Failed to load progress data. Please try again.');
                    console.error('Error fetching progress data:', err);
                } else if (!(err instanceof Error)) {
                    setError('An unknown error occurred while fetching progress data.');
                    console.error('Unknown error fetching progress data:', err);
                }
            } finally {
                if (signal.aborted) {
                    // Skip loading state update when aborted
                } else {
                    setIsLoading(false);
                }
            }
        };

        void fetchData();

        return () => {
            abortController.abort();
        };
    }, [selectedCategory]);

    // Derived metrics for header and side panels
    const weeklySum = useMemo(() => (weeklyData?.chartData ?? []).reduce((s, p) => s + (p.count || 0), 0), [weeklyData]);
    const bestDayCount = useMemo(() => (weeklyData?.chartData ?? []).reduce((m, p) => Math.max(m, p.count), 0), [weeklyData]);
    // Backend may format average as string with one decimal; normalize to number
    const dailyAvg = Number(allTimeStats?.average ?? 0);
    const applied = allTimeStats?.applied || 0;
    const interviewed = allTimeStats?.interviewed || 0;
    const rejected = allTimeStats?.rejected || 0;
    const statusTotal = applied + interviewed + rejected;
    const successRate = applied > 0 ? Math.round(((interviewed / applied) * 1000)) / 10 : 0; // one decimal

    const headerItems: [StripItem, StripItem, StripItem] = [
        { value: Math.round(dailyAvg), label: 'DAILY AVG', color: 'blue' },
        { value: bestDayCount, label: 'BEST DAY', color: 'orange' },
        { value: weeklySum, label: 'THIS WEEK', color: 'green' }
    ];

    const timelineDays: TimelineDay[] = useMemo(() => {
        const points = weeklyData?.chartData || [];
        const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
        return points.map(p => {
            const d = new Date(p.date);
            const day = formatter.format(d);
            return { dateLabel: day, value: p.count };
        });
    }, [weeklyData]);

    return (
        <main className="progress-container">
            <div className="progress-inner">
                {/* Header */}
                <section className="progress-header">
                    <div>
                        <div className="progress-eyebrow" aria-label="Weekly overview">
                            <TrendUpIcon className="progress-eyebrow-icon" />
                            <span>WEEKLY OVERVIEW</span>
                        </div>
                        <h1 className="progress-title">Your<br />Progress</h1>
                        {allTimeStats && (
                            <div className="progress-total" aria-live="polite">
                                <span className="value">{allTimeStats.total ?? 0}</span>
                                <div className="caption">
                                    <span className="caption-line">applications</span>
                                    <span className="caption-sub">submitted all-time</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <ProgressStatStrip items={headerItems} />
                    </div>
                </section>

                {error && (
                    <div className="rounded-xl border border-danger bg-danger/10 px-4 py-3 text-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Main grid */}
                <section className="grid-12 mb-8">
                    <div className="col-span-12 lg-col-span-8 feature-chart">
                        <div className="decor-top-right" />
                        <div className="decor-bottom-left" />
                        <div className="feature-chart-content">
                            <h2 className="text-2xl mb-4">Application Trend</h2>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>Your performance over the past 7 days</p>
                            <div className="chart-surface">
                                {isLoading ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-4">
                                        <span
                                            className="animate-spin rounded-full"
                                            style={{
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                border: '4px solid rgba(255,255,255,0.25)',
                                                borderTopColor: '#ffffff'
                                            }}
                                        />
                                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.95)' }}>Loading chart data...</p>
                                    </div>
                                ) : (
                                    <Line data={chartData} options={chartOptions} />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg-col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <StatusDonutGroup applied={applied} interviewed={interviewed} rejected={rejected} total={Math.max(1, statusTotal)} />
                        <GradientStatCard title="Success Rate" value={`${successRate}%`} subtitle="Interview conversion rate" gradient="purple" />
                        <DiagonalGoalCard title="Applications" subtitle="This week" value={weeklySum} target={selectedCategoryData?.goal || 0} bgColor="orange" />
                    </div>
                </section>

                {/* Weekly timeline */}
                <section>
                    <WeeklyTimeline days={timelineDays} />
                </section>

                {/* Applications streak removed */}
            </div>
        </main>
    );
};

export default Progress;
