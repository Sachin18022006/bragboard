import LeaderboardWidget from './LeaderboardWidget';
import TopTaggedWidget from './TopTaggedWidget';
import RecentReactionsWidget from './RecentReactionsWidget';
import './Sidebar.css';

function Sidebar({ refreshTrigger }) {
  return (
    <aside className="dashboard-sidebar">
      <LeaderboardWidget refreshTrigger={refreshTrigger} />
      <TopTaggedWidget refreshTrigger={refreshTrigger} />
      <RecentReactionsWidget refreshTrigger={refreshTrigger} />
    </aside>
  );
}

export default Sidebar;

