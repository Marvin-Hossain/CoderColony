import './Button.css';

interface ButtonProps {
    text: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

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
