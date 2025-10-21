import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <>
      {showDashboard ? (
        <Dashboard onBack={() => setShowDashboard(false)} />
      ) : (
        <LandingPage onGetStarted={() => setShowDashboard(true)} />
      )}
    </>
  );
}

export default App;
