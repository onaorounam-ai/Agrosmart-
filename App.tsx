import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { FlaskConical, Trophy, BookOpen } from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatInterface } from './components/ChatInterface';
import { QuizSelector } from './components/QuizSelector';
import { QuizPlay } from './components/QuizPlay';
import { KnowledgeBase } from './components/KnowledgeBase';
import { KnowledgeArea } from './data/knowledge';

type Tab = 'laboratoire' | 'quiz' | 'savoir';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('laboratoire');
  const [selectedQuiz, setSelectedQuiz] = useState<KnowledgeArea | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
    }, 3500);
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      <nav className="flex justify-around bg-slate-950/80 border-b border-white/5 p-4 backdrop-blur-xl z-50">
        {[
          { id: 'laboratoire' as Tab, label: 'Labo IA', icon: FlaskConical },
          { id: 'quiz' as Tab, label: 'Évaluation', icon: Trophy },
          { id: 'savoir' as Tab, label: 'Savoir', icon: BookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedQuiz(null);
            }}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-slate-500 hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto relative">
        {activeTab === 'laboratoire' && <ChatInterface userId={user.id} />}

        {activeTab === 'quiz' && !selectedQuiz && (
          <QuizSelector onSelectQuiz={setSelectedQuiz} />
        )}

        {activeTab === 'quiz' && selectedQuiz && (
          <QuizPlay
            quiz={selectedQuiz}
            userId={user.id}
            onBack={() => setSelectedQuiz(null)}
          />
        )}

        {activeTab === 'savoir' && <KnowledgeBase />}
      </main>
    </div>
  );
}

export default App;
