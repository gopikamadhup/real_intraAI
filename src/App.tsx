import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import AuthModal from './components/AuthModal';
import CandidateDashboard from './components/CandidateDashboard';
import RecruiterDashboard from "./components/recruiter/RecruiterDashboard";

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [authModal, setAuthModal] = useState<{
    type: 'login' | 'signup';
    role: 'candidate' | 'recruiter';
  } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (user && profile) {
    if (profile.role === 'candidate') {
      return <CandidateDashboard />;
    }
    return <RecruiterDashboard />;
  }

  return (
    <>
      <HomePage
        onAuthSelect={(type, role) => {
          setAuthModal({ type, role });
        }}
      />
      {authModal && (
        <AuthModal
          type={authModal.type}
          role={authModal.role}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
