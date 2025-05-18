import "./Intro.css";
import Button from "../components/Button";
import {API_CONFIG} from "@/services/config";

const Intro = () => {
    const handleGithubLogin = (): void => {
        window.location.href = API_CONFIG.BASE_AUTH_URL + API_CONFIG.ENDPOINTS.AUTH.GITHUB;
    };

    return (
        <div className="intro">
            <div className="intro-container">
                {/* Left side - Green Hero Section */}
                <div className="intro-left">
                    <div className="intro-logo">JobHuntHub</div>
                    <h1 className="intro-heading">Simplify Your Job Hunt Journey</h1>
                    <p className="intro-subheading">
                        Track applications, practice interviews, and monitor your progress—all in 
                        one place. Let us help you land your dream job faster.
                    </p>
                    <div className="feature-buttons">
                        <button className="feature-button">Track Applications</button>
                        <button className="feature-button">Set Goals</button>
                        <button className="feature-button">Practice Interviews</button>
                    </div>
                </div>
                
                {/* Right side - Login Section */}
                <div className="intro-right">
                    <h2 className="welcome-heading">Welcome Back</h2>
                    <p className="welcome-text">Sign in to access your job hunt dashboard</p>
                    
                    <Button
                        className="github-login-btn"
                        onClick={handleGithubLogin}
                        text="Login with GitHub"
                    />
                    
                    <div className="security-info">
                        <p className="info-text">One click sign-in to access all of your job search data</p>
                        <p className="info-text">Secure authentication via GitHub</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intro;
