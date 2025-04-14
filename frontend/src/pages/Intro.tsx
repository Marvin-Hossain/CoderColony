import "./Intro.css";
import Button from "../components/Button";
import { API_CONFIG } from "@/services/config";

const Intro = () => {
    
    const handleGithubLogin = (): void => {
        window.location.href = API_CONFIG.BASE_AUTH_URL + API_CONFIG.ENDPOINTS.AUTH.GITHUB;
    };
    
    return (
        <div className="intro">
            <div className="intro-container">
                <div className="intro-message">
                    Welcome to your AI-Powered Daily Progress! Organize your day, optimize your time, and stay productive!
                </div>
                <Button 
                    className="github-login-btn" 
                    onClick={handleGithubLogin}
                    text="Login with GitHub"
                />
            </div>
        </div>
    );
};

export default Intro;
