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
      const response = await fetch(`http://localhost:8080/api/progress/${selectedCategory}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/');
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Weekly data received:", data);
      setWeeklyData(data);

      const statsResponse = await fetch(
        `http://localhost:8080/api/progress/${selectedCategory}/all-time`,
        { credentials: 'include' }
      );
      
      if (!statsResponse.ok) {
        if (statsResponse.status === 401 || statsResponse.status === 403) {
          navigate('/');
          return;
        }
        throw new Error(`Error: ${statsResponse.status}`);
      }
      
      const statsData = await statsResponse.json();
      console.log("Stats data received:", statsData);
      setAllTimeStats(statsData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setWeeklyData(null);
      setAllTimeStats(null);
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

  const chartData = {
    labels: weeklyData?.chartData?.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }) || [],
    datasets: [
      {
        label: categories.find(c => c.id === selectedCategory)?.label || '',
        data: weeklyData?.chartData?.map(item => item.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        suggestedMax: categories.find(c => c.id === selectedCategory)?.goal + 2
      }
    }
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

      {renderStats()}

      <div className="chart-container" style={{ height: '400px', width: '100%' }}>
        {weeklyData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div>Loading chart data...</div>
        )}
      </div>
    </div>
  );
};

export default Progress;
