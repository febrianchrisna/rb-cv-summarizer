import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobPostingPage from './pages/JobPostingPage';
import PostJobPage from './pages/PostJobPage';
import JobListingPage from './pages/JobListingPage';
import JobDetailPage from './pages/JobDetailPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JobPostingPage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        <Route path="/job-listing" element={<JobListingPage />} />
        <Route path="/job-detail/:id" element={<JobDetailPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
