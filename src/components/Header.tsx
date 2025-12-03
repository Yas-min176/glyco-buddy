import { NavLink } from './NavLink';
import { Home, History, Settings, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-3xl animate-bounce-gentle">🐝</span>
            <div>
              <h1 className="text-2xl font-extrabold text-primary tracking-tight">
                Beez
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Guia de Glicemia</p>
            </div>
          </div>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-danger"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/50 z-50 pb-safe">
          <div className="container mx-auto px-2 py-2">
            <div className="flex justify-around items-center">
              <NavLink to="/" icon={Home} label="Início" />
              <NavLink to="/nova-medicao" icon={Plus} label="Medir" primary />
              <NavLink to="/historico" icon={History} label="Histórico" />
              <NavLink to="/configuracoes" icon={Settings} label="Config" />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}