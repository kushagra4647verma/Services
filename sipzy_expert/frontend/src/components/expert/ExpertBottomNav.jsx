import { useNavigate, useLocation } from 'react-router-dom';
import { GlassWater, ClipboardList, User } from 'lucide-react';

export default function ExpertBottomNav({ active }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', label: 'SipZy', icon: GlassWater, path: '/expert' },
    { id: 'tasks', label: 'Expert Tasks', icon: ClipboardList, path: '/expert/tasks' },
    { id: 'profile', label: 'Profile', icon: User, path: '/expert/profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="glass-strong rounded-3xl p-2 flex items-center justify-around max-w-md mx-auto shadow-2xl border border-purple-500/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id || location.pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              data-testid={`expert-nav-${tab.id}`}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl min-w-[70px] transition-all ${
                isActive ? 'bg-gradient-to-r from-purple-600 to-purple-400' : 'transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-white' : 'text-white/60'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-white' : 'text-white/60'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
