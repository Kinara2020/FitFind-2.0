import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchPage from './pages/SearchPage';
import StyleQuiz from './pages/StyleQuiz';
import ExplorePage from './pages/ExplorePage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f0f1a]">
        <Navbar />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/quiz" element={<StyleQuiz />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}