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

    // const handleLinkedinLogin = (): void => {
    //     window.location.href = API_CONFIG.BASE_AUTH_URL + API_CONFIG.ENDPOINTS.AUTH.LINKEDIN;
    // };

    return (
        <div className="intro">
            <div className="intro-container">
                <div className="intro-message">
                    Welcome to your AI-Powered Daily Progress! Organize your day, optimize your time, and stay
                    productive!
                </div>
                <div className="login-buttons-container">
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
                    {/* <Button
                        className="linkedin-login-btn"
                        onClick={handleLinkedinLogin}
                        text="Login with LinkedIn"
                    /> */}
                </div>
            </div>
        </div>
    );
};

export default Intro;
