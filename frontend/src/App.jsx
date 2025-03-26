import './App.css';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/auth';
import VideoMeetComponent from './pages/VideoMeet';
import History from './pages/history';
import HomeComponent from './pages/home';

function App() {

  return (
        <div className="App">
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/home" element={<HomeComponent />} />
                        <Route path="/history" element={<History/>} />
                        <Route path="/:url" element={<VideoMeetComponent />} />
                        <Route path="/auth" element={<Authentication/>} />
                    </Routes>
                </AuthProvider>
            </Router>
        </div>
  )
}

export default App;
