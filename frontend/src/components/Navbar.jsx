import './Navbar.css'
import { Link } from "react-router-dom"
export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="icon">
                <img src={"/icon.svg"} alt="icon" />
            </div>
            <div className="logo">
                <img src={"/logo.svg"} alt="logo" />
            </div>
            <div className="auth-buttons">
                <Link to="/login" className="auth-button login-button"></Link>
                <Link to="/register" className="auth-button register-button"></Link>
            </div>
        </nav>

    );
}