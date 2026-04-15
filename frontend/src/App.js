import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import NowPlayingBar from './components/NowPlayingBar';
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Requests from './pages/Requests';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Leaderboard from './pages/Leaderboard';
import RecentlyPlayed from './pages/RecentlyPlayed';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-beat-bg text-white font-body">
          <Navbar />
          <main className="pb-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/recently-played" element={<RecentlyPlayed />} />
            </Routes>
          </main>
          <NowPlayingBar />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
