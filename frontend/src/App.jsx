import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainPage from './components/MainPage'
import RegisterPage from "./components/RegisterPage"
import LoginPage from "./components/LoginPage"
import Welcome from "./components/Welcome"
import './reset.css'
import 'katex/dist/katex.min.css';
import './App.css'

export default function App() {

  return (
    <Router>
      <Routes> 
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<MainPage />} />
      </Routes>
    </Router>
  )
}

