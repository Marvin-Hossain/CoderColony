import "./Intro.css";
import Button from "../components/Button";
import {API_CONFIG} from "@/services/config";

const Intro = () => {
    const handleGithubLogin = (): void => {
        window.location.href = API_CONFIG.BASE_AUTH_URL + API_CONFIG.ENDPOINTS.AUTH.GITHUB;
    };

    const handleGoogleLogin = (): void => {
        window.location.href = API_CONFIG.BASE_AUTH_URL + API_CONFIG.ENDPOINTS.AUTH.GOOGLE;
    };

    return (
        <div className="intro">
            <div className="intro-container">
                {/* Left side - Green Hero Section */}
                <div className="intro-left">
                    <div className="intro-logo">CoderColony</div>
                    <h1 className="intro-heading">Your Dev Career, Together</h1>
                    <p className="intro-subheading">
                        Join a supportive community to track applications, practice interviews, and grow your skills.
                        CoderColony helps you land your next role faster—with peers, resources, and AI tools all in one place.
                    </p>
                    <div className="feature-buttons">
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
                    <Button
                        className="google-login-btn"
                        onClick={handleGoogleLogin}
                        text="Login with Google"
                    />
                    
                    <div className="security-info">
                        <p className="info-text">One click sign-in to access all of your job search data</p>
                        <p className="info-text">Secure authentication via GitHub and Google</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intro;
