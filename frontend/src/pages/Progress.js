import React, { useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom';
import "./Progress.css";
import { Line } from "react-chartjs-2";
import Button from "../components/Button";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Progress = () => {
  const [selectedCategory, setSelectedCategory] = useState("jobs");
  const [weeklyData, setWeeklyData] = useState(null);
  const [allTimeStats, setAllTimeStats] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { id: "jobs", label: "Job Applications", goal: 10 },
    // { id: "behavioral", label: "Behavioral Questions", goal: 10 },
    // { id: "technical", label: "Technical Questions", goal: 10 },
    // { id: "leetcode", label: "LeetCode Questions", goal: 0 },
    // { id: "connections", label: "Connections", goal: 0 },
    // { id: "concepts", label: "New Concepts", goal: 0 },
  ];

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/progress/${selectedCategory}`);
      const data = await response.json();
      console.log("Weekly data received:", data);
      setWeeklyData(data);

      const statsResponse = await fetch(`http://localhost:8080/api/progress/${selectedCategory}/all-time`);
      const statsData = await statsResponse.json();
      console.log("Stats data received:", statsData);
      setAllTimeStats(statsData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setWeeklyData(generateSampleData());
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const generateSampleData = () => {
    const dates = [];
    const today = new Date();
    
    // Generate dates for the current week
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = `${date.getMonth() + 1}/${date.getDate()}`;
      dates.push(`${dayName}\n(${monthDay})`);
    }

    const category = categories.find(c => c.id === selectedCategory);
    return {
      dates,
      completions: dates.map(() => Math.floor(Math.random() * (category.goal + 1))),
    };
  };

  const chartData = weeklyData ? {
    labels: weeklyData.dates,
    datasets: [
      {
        label: `${categories.find(c => c.id === selectedCategory)?.label} Completed`,
        data: weeklyData.completions,
        borderColor: '#78c0a8',
        backgroundColor: 'rgba(120, 192, 168, 0.5)',
        tension: 0.1,
      }
    ],
  } : null;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Weekly ${categories.find(c => c.id === selectedCategory)?.label} Progress`,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: false,
          padding: 10
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        max: categories.find(c => c.id === selectedCategory)?.goal + 2,
      },
    },
  };

  const renderStats = () => {
    if (!allTimeStats) return null;
    return (
        <div className="stats">
            <div className="stats-section">
                <h3>All-Time Stats</h3>
                <div className="stat-item">
                    <span>Total Completed:</span>
                    <span>{allTimeStats.total}</span>
                </div>
                <div className="stat-item">
                    <span>Daily Average:</span>
                    <span>{allTimeStats.average}</span>
                </div>
                <div className="stat-item">
                    <span>Best Day:</span>
                    <span>{allTimeStats.bestDay}</span>
                </div>
            </div>
            
            {selectedCategory === 'jobs' && (
                <div className="stats-section">
                    <h3>Status Breakdown</h3>
                    <div className="stat-item">
                        <span>Applied:</span>
                        <span>{allTimeStats.applied}</span>
                    </div>
                    <div className="stat-item">
                        <span>Interviewed:</span>
                        <span>{allTimeStats.interviewed}</span>
                    </div>
                    <div className="stat-item">
                        <span>Rejected:</span>
                        <span>{allTimeStats.rejected}</span>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="progress-page">
      <Button 
        text="Back" 
        onClick={() => navigate('/dashboard')}
        className="back-button"
      />
      <header className="progress-header">
        <h1>Progress Tracker</h1>
        <p>Track your daily and weekly progress</p>
      </header>
      
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="chart-container">
        {renderStats()}
        {chartData && <Line options={options} data={chartData} />}
      </div>
    </div>
  );
};

export default Progress;
