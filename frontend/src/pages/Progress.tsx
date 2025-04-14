import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Progress.css";
import { Line } from "react-chartjs-2";
import { API_CONFIG } from '@/services/config';
import PageHeader from '../components/PageHeader';
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
import { formatChartDate } from '@/services/dateUtils';

// Move chart registration outside component
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

// Move categories to constants
const CATEGORIES: Category[] = [
  { id: "jobs", label: "Job Applications", goal: 10 },
  // { id: "behavioral", label: "Behavioral Questions", goal: 10 },
  // { id: "technical", label: "Technical Questions", goal: 10 },
  // { id: "leetcode", label: "LeetCode Questions", goal: 0 },
  // { id: "connections", label: "Connections", goal: 0 },
  // { id: "concepts", label: "New Concepts", goal: 0 },
];

// Move API calls to separate service
const progressService = {
  async fetchWeeklyData(category: string, signal?: AbortSignal): Promise<WeeklyData> {
    const response = await fetch(
      API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROGRESS + `/${category}`,
      { credentials: 'include', signal }
    );
    if (!response.ok) {
      throw new Error(`HTTP error fetching weekly data: ${response.status}`);
    }
    return response.json();
  },

  async fetchAllTimeStats(category: string, signal?: AbortSignal): Promise<AllTimeStats> {
    const response = await fetch(
      API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROGRESS + `/${category}/all-time`,
      { credentials: 'include', signal }
    );
    if (!response.ok) {
      throw new Error(`HTTP error fetching all-time stats: ${response.status}`);
    }
    return response.json();
  }
};

const Progress = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("jobs");
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [allTimeStats, setAllTimeStats] = useState<AllTimeStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Use useCallback for event handlers
  const handleCategoryChange = useCallback((categoryId: string): void => {
    setSelectedCategory(categoryId);
  }, []);

  // Use useMemo for complex calculations
  const chartData = useMemo(() => ({
    labels: weeklyData?.chartData?.map(item => formatChartDate(item.date)) || [],
    datasets: [
      {
        label: CATEGORIES.find(c => c.id === selectedCategory)?.label || '',
        data: weeklyData?.chartData?.map(item => item.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        tension: 0.1
      }
    ]
  }), [weeklyData, selectedCategory]);

  const selectedCategoryData = CATEGORIES.find(c => c.id === selectedCategory);
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: {
        display: true,
        text: `Weekly ${selectedCategoryData?.label || ''} Progress`,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        suggestedMax: (selectedCategoryData?.goal || 0) + 2
      }
    }
  }), [selectedCategory, selectedCategoryData]);

  // Fetch data with proper error handling
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

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

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [selectedCategory]);

  // Extract components for better organization
  const renderStats = () => {
    if (!allTimeStats) return null;
    return (
      <div className="stats">
        <StatsSection title="All-Time Stats" stats={allTimeStats} />
        {selectedCategory === 'jobs' && (
          <StatusBreakdown stats={allTimeStats} />
        )}
      </div>
    );
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="progress-page">
      <PageHeader 
        title="Progress Tracker"
        subtitle="Track your daily and weekly progress"
        onBack={() => navigate('/dashboard')}
      />
      
      <CategoryTabs 
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {renderStats()}

      <div className="chart-container" style={{ height: '400px', width: '100%' }}>
        {isLoading ? (
          <div className="loading">Loading chart data...</div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

// Extract smaller components
const StatsSection = React.memo(({ title, stats }: StatsSectionProps) => (
  <div className="stats-section">
    <h3>{title}</h3>
    <div className="stat-item">
      <span>Total Completed:</span>
      <span>{stats.total}</span>
    </div>
    <div className="stat-item">
      <span>Daily Average:</span>
      <span>{stats.average}</span>
    </div>
    <div className="stat-item">
      <span>Best Day:</span>
      <span>{stats.bestDay}</span>
    </div>
  </div>
));

const StatusBreakdown = React.memo(({ stats }: StatusBreakdownProps) => (
  <div className="stats-section">
    <h3>Status Breakdown</h3>
    <div className="stat-item">
      <span>Applied:</span>
      <span>{stats.applied}</span>
    </div>
    <div className="stat-item">
      <span>Interviewed:</span>
      <span>{stats.interviewed}</span>
    </div>
    <div className="stat-item">
      <span>Rejected:</span>
      <span>{stats.rejected}</span>
    </div>
  </div>
));

export default Progress;
