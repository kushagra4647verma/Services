import { useNavigate, useLocation } from 'react-router-dom';
import { GlassWater, Gamepad2, Calendar, Users } from 'lucide-react';

export default function BottomNav({ active }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'sipzy', label: 'SipZy', icon: GlassWater, path: '/' },
    { id: 'games', label: 'GameS', icon: Gamepad2, path: '/games' },
    { id: 'events', label: 'EventS', icon: Calendar, path: '/events' },
    { id: 'social', label: 'SocialZ', icon: Users, path: '/social' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="glass-strong rounded-3xl p-2 flex items-center justify-around max-w-md mx-auto shadow-2xl border border-white/20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id || location.pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              data-testid={`nav-${tab.id}`}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl min-w-[70px] transition-all ${
                isActive ? 'gradient-amber' : 'transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-black' : 'text-white/60'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-black' : 'text-white/60'
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
