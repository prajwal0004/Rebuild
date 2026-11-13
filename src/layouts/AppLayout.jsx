import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, HeartPulse, CheckSquare, ListChecks, Timer, BookOpen, LifeBuoy, ShieldCheck, BarChart3, CalendarCheck, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  ['/', 'Dashboard', LayoutDashboard], ['/check-in', 'Emotional Check-in', HeartPulse],
  ['/habits', 'Habit Tracker', CheckSquare], ['/commitments', 'Daily Commitments', ListChecks],
  ['/focus', 'Focus Room', Timer], ['/journal', 'Journal', BookOpen],
  ['/reset', 'Emotional Reset', LifeBuoy], ['/proof', 'Proof I Can Trust Myself', ShieldCheck],
  ['/progress', 'Progress & Analytics', BarChart3], ['/weekly-review', 'Weekly Review', CalendarCheck],
  ['/settings', 'Settings', Settings],
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">REBUILD</div>
        <nav>
          {NAV.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <span className="muted small">{user?.email}</span>
          <button className="nav-item" onClick={signOut}><LogOut size={17} />Sign out</button>
        </div>
      </aside>
      <main className="content"><Outlet /></main>
      <aside className="rightpanel">
        <h3>Today</h3>
        <p className="muted small">Priorities, habit completion and quick actions appear here once the tracking modules are added in Phase 2.</p>
      </aside>
    </div>
  );
}
