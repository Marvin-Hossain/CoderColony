import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Progress.css";
import { Line } from "react-chartjs-2";
import Button from "../components/Button";
import { API_CONFIG } from '../services/config';
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

// Move categories to constants
const CATEGORIES = [
  { id: "jobs", label: "Job Applications", goal: 10 },
  // { id: "behavioral", label: "Behavioral Questions", goal: 10 },
  // { id: "technical", label: "Technical Questions", goal: 10 },
  // { id: "leetcode", label: "LeetCode Questions", goal: 0 },
  // { id: "connections", label: "Connections", goal: 0 },
  // { id: "concepts", label: "New Concepts", goal: 0 },
];

// Move API calls to separate service
const progressService = {
  async fetchWeeklyData(category) {
    const response = await fetch(
      API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROGRESS + `/${category}`,
      { credentials: 'include' }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return response.json();
  },

  async fetchAllTimeStats(category) {
    const response = await fetch(
      API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROGRESS + `/${category}/all-time`,
      { credentials: 'include' }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return response.json();
  }
};

const Progress = () => {
  const [selectedCategory, setSelectedCategory] = useState("jobs");
  const [weeklyData, setWeeklyData] = useState(null);
  const [allTimeStats, setAllTimeStats] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Use useCallback for event handlers
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  // Use useMemo for complex calculations
  const chartData = useMemo(() => ({
    labels: weeklyData?.chartData?.map(item => {
      const date = new Date(item.date + 'T00:00:00');
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }) || [],
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

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Weekly ${CATEGORIES.find(c => c.id === selectedCategory)?.label} Progress`,
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
        suggestedMax: CATEGORIES.find(c => c.id === selectedCategory)?.goal + 2
      }
    }
  }), [selectedCategory]);

  // Fetch data with proper error handling
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [weeklyResult, statsResult] = await Promise.all([
        progressService.fetchWeeklyData(selectedCategory),
        progressService.fetchAllTimeStats(selectedCategory)
      ]);
      setWeeklyData(weeklyResult);
      setAllTimeStats(statsResult);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('403')) {
        navigate('/');
        return;
      }
      setError('Failed to fetch progress data');
      console.error('Error fetching progress data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
const StatsSection = React.memo(({ title, stats }) => (
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

const StatusBreakdown = React.memo(({ stats }) => (
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
