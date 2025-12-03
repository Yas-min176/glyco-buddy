import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, History, Settings, Plus } from 'lucide-react';

export function Header() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/nova-medicao', icon: Plus, label: 'Nova Medição' },
    { path: '/historico', icon: History, label: 'Histórico' },
    { path: '/configuracoes', icon: Settings, label: 'Config' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-xl">💉</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:block">
              GlicoGuia
            </span>
          </Link>
          
          <nav className="flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                  "text-sm font-semibold",
                  location.pathname === path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:block">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
