import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { API_CONFIG } from '@/services/config';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async (): Promise<void> => {
        try {
            const response = await fetch(
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
                { method: 'POST', credentials: 'include' }
            );

            if (response.ok) {
                navigate('/');
            } else {
                console.error('Logout failed on server:', await response.text());
                navigate('/');
            }
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/');
        }
    };

    return (
        <Button 
            text="Logout" 
            onClick={handleLogout}
            className="logout-button"
        />
    );
};

export default LogoutButton; 