import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import AuthPage from './pages/AuthPage';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';
import CheckIn from './pages/CheckIn';
import Habits from './pages/Habits';
import Nutrition from './pages/Nutrition';
import Exercise from './pages/Exercise';
import Commitments from './pages/Commitments';

const MODULES = [
  ['focus', 'Focus Room', 3], ['journal', 'Journal', 3], ['reset', 'Emotional Reset', 3], ['proof', 'Proof I Can Trust Myself', 3],
  ['weekly-review', 'Weekly Review', 3], ['progress', 'Progress & Analytics', 4], ['settings', 'Settings', 4],
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="check-in" element={<CheckIn />} />
            <Route path="habits" element={<Habits />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="exercise" element={<Exercise />} />
            <Route path="commitments" element={<Commitments />} />
            {MODULES.map(([p, t, ph]) => <Route key={p} path={p} element={<ComingSoon title={t} phase={ph} />} />)}
          </Route>
        </Route>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}
