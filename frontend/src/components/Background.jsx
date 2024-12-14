
import './Background.css';

const Background = ({ children }) => {
    return (
        <div className="background">
            <div className="divider" />
            {children}
        </div>
    );
};

export default Background;
