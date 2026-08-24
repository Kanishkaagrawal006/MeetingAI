import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewMeeting from './pages/NewMeeting';
import MeetingDetails from './pages/MeetingDetails';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meetings/new" element={<NewMeeting />} />
          <Route path="/meetings/:id" element={<MeetingDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
