import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Button from "../components/Button"; // Reusable Button component

const Dashboard = () => {
    const [jobCount, setJobCount] = useState(0);
    const [behavioralCount, setBehavioralCount] = useState(0);
    const jobGoal = 10;
    const behavioralGoal = 10;

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch job count
                const jobResponse = await fetch('http://localhost:8080/api/jobs/count');
                const jobData = await jobResponse.json();
                setJobCount(jobData.count);

                // Fetch behavioral questions count
                const behavioralResponse = await fetch('http://localhost:8080/api/behavioral/count');
                const behavioralData = await behavioralResponse.json();
                setBehavioralCount(behavioralData.count);
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };

        fetchCounts();
    }, []);

    return (
        <div className="dashboard">
            <Button 
                text="Progress"
                onClick={() => (window.location.href = "/progress")}
                style={{ position: 'absolute', top: '1rem', left: '1rem' }}
            />
            <header className="dashboard-header">
                <h1>Welcome to Your Dashboard</h1>
                <p>Track your progress and stay on top of your goals.</p>
            </header>

            <main className="dashboard-main">
                {/* Daily Goals Section */}
                <section className="daily-goals">
                    <h2>Daily Goals</h2>
                    <div className="goal">
                        <p>Apply to {jobGoal} Jobs</p>
                        <progress value={jobCount} max={jobGoal}></progress>
                        <span>{jobCount}/{jobGoal}</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/job-apps")} className="go-button" />
                    </div>
                    <div className="goal">
                        <p>Practice Behavioral Qs</p>
                        <progress value={behavioralCount} max={behavioralGoal}></progress>
                        <span>{behavioralCount}/{behavioralGoal}</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/behavioral-questions")} className="go-button" />
                    </div>
                    <div className="goal">
                        <p>Practice Technical Qs</p>
                        <progress value={1} max="5"></progress>
                        <span>1/5</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/technical-questions")} className="go-button" />
                    </div>
                    <div className="goal">
                        <p>Practice LeetCode Qs</p>
                        <progress value={2} max="5"></progress>
                        <span>2/5</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/leetcode")} className="go-button" />
                    </div>
                </section>

                {/* Weekly Goals Section */}
                <section className="weekly-goals">
                    <h2>Weekly Goals</h2>
                    <div className="goal">
                        <p>Contact Connections</p>
                        <progress value={2} max="5"></progress>
                        <span>2/5</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/connections")} className="go-button" />
                    </div>
                    <div className="goal">
                        <p>Learn New Concepts</p>
                        <progress value={1} max="5"></progress>
                        <span>1/5</span>
                        <Button text="Go!" onClick={() => (window.location.href = "/new-concepts")} className="go-button" />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
