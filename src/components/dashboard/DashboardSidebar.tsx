import { Link, useLocation } from 'react-router-dom';
import { Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function DashboardSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border h-screen p-4 flex flex-col">
      <div className="flex-1 space-y-2">
        <Link to="/dashboard">
          <Button
            variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </Button>
        </Link>
        
        <Link to="/dashboard/settings">
          <Button
            variant={location.pathname === '/dashboard/settings' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </Link>
      </div>

      <Button variant="outline" onClick={signOut} className="w-full">
        Sair
      </Button>
    </div>
  );
}