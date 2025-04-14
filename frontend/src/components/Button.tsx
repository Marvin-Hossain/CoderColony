import './Button.css';  // Import the CSS file for the button

// This just tells us what props our Button can accept
interface ButtonProps {
    text: string;
    onClick?: () => void;  // Make onClick optional
    className?: string;   // optional string
    disabled?: boolean;   // optional boolean
    type?: 'button' | 'submit' | 'reset';  // Add type prop
}

// Remove React.FC
const Button = ({
    onClick,
    text,
    className = '',
    disabled = false,
    type = 'button'
}: ButtonProps) => {
    return (
        <button
            className={`custom-button ${className}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {text}
        </button>
    );
};

export default Button;
